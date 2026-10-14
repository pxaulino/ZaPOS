const locks = new WeakMap()

// A fixed body also locks iOS Safari. Nested dialogs share the same saved position.
export function lockModalScroll(doc = document) {
  let state = locks.get(doc)
  if (!state) {
    const body = doc.body
    const html = doc.documentElement
    const view = doc.defaultView
    const root = doc.getElementById('root')
    const keys = ['position', 'top', 'left', 'width', 'overflow', 'paddingRight']
    state = {
      count: 0, x: view.scrollX, y: view.scrollY, root, inert: root?.inert,
      body: Object.fromEntries(keys.map((key) => [key, body.style[key]])),
      overflow: html.style.overflow, behavior: html.style.scrollBehavior,
    }
    const scrollbar = html.clientWidth ? Math.max(0, view.innerWidth - html.clientWidth) : 0
    if (scrollbar) body.style.paddingRight = `${parseFloat(view.getComputedStyle(body).paddingRight || '0') + scrollbar}px`
    Object.assign(body.style, { position: 'fixed', top: `-${state.y}px`, left: `-${state.x}px`, width: '100%', overflow: 'hidden' })
    html.style.overflow = 'hidden'
    if (root) root.inert = true
    locks.set(doc, state)
  }
  state.count++
  let released = false
  return () => {
    if (released) return
    released = true
    if (--state.count) return
    Object.assign(doc.body.style, state.body)
    doc.documentElement.style.overflow = state.overflow
    if (state.root) state.root.inert = state.inert
    doc.documentElement.style.scrollBehavior = 'auto'
    doc.defaultView.scrollTo(state.x, state.y)
    doc.documentElement.style.scrollBehavior = state.behavior
    locks.delete(doc)
  }
}
