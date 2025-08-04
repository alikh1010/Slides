import { useRef, useEffect, useCallback } from 'react'
import { useSpring, animated } from 'react-spring'
import { useNavigate } from 'react-router-dom'

function VerticalSlider({
  images,
  slideHeightRatio = 0.75,
  widthRatio = 1,
  springConfig = { tension: 170, friction: 26 }
}) {
  const containerRef = useRef(null)
  const maxScroll = useRef(0)
  const navigate = useNavigate()

  // spring for translateY
  const [springStyles, api] = useSpring(() => ({
    y: 0,
    config: springConfig
  }))

  // calculate maxScroll once all imgs have loaded
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const imgs = container.querySelectorAll('img')
    let loaded = 0

    const updateMax = () => {
      const totalHeight = container.scrollHeight
      const viewportH = window.innerHeight
      maxScroll.current = Math.max(0, totalHeight - viewportH)
    }

    if (imgs.length === 0) {
      updateMax()
      return
    }

    imgs.forEach(img => {
      if (img.complete) {
        loaded++
        if (loaded === imgs.length) updateMax()
      } else {
        img.addEventListener('load', () => {
          loaded++
          if (loaded === imgs.length) updateMax()
        }, { once: true })
      }
    })
  }, [images])

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
      <animated.div
        ref={containerRef}
        style={{
          willChange: 'transform',
          paddingTop: '35vh',
          transform: springStyles.y.to(y => `translateY(${-y}px)`)
        }}
      >
        {images.map(({ id, src }, idx) => (
          <div
            key={id}
            onClick={() => handleClick(id)}
            style={{
              cursor: 'pointer',
              width: '100%',
              height: slideHeightRatio
                ? `${slideHeightRatio * 100}vh`
                : 'auto',
              marginBottom: '2.5em'
            }}
          >
            <img
              src={src}
              alt={`slide-${idx}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        ))}
        <div style={{ height: '35vh', width: '100%' }} />
      </animated.div>
    </div>
  )
}

export default VerticalSlider
