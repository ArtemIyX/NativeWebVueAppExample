interface NativeWebBridge {
  requestImage(provider: string, key: string): number
  releaseImage(lease: number): boolean
  addImageListener(listener: (event: NativeWebImageEvent) => void): () => void
  mountRoot(elementId: string): number
  createElement(tagName: string, namespace?: 'svg'): number
  createText(text: string): number
  createComment(text: string): number
  insertBefore(parentId: number, nodeId: number, anchorId: number | null): boolean
  remove(nodeId: number): boolean
  setNodeText(nodeId: number, text: string): boolean
  setAttribute(nodeId: number, name: string, value: string): boolean
  removeAttribute(nodeId: number, name: string): boolean
  setClickHandler(nodeId: number): boolean
}

interface NativeWebImageEvent {
  lease: number
  status: 'ready' | 'error'
  url?: string
  width?: number
  height?: number
  error?: string
}

declare const nativeWeb: NativeWebBridge
