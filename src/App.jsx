import { useState } from 'react'
import VerticalSlider from './VerticalSliders'
import PostImages from './PostImages'

function App() {
  const [imageUrls, setImageUrls] = useState([])

  const firstSlider   = { tension: 50, friction: 30 }
  const secondSlider  = { tension: 75, friction: 35 }
  const thirdSlider   = { tension: 125, friction: 40 }
  const forthSlider   = { tension: 250, friction: 45 }

  return (
    <div style={{ width: '100vw' }}>
      <PostImages wordpressApiUrl={''} count={25} onImagesReady={setImageUrls} />

      {imageUrls.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '2.5em',
          justifyContent: 'center',
          alignItems: 'flex-start',
          maxWidth: '90vw',
          margin: 'auto'
        }}>
          <VerticalSlider images={imageUrls} widthRatio={5 / 14} springConfig={firstSlider} />
          <VerticalSlider images={imageUrls} widthRatio={3 / 14} springConfig={secondSlider} />
          <VerticalSlider images={imageUrls} widthRatio={3 / 14} springConfig={thirdSlider} />
          <VerticalSlider images={imageUrls} widthRatio={3 / 14} springConfig={forthSlider} />
        </div>
      )}
    </div>
  )
}

export default App