/// <reference path="../unreal/native-web.d.ts" />

import { onBeforeUnmount, ref, watch, type Ref } from 'vue'

export type NativeImageStatus = 'loading' | 'ready' | 'error'

export interface NativeImageRequest {
  provider: Readonly<Ref<string>>
  imageKey: Readonly<Ref<string>>
  onLoad?: () => void
  onError?: (message: string) => void
}

export function useNativeImage({ provider, imageKey, onLoad, onError }: NativeImageRequest) {
  const src = ref<string>()
  const status = ref<NativeImageStatus>('loading')
  const error = ref<string>()
  let lease = 0
  let generation = 0
  let unsubscribe: (() => void) | undefined

  function releaseCurrent(): void {
    generation++
    src.value = undefined
    error.value = undefined
    unsubscribe?.()
    unsubscribe = undefined
    if (lease && typeof nativeWeb !== 'undefined') nativeWeb.releaseImage(lease)
    lease = 0
  }

  watch([provider, imageKey], ([nextProvider, nextKey]) => {
    releaseCurrent()
    status.value = 'loading'

    if (typeof nativeWeb === 'undefined') {
      const message = 'NativeWeb image bridge is unavailable'
      error.value = message
      status.value = 'error'
      onError?.(message)
      return
    }

    const requestGeneration = generation
    unsubscribe = nativeWeb.addImageListener((event) => {
      if (event.lease !== lease || requestGeneration !== generation) return
      if (event.status === 'ready' && event.url) {
        src.value = event.url
        status.value = 'ready'
        onLoad?.()
        return
      }

      const message = event.error ?? 'Image request failed'
      error.value = message
      status.value = 'error'
      onError?.(message)
    })

    lease = nativeWeb.requestImage(nextProvider, nextKey)
    if (!lease) {
      unsubscribe?.()
      unsubscribe = undefined
      const message = 'NativeWeb rejected the image request'
      error.value = message
      status.value = 'error'
      onError?.(message)
    }
  }, { immediate: true })

  onBeforeUnmount(releaseCurrent)
  return { src, status, error }
}
