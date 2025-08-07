import { useState } from 'react'
import PostImages from './PostImages'
import VerticalSlider from './VerticalSliders'

/**
 * Home page: fetches post images and displays multiple synchronized sliders.
 *
 * @param {string} wordpressApiUrl  Base URL of your WordPress site (e.g. "https://example.com").
 * @param {number} count            Number of posts to fetch.
 */
export default function Home({ wordpressApiUrl, count = 25 }) {
  const [slides, setSlides] = useState([])

  // Slider configs: tension & friction, and their width ratios
  const sliderConfigs = [
    { widthRatio: 5 / 14, springConfig: { tension: 50, friction: 30 } },
    { widthRatio: 3 / 14, springConfig: { tension: 75, friction: 35 } },
    { widthRatio: 3 / 14, springConfig: { tension: 125, friction: 40 } },
    { widthRatio: 3 / 14, springConfig: { tension: 250, friction: 45 } }
  ]

  return (
    <div style={{ width: '100vw' }}>
      {/* Load post images */}
      <PostImages
        wordpressApiUrl={wordpressApiUrl}
        count={count}
        onImagesReady={setSlides}
      />

      {/* Once loaded, render four sliders side-by-side */}
      {slides.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: '2.5em',
            justifyContent: 'center',
            alignItems: 'flex-start',
            maxWidth: '90vw',
            margin: 'auto'
          }}
        >
          {sliderConfigs.map(({ widthRatio, springConfig }, index) => (
            <VerticalSlider
              key={index}
              images={slides}
              widthRatio={widthRatio}
              springConfig={springConfig}
            />
          ))}
        </div>
      )}
    </div>
  )
}
