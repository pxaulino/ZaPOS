import assert from 'node:assert/strict'
import { test } from 'node:test'
import { JSDOM } from 'jsdom'
import { lockModalScroll } from '../src/lib/modalScrollLock.js'

test('nested modals lock the background on mobile and restore scroll only after the last closes', () => {
  const dom = new JSDOM('<div id="root"></div>')
  const { document } = dom.window
  dom.window.scrollY = 480
  document.body.style.paddingRight = '8px'
  document.documentElement.style.scrollBehavior = 'smooth'
  const positions = []
  dom.window.scrollTo = (x, y) => positions.push([x, y])
  const releaseFirst = lockModalScroll(document)
  const releaseSecond = lockModalScroll(document)
  assert.equal(document.body.style.position, 'fixed')
  assert.equal(document.body.style.top, '-480px')
  assert.equal(document.getElementById('root').inert, true)
  assert.equal(document.documentElement.style.overflow, 'hidden')
  releaseFirst()
  releaseFirst()
  assert.equal(document.body.style.position, 'fixed')
  assert.equal(positions.length, 0)
  releaseSecond()
  assert.equal(document.body.style.position, '')
  assert.equal(document.body.style.paddingRight, '8px')
  assert.equal(document.documentElement.style.overflow, '')
  assert.equal(document.documentElement.style.scrollBehavior, 'smooth')
  assert.notEqual(document.getElementById('root').inert, true)
  assert.deepEqual(positions, [[0, 480]])
  dom.window.close()
})
