import { useRef, useEffect } from 'react'
import { useSpring, animated } from 'react-spring'

function VerticalSlider({ images, slideHeightRatio, widthRatio, springConfig}) {
  const containerRef = useRef(null)
  const maxScroll = useRef(0)

  const [springStyles, api] = useSpring(() => ({
    y: 0,
    config: springConfig
  }))
  
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const imagesInContainer = container.querySelectorAll('img')
    let loadedCount = 0

    const checkAllImagesLoaded = () => {
      const h = container.scrollHeight || 0
      const vh = window.innerHeight
      maxScroll.current = Math.max(0, h - vh)
    }

    imagesInContainer.forEach(img => {
      if (img.complete) {
        loadedCount++
        if (loadedCount === imagesInContainer.length) checkAllImagesLoaded()
      } else {
        img.addEventListener('load', () => {
          loadedCount++
          if (loadedCount === imagesInContainer.length) checkAllImagesLoaded()
        })
      }
    })

    // fallback: if no images found
    if (imagesInContainer.length === 0) {
      checkAllImagesLoaded()
    }
  }, [images])


  useEffect(() => {
    const onWheel = e => {
      const currentY = springStyles.y.get() || 0
      const SCROLL_SPEED = 3.5 // or try 3, 4, etc.
      let nextY = currentY + e.deltaY * SCROLL_SPEED
      nextY = Math.max(0, Math.min(nextY, maxScroll.current))
      api.start({ y: nextY })
    }

    window.addEventListener('wheel', onWheel, { passive: true })
    return () => window.removeEventListener('wheel', onWheel)
  }, [api, springStyles.y])


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
          transform: springStyles.y.to(y => `translateY(${-y}px)`)
        }}
      >
        {images.map((src, idx) => (
          <div
            key={idx}
            style={{
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
      </animated.div>
    </div>
  )
}

export default VerticalSlider