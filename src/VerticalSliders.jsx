import React, { useRef, useEffect, useCallback, useState } from 'react'
import { useSpring, animated, useSprings } from 'react-spring'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'

// --- LoaderManager (singleton) -------------------------------------------------
const LoaderManager = (() => {
  let subscribers = new Set()
  const images = new Map() // src -> 'loading' | 'loaded'
  let total = 0
  let loaded = 0

  const notify = () => {
    const state = getState()
    subscribers.forEach(fn => fn(state))
  }

  const getState = () => ({
    total,
    loaded,
    progress: total === 0 ? 100 : Math.round((loaded / total) * 100),
    isLoaded: total === 0 || loaded >= total
  })

  const addImages = srcs => {
    // accept array of src strings (may contain duplicates)
    srcs.forEach(src => {
      if (!src) return
      if (!images.has(src)) {
        images.set(src, 'loading')
        total += 1

        const img = new Image()
        img.src = src
        if (img.complete) {
          // cached
          if (images.get(src) !== 'loaded') {
            images.set(src, 'loaded')
            loaded += 1
            notify()
          }
        } else {
          img.onload = () => {
            if (images.get(src) !== 'loaded') {
              images.set(src, 'loaded')
              loaded += 1
              notify()
            }
          }
          img.onerror = () => {
            // treat error as loaded so the app doesn't hang
            if (images.get(src) !== 'loaded') {
              images.set(src, 'loaded')
              loaded += 1
              notify()
            }
          }
        }
      }
    })
    // notify initial state (in case total changed)
    notify()
  }

  const subscribe = fn => {
    subscribers.add(fn)
    // send current state immediately
    fn(getState())
    return () => subscribers.delete(fn)
  }

  return { addImages, subscribe, getState }
})()

// --- Global loader component (render once in app root) ------------------------
export function GlobalSliderLoader() {
  const [state, setState] = useState(LoaderManager.getState())

  useEffect(() => {
    const unsub = LoaderManager.subscribe(setState)
    return () => unsub()
  }, [])

  // animate opacity and also animate the numeric value
  const spring = useSpring({
    opacity: state.isLoaded ? 0 : 1,
    transform: state.isLoaded ? 'translateY(-20px)' : 'translateY(0px)',
    config: { tension: 200, friction: 28 }
  })

  const progSpring = useSpring({ value: state.progress, config: { tension: 170, friction: 26 } })

  if (state.isLoaded) return null

  return createPortal(
    <animated.div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        background: 'rgba(255,255,255,0.95)',
        ...spring
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <animated.div style={{ fontSize: '2.75rem', fontWeight: 700 }}>
          {progSpring.value.to(v => `${Math.round(v)}%`)}
        </animated.div>
        <div style={{ marginTop: 8, opacity: 0.85 }}>Loading assets...</div>
      </div>
    </animated.div>,
    document.body
  )
}

// --- VerticalSlider component -------------------------------------------------
function VerticalSlider({
  images = [],
  slideHeightRatio = 0.75,
  widthRatio = 1,
  springConfig = { tension: 170, friction: 26 }
}) {
  const containerRef = useRef(null)
  const maxScroll = useRef(0)
  const navigate = useNavigate()

  // subscribe to LoaderManager state so we can trigger entrance animations
  const [managerState, setManagerState] = useState(LoaderManager.getState())
  useEffect(() => {
    const unsub = LoaderManager.subscribe(setManagerState)
    return () => unsub()
  }, [])

  // register this instance's images with the manager
  useEffect(() => {
    const srcs = images.map(i => i.src).filter(Boolean)
    if (srcs.length > 0) LoaderManager.addImages(srcs)
  }, [images])

  // scroll spring (controls translateY of the whole slides container)
  const [springStyles, api] = useSpring(() => ({ y: 0, config: springConfig }))

  // useSprings for per-slide, slower & randomised entry
  const randomSeedRef = useRef([])
  if (randomSeedRef.current.length !== images.length) {
    randomSeedRef.current = images.map(() => Math.random())
  }

  const springs = useSprings(
    images.length,
    images.map((_, i) => {
      const seed = randomSeedRef.current[i] || Math.random()
      const delay = managerState.isLoaded ? Math.floor(200 + seed * 1000) : 0
      const startY = 20 + Math.floor(seed * 120)
      const cfg = { mass: 1, tension: 100 + Math.floor(seed * 120), friction: 24 + Math.floor(seed * 18) }

      return {
        opacity: managerState.isLoaded ? 1 : 0,
        transform: managerState.isLoaded ? 'translateY(0px)' : `translateY(${startY}px)`,
        from: { opacity: 0, transform: `translateY(${startY}px)` },
        delay,
        config: cfg
      }
    })
  )

  // update maxScroll once images are loaded and on resize
  useEffect(() => {
    const updateMax = () => {
      const container = containerRef.current
      if (!container) return
      const totalHeight = container.scrollHeight
      const viewportH = window.innerHeight
      maxScroll.current = Math.max(0, totalHeight - viewportH)
    }

    if (managerState.isLoaded) {
      updateMax()
      window.addEventListener('resize', updateMax)
    }

    return () => window.removeEventListener('resize', updateMax)
  }, [managerState.isLoaded, images])

  // wheel → animate scroll
  useEffect(() => {
    const onWheel = e => {
      const currentY = springStyles.y.get()
      const nextY = Math.max(
        0,
        Math.min(currentY + e.deltaY * 3.5, maxScroll.current)
      )
      api.start({ y: nextY })
    }

    window.addEventListener('wheel', onWheel, { passive: true })
    return () => window.removeEventListener('wheel', onWheel)
  }, [api, springStyles.y])

  // click handler
  const handleClick = useCallback(
    id => {
      navigate(`/project/${id}`)
    },
    [navigate]
  )

  return (
    <div
      style={{
        position: 'relative',
        width: `${widthRatio * 100}vw`,
        height: '100vh',
        overflow: 'hidden'
      }}
    >
      {/* Slides container — its translateY is driven by the scroll spring */}
      <animated.div
        ref={containerRef}
        style={{
          willChange: 'transform',
          paddingTop: '35vh',
          transform: springStyles.y.to(y => `translateY(${-y}px)`)
        }}
      >
        {springs.map((sstyle, idx) => {
          const slide = images[idx]
          if (!slide) return null
          return (
            <animated.div
              key={slide.id}
              onClick={() => handleClick(slide.id)}
              style={{
                ...sstyle,
                cursor: 'pointer',
                width: '100%',
                height: slideHeightRatio ? `${slideHeightRatio * 100}vh` : 'auto',
                marginBottom: '2.5em',
                overflow: 'hidden',
                willChange: 'transform, opacity'
              }}
            >
              <img
                src={slide.src}
                alt={`slide-${idx}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </animated.div>
          )
        })}

        <div style={{ height: '35vh', width: '100%' }} />
      </animated.div>
    </div>
  )
}

export default VerticalSlider