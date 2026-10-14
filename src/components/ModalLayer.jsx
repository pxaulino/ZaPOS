import { useEffect, useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { lockModalScroll } from '../lib/modalScrollLock'

export default function ModalLayer({ children, className = 'modal-backdrop', onDismiss, focusKey }) {
  const layer = useRef(null)
  const dismiss = useRef(onDismiss)
  dismiss.current = onDismiss
  const previousFocus = useRef(document.activeElement)
  useLayoutEffect(() => lockModalScroll(), [])
  useEffect(() => {
    const element = layer.current
    const viewport = window.visualViewport
    const updateViewport = () => {
      if (!viewport) return
      element.style.setProperty('--modal-viewport-height', `${viewport.height}px`)
      element.style.setProperty('--modal-viewport-top', `${viewport.offsetTop}px`)
    }
    updateViewport()
    viewport?.addEventListener('resize', updateViewport)
    viewport?.addEventListener('scroll', updateViewport)
    const first = element.querySelector('[data-modal-initial-focus], [data-note-initial-focus]') || element.querySelector('button, input, select, textarea')
    first?.focus({ preventScroll: true })
    const onKey = (event) => {
      const layers = document.querySelectorAll('[data-modal-layer]')
      if (layers[layers.length - 1] !== element) return
      if (event.key === 'Escape') {
        event.preventDefault()
        dismiss.current?.()
      }
      if (event.key !== 'Tab') return
      const controls = [...element.querySelectorAll('button, input, select, textarea, [tabindex="0"]')].filter((control) => !control.matches(':disabled, [hidden]'))
      const firstControl = controls[0]
      const lastControl = controls.at(-1)
      if (event.shiftKey && (document.activeElement === firstControl || !controls.includes(document.activeElement))) {
        event.preventDefault(); lastControl?.focus()
      } else if (!event.shiftKey && (document.activeElement === lastControl || !controls.includes(document.activeElement))) {
        event.preventDefault(); firstControl?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      viewport?.removeEventListener('resize', updateViewport)
      viewport?.removeEventListener('scroll', updateViewport)
      document.removeEventListener('keydown', onKey)
      if (previousFocus.current?.isConnected) previousFocus.current.focus({ preventScroll: true })
    }
  }, [focusKey])
  return createPortal(
    <div ref={layer} data-modal-layer className={className} onClick={(event) => { if (event.target === event.currentTarget) dismiss.current?.() }}>
      {children}
    </div>, document.body
  )
}
