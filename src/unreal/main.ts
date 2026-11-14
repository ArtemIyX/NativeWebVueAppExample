import { createRenderer, type RendererOptions } from '@vue/runtime-core'

import App from '../App.vue'
import './style.css'

type HostElement = {
  kind: 'element'
  id: number
  parent: HostElement | null
  children: HostNode[]
  className: string
}

type HostCharacterData = {
  kind: 'text' | 'comment'
  id: number
  text: string
  parent: HostElement | null
}

type HostNode = HostElement | HostCharacterData

const clickHandlers = new Map<number, () => void>()

Object.assign(globalThis, {
  __nativeWebClick(nodeId: number) {
    clickHandlers.get(nodeId)?.()
  },
})

function assertQueued(accepted: boolean, operation: string): void {
  if (!accepted) throw new Error(`NativeWeb rejected ${operation}`)
}

function updateClass(element: HostElement): void {
  const classes = [element.className]
  if (clickHandlers.has(element.id)) classes.push(`nativeweb-click-${element.id}`)
  assertQueued(
    nativeWeb.setAttribute(element.id, 'class', classes.filter(Boolean).join(' ')),
    'class update',
  )
}

function forgetClickHandlers(node: HostNode): void {
  if (node.kind !== 'element') return
  clickHandlers.delete(node.id)
  node.children.forEach(forgetClickHandlers)
}

function createCharacterData(kind: 'text' | 'comment', text: string): HostCharacterData {
  return {
    kind,
    id: kind === 'text' ? nativeWeb.createText(text) : nativeWeb.createComment(text),
    text,
    parent: null,
  }
}

function detachFromParent(node: HostNode): void {
  if (!node.parent) return
  const index = node.parent.children.indexOf(node)
  if (index >= 0) node.parent.children.splice(index, 1)
  node.parent = null
}

const hostOptions: RendererOptions<HostNode, HostElement> = {
  createElement(tag, namespace) {
    return {
      kind: 'element',
      id: nativeWeb.createElement(tag, namespace === 'svg' ? 'svg' : undefined),
      parent: null,
      children: [],
      className: '',
    }
  },
  createText(text) {
    return createCharacterData('text', text)
  },
  createComment(text) {
    return createCharacterData('comment', text)
  },
  setText(node, text) {
    if (node.kind === 'element') throw new Error('setText requires a text or comment node')
    assertQueued(nativeWeb.setNodeText(node.id, text), 'text update')
    node.text = text
  },
  setElementText(element, text) {
    const [existing] = element.children
    if (text && element.children.length === 1 && existing?.kind === 'text') {
      hostOptions.setText(existing, text)
      return
    }
    for (const child of [...element.children]) hostOptions.remove(child)
    if (text.length === 0) return
    const textNode = createCharacterData('text', text)
    hostOptions.insert(textNode, element, null)
  },
  insert(node, parent, anchor = null) {
    if (node === anchor) return
    if (anchor && anchor.parent !== parent)
      throw new Error('Insertion anchor is not a child of its parent')

    assertQueued(nativeWeb.insertBefore(parent.id, node.id, anchor?.id ?? null), 'node insertion')
    detachFromParent(node)
    const anchorIndex = anchor ? parent.children.indexOf(anchor) : -1
    if (anchor && anchorIndex < 0) throw new Error('Insertion anchor is missing from the host tree')
    parent.children.splice(anchor ? anchorIndex : parent.children.length, 0, node)
    node.parent = parent
  },
  remove(node) {
    if (!node.parent) return
    assertQueued(nativeWeb.remove(node.id), 'node removal')
    detachFromParent(node)
    forgetClickHandlers(node)
  },
  patchProp(element, key, _previousValue, nextValue) {
    if (key === 'class') {
      element.className = nextValue == null ? '' : String(nextValue)
      updateClass(element)
      return
    }
    if (key === 'onClick') {
      if (typeof nextValue === 'function') {
        if (!clickHandlers.has(element.id)) {
          assertQueued(nativeWeb.setClickHandler(element.id), 'click registration')
        }
        clickHandlers.set(element.id, nextValue as () => void)
      } else {
        clickHandlers.delete(element.id)
      }
      updateClass(element)
      return
    }
    if (/^on[A-Z]/.test(key)) return

    if (nextValue == null || nextValue === false) {
      assertQueued(nativeWeb.removeAttribute(element.id, key), `removal of ${key}`)
      return
    }

    assertQueued(
      nativeWeb.setAttribute(element.id, key, nextValue === true ? '' : String(nextValue)),
      `update of ${key}`,
    )
  },
  parentNode(node) {
    return node.parent
  },
  nextSibling(node) {
    const parent = node.parent
    if (!parent) return null
    const index = parent.children.indexOf(node)
    return index >= 0 ? (parent.children[index + 1] ?? null) : null
  },
}

const renderer = createRenderer<HostNode, HostElement>(hostOptions)
const rootId = nativeWeb.mountRoot('app')
const root: HostElement = {
  kind: 'element',
  id: rootId,
  parent: null,
  children: [],
  className: '',
}

renderer.createApp(App).mount(root)
