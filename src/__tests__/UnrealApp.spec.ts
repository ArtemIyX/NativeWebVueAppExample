import { runInNewContext } from 'node:vm'
import { build } from 'vite'
import { expect, it } from 'vitest'

it('mounts the shared app and updates its count through NativeWeb clicks', async () => {
  const bundle = await build({
    configFile: 'vite.unreal.config.ts',
    build: { write: false },
    logLevel: 'silent',
  })
  const result = Array.isArray(bundle) ? bundle[0] : bundle
  if (!result || !('output' in result)) throw new Error('Expected an in-memory Unreal bundle')

  const script = result.output.find((file) => file.fileName === 'ui.js')
  const stylesheet = result.output.find((file) => file.fileName === 'ui.css')
  if (script?.type !== 'chunk' || stylesheet?.type !== 'asset') {
    throw new Error('Expected both ui.js and ui.css in the Unreal bundle')
  }
  expect(stylesheet.source).toContain('.counter-card')

  const root = document.createElement('div')
  root.id = 'app'
  const nodes = new Map<number, Node>()
  const clickHandlers = new Set<number>()

  function addNode(node: Node) {
    const id = nodes.size + 1
    nodes.set(id, node)
    return id
  }

  function nodeFor(id: number) {
    const node = nodes.get(id)
    if (!node) throw new Error(`Unknown NativeWeb node ${id}`)
    return node
  }

  function elementFor(id: number) {
    const node = nodeFor(id)
    if (!(node instanceof Element)) throw new Error(`NativeWeb node ${id} is not an element`)
    return node
  }

  const svgNamespace = 'http://www.w3.org/2000/svg'
  const nativeWeb = {
    mountRoot(id: string) {
      expect(id).toBe(root.id)
      return addNode(root)
    },
    createElement(tag: string, namespace?: string) {
      return addNode(
        namespace === 'svg'
          ? document.createElementNS(svgNamespace, tag)
          : document.createElement(tag),
      )
    },
    createText: (text: string) => addNode(document.createTextNode(text)),
    createComment: (text: string) => addNode(document.createComment(text)),
    insertBefore(parentId: number, nodeId: number, anchorId: number | null) {
      nodeFor(parentId).insertBefore(nodeFor(nodeId), anchorId === null ? null : nodeFor(anchorId))
      return true
    },
    remove(nodeId: number) {
      const node = nodeFor(nodeId)
      node.parentNode?.removeChild(node)
      return true
    },
    setNodeText(nodeId: number, text: string) {
      nodeFor(nodeId).textContent = text
      return true
    },
    setAttribute(nodeId: number, name: string, value: string) {
      elementFor(nodeId).setAttribute(name, value)
      return true
    },
    removeAttribute(nodeId: number, name: string) {
      elementFor(nodeId).removeAttribute(name)
      return true
    },
    setClickHandler(nodeId: number) {
      clickHandlers.add(nodeId)
      return true
    },
  }

  const context: { nativeWeb: typeof nativeWeb; __nativeWebClick?: (nodeId: number) => void } = {
    nativeWeb,
  }
  runInNewContext(script.code, context, { filename: 'ui.js' })

  async function click(selector: string) {
    const button = root.querySelector(selector)
    const nodeId = [...nodes].find(([, node]) => node === button)?.[0]
    if (nodeId === undefined || !context.__nativeWebClick) {
      throw new Error(`No NativeWeb click target for ${selector}`)
    }
    expect(clickHandlers.has(nodeId)).toBe(true)
    expect(button?.classList.contains(`nativeweb-click-${nodeId}`)).toBe(true)
    context.__nativeWebClick(nodeId)
    await Promise.resolve()
  }

  expect(root.querySelector('.page-shell .counter-card h1')?.textContent).toBe(
    'A little progress adds up.',
  )
  expect(root.querySelector('.button-primary')?.textContent).toContain('Add one')
  expect(root.querySelector('.button-secondary')?.textContent).toContain('Reset')
  expect(root.querySelector('.button-secondary svg path')?.namespaceURI).toBe(svgNamespace)

  const output = root.querySelector('output.count-value')
  expect(output?.textContent).toBe('0')
  await click('.button-primary')
  expect(output?.textContent).toBe('1')
  await click('.button-secondary')
  expect(output?.textContent).toBe('0')
  expect(root.querySelector('output.count-value')).toBe(output)
})
