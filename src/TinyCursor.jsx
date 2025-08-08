import { useEffect, useRef } from 'react'

const CURSOR_SIZE = 15 // px diameter of the inner dot
const RING_SIZE = 35 // px diameter of the outer ring
const RING_STROKE = 0.75 // px ring border thickness (default)
const RING_STROKE_HOVER = 0.75 // px border thickness when ring is enlarged (thinner look)
const CURSOR_COLOR = 'rgba(0,0,0,0.85)'
const CURSOR_COLOR_LIGHT = 'rgba(255,255,255,0.95)'
const FOLLOW_EASE = 0.15
const ENABLE_MIX_BLEND_FALLBACK = true // use mix-blend-mode when helpful
const RING_SCALE_HOVER = 2 // how much the ring grows on interactive elements
const RING_SCALE_TRANSITION_MS = 420 // ms for the ring scale (slower animation)

function parseRGB(colorString) {
  if (!colorString) return null
  const m = colorString.match(/rgba?\(([^)]+)\)/)
  if (!m) return null
  const parts = m[1].split(',').map(p => parseFloat(p.trim()))
  return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] }
}

function relativeLuminance({ r, g, b }) {
  const Rs = r / 255
  const Gs = g / 255
  const Bs = b / 255
  const linear = v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  const R = linear(Rs)
  const G = linear(Gs)
  const B = linear(Bs)
  return 0.2126 * R + 0.7152 * G + 0.0722 * B
}

function isInteractiveNode(node) {
  if (!node) return false
  const interactive = node.closest && node.closest('a, button, input, textarea, select, [role="button"], [role="link"]')
  return !!interactive
}

function Cursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const mouse = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
  const ringPos = useRef({ x: mouse.current.x, y: mouse.current.y })
  const rafRef = useRef(null)
  const ringScale = useRef(1)
  const styleElRef = useRef(null)

  useEffect(() => {
    const dot = dotRef.current
    const ring = ringRef.current
    let isTouch = false

    // inject a tiny stylesheet to hide native cursors everywhere
    const styleEl = document.createElement('style')
    styleEl.id = 'tiny-cursor-global-style'
    styleEl.innerHTML = `* { cursor: none !important }`
    document.head.appendChild(styleEl)
    styleElRef.current = styleEl

    function getEffectiveBackgroundNode(x, y) {
      let node = document.elementFromPoint(x, y)
      if (!node) return null
      if (node === dot || node === ring) {
        const prevDot = dot && dot.style.display
        const prevRing = ring && ring.style.display
        if (dot) dot.style.display = 'none'
        if (ring) ring.style.display = 'none'
        const reNode = document.elementFromPoint(x, y)
        if (dot) dot.style.display = prevDot
        if (ring) ring.style.display = prevRing
        node = reNode || node
      }
      return node
    }

    function findNonTransparentBackground(node) {
      let n = node
      while (n && n !== document.documentElement) {
        const cs = window.getComputedStyle(n)
        const bg = cs.backgroundColor
        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') return { node: n, color: bg }
        n = n.parentElement
      }
      return null
    }

    function isDarkAtPoint(x, y) {
      const node = getEffectiveBackgroundNode(x, y)
      if (!node) return null
      if (node.tagName === 'IMG') return null
      const found = findNonTransparentBackground(node)
      if (!found) return null
      const rgb = parseRGB(found.color)
      if (!rgb) return null
      const lum = relativeLuminance(rgb)
      return lum < 0.5
    }

    function applyAdaptiveStyle(x, y) {
      if (!dot || !ring) return
      const dark = isDarkAtPoint(x, y)
      if (dark === null) {
        if (ENABLE_MIX_BLEND_FALLBACK) {
          dot.style.mixBlendMode = 'difference'
          dot.style.background = 'white'
          dot.style.boxShadow = '0 0 0 1px rgba(255,255,255,0.06)'
          ring.style.mixBlendMode = 'difference'
          ring.style.borderColor = 'white'
        } else {
          dot.style.mixBlendMode = ''
          dot.style.background = CURSOR_COLOR
          dot.style.boxShadow = '0 0 0 1px rgba(0,0,0,0.04)'
          ring.style.mixBlendMode = ''
          ring.style.borderColor = CURSOR_COLOR
        }
      } else if (dark) {
        dot.style.mixBlendMode = ''
        dot.style.background = CURSOR_COLOR_LIGHT
        dot.style.boxShadow = '0 0 0 1px rgba(255,255,255,0.06)'
        ring.style.mixBlendMode = ''
        ring.style.borderColor = CURSOR_COLOR_LIGHT
      } else {
        dot.style.mixBlendMode = ''
        dot.style.background = CURSOR_COLOR
        dot.style.boxShadow = '0 0 0 1px rgba(0,0,0,0.04)'
        ring.style.mixBlendMode = ''
        ring.style.borderColor = CURSOR_COLOR
      }
    }

    function onMove(e) {
      if (e.touches && e.touches[0]) {
        isTouch = true
        return
      }
      mouse.current.x = e.clientX
      mouse.current.y = e.clientY
      if (dot) dot.style.opacity = '1'
      if (ring) ring.style.opacity = '1'

      // place inner dot using left/top so translate(-50%,-50%) keeps it centered
      if (dot) {
        dot.style.left = `${mouse.current.x}px`
        dot.style.top = `${mouse.current.y}px`
      }

      // detect interactive elements under pointer and set ring scale
      const node = getEffectiveBackgroundNode(mouse.current.x, mouse.current.y)
      const shouldGrow = isInteractiveNode(node)
      const targetScale = shouldGrow ? RING_SCALE_HOVER : 1
      ringScale.current = targetScale

      // adapt styles (colors / blend) for both elements
      applyAdaptiveStyle(mouse.current.x, mouse.current.y)
    }

    function onLeave() {
      if (dot) dot.style.opacity = '0'
      if (ring) ring.style.opacity = '0'
    }

    function animate() {
      // ring follows with easing
      ringPos.current.x += (mouse.current.x - ringPos.current.x) * FOLLOW_EASE
      ringPos.current.y += (mouse.current.y - ringPos.current.y) * FOLLOW_EASE
      if (ring) {
        ring.style.left = `${ringPos.current.x}px`
        ring.style.top = `${ringPos.current.y}px`
        // keep translate(-50%,-50%) for centering and apply scale for hover
        ring.style.transform = `translate(-50%, -50%) scale(${ringScale.current})`
        // adjust border thickness for hover
        ring.style.borderWidth = `${ringScale.current > 1 ? RING_STROKE_HOVER : RING_STROKE}px`
      }
      rafRef.current = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseenter', onMove)
    window.addEventListener('mouseleave', onLeave)
    window.addEventListener('touchstart', () => {
      isTouch = true
      if (dot) dot.style.display = 'none'
      if (ring) ring.style.display = 'none'
    }, { passive: true })

    const prevCursor = document.documentElement.style.cursor
    document.documentElement.style.cursor = 'none'

    // initialize positions (use left/top + translate centering)
    if (dot) {
      dot.style.left = `${mouse.current.x}px`
      dot.style.top = `${mouse.current.y}px`
      dot.style.transform = 'translate(-50%, -50%)'
      dot.style.transition = 'opacity 120ms linear'
    }
    if (ring) {
      ring.style.left = `${ringPos.current.x}px`
      ring.style.top = `${ringPos.current.y}px`
      // ring transforms will include scale; add a transition to make scale smooth
      ring.style.transform = 'translate(-50%, -50%) scale(1)'
      ring.style.transition = `opacity 120ms linear, transform ${RING_SCALE_TRANSITION_MS}ms cubic-bezier(.2,1,.22,1), border-width ${RING_SCALE_TRANSITION_MS}ms cubic-bezier(.2,1,.22,1)`
    }

    animate()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseenter', onMove)
      window.removeEventListener('mouseleave', onLeave)
      document.documentElement.style.cursor = prevCursor
      // remove injected style
      if (styleElRef.current && styleElRef.current.parentNode) styleElRef.current.parentNode.removeChild(styleElRef.current)
    }
  }, [])

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: `${RING_SIZE}px`,
          height: `${RING_SIZE}px`,
          borderRadius: '50%',
          border: `${RING_STROKE}px solid ${CURSOR_COLOR}`,
          background: 'transparent',
          pointerEvents: 'none',
          transform: 'translate(-50%, -50%) scale(1)',
          transition: `opacity 120ms linear, transform ${RING_SCALE_TRANSITION_MS}ms cubic-bezier(.2,1,.22,1)`,
          opacity: 0,
          zIndex: 2147483647,
        }}
      />

      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: `${CURSOR_SIZE}px`,
          height: `${CURSOR_SIZE}px`,
          borderRadius: '50%',
          pointerEvents: 'none',
          transform: 'translate(-50%, -50%)',
          transition: 'opacity 120ms linear',
          opacity: 0,
          zIndex: 2147483648,
          background: CURSOR_COLOR,
          boxShadow: '0 0 0 1px rgba(0,0,0,0.04)'
        }}
      />
    </>
  )
}

export default Cursor