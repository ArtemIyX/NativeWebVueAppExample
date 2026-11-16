import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import NativeImage from '../components/NativeImage.vue'

type ImageEvent = { lease: number; status: 'ready' | 'error'; url?: string; error?: string }

function installBridge() {
  let nextLease = 1
  const listeners = new Set<(event: ImageEvent) => void>()
  const requests: Array<{ provider: string; key: string; lease: number }> = []
  const releases: number[] = []
  const bridge = {
    requestImage(provider: string, key: string) {
      const lease = nextLease++
      requests.push({ provider, key, lease })
      return lease
    },
    releaseImage(lease: number) {
      releases.push(lease)
      return true
    },
    addImageListener(listener: (event: ImageEvent) => void) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
  vi.stubGlobal('nativeWeb', bridge)
  return {
    requests,
    releases,
    dispatch(event: ImageEvent) { listeners.forEach((listener) => listener(event)) },
    listenerCount: () => listeners.size,
  }
}

afterEach(() => vi.unstubAllGlobals())

describe('NativeImage', () => {
  it('shows loading then the ready URL and overlay slot', async () => {
    const bridge = installBridge()
    const wrapper = mount(NativeImage, {
      props: { provider: 'asset', imageKey: '/Game/UI/T_Icon.T_Icon', alt: 'Icon' },
      slots: {
        loading: '<span>Loading image</span>',
        default: '<span class="overlay">Overlay</span>',
      },
    })

    expect(wrapper.text()).toContain('Loading image')
    expect(bridge.requests).toEqual([{ provider: 'asset', key: '/Game/UI/T_Icon.T_Icon', lease: 1 }])
    bridge.dispatch({ lease: 1, status: 'ready', url: 'nativeweb-image://2/1' })
    await wrapper.vm.$nextTick()

    expect(wrapper.find('img').attributes()).toMatchObject({ src: 'nativeweb-image://2/1', alt: 'Icon' })
    expect(wrapper.find('.overlay').exists()).toBe(true)
    expect(wrapper.emitted('load')).toHaveLength(1)
    expect(wrapper.attributes('data-state')).toBe('ready')
  })

  it('shows errors and emits the failure message', async () => {
    const bridge = installBridge()
    const wrapper = mount(NativeImage, {
      props: { provider: 'asset', imageKey: '/Game/UI/Missing.Missing' },
      slots: { error: '<span class="error-slot">Texture unavailable</span>' },
    })
    bridge.dispatch({ lease: 1, status: 'error', error: 'Texture asset failed to load.' })
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.error-slot').text()).toBe('Texture unavailable')
    expect(wrapper.emitted('error')).toEqual([['Texture asset failed to load.']])
  })

  it('releases changed leases and ignores stale events', async () => {
    const bridge = installBridge()
    const wrapper = mount(NativeImage, { props: { provider: 'asset', imageKey: 'first' } })
    await wrapper.setProps({ imageKey: 'second' })
    bridge.dispatch({ lease: 1, status: 'ready', url: 'nativeweb-image://1/1' })
    bridge.dispatch({ lease: 2, status: 'ready', url: 'nativeweb-image://1/2' })
    await wrapper.vm.$nextTick()

    expect(bridge.releases).toEqual([1])
    expect(bridge.requests.map(({ key }) => key)).toEqual(['first', 'second'])
    expect(wrapper.find('img').attributes('src')).toBe('nativeweb-image://1/2')
    expect(wrapper.emitted('load')).toHaveLength(1)
  })

  it('unsubscribes and releases on unmount', () => {
    const bridge = installBridge()
    const wrapper = mount(NativeImage, { props: { provider: 'asset', imageKey: 'icon' } })
    expect(bridge.listenerCount()).toBe(1)
    wrapper.unmount()
    expect(bridge.listenerCount()).toBe(0)
    expect(bridge.releases).toEqual([1])
  })

  it('reports immediate request rejection', () => {
    vi.stubGlobal('nativeWeb', {
      addImageListener: () => () => undefined,
      releaseImage: () => true,
      requestImage: () => 0,
    })
    const wrapper = mount(NativeImage, { props: { provider: 'asset', imageKey: 'icon' } })
    expect(wrapper.attributes('data-state')).toBe('error')
    expect(wrapper.emitted('error')?.[0]?.[0]).toBe('NativeWeb rejected the image request')
  })
})
