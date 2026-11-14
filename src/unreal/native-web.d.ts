interface NativeWebBridge {
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

declare const nativeWeb: NativeWebBridge
