import VerticalSlider from './VerticalSliders'

function App() {
  const imageUrls = [
    'https://dummyimage.com/qvga',
    'https://dummyimage.com/qvga',
    'https://dummyimage.com/qvga',
    'https://dummyimage.com/qvga',
    'https://dummyimage.com/qvga',
    'https://dummyimage.com/qvga',
    'https://dummyimage.com/qvga',
    'https://dummyimage.com/qvga',
    'https://dummyimage.com/qvga',
    'https://dummyimage.com/qvga',
    'https://dummyimage.com/qvga',
    'https://dummyimage.com/qvga',
    'https://dummyimage.com/qvga',
    'https://dummyimage.com/qvga',
    'https://dummyimage.com/qvga',
    'https://dummyimage.com/qvga',
    'https://dummyimage.com/qvga',
    'https://dummyimage.com/qvga',
    'https://dummyimage.com/qvga',
    'https://dummyimage.com/qvga',
  ]

  const firstSlider = { tension: 50, friction: 35 }
  const secondSlider = { tension: 100, friction: 35 }
  const thirdSlider = { tension: 250, friction: 35 }
  const forthSlider = { tension: 350, friction: 35 }

  return (
    <div
      style={{
        display: 'flex',
        gap: '1em',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      <VerticalSlider
        images={imageUrls}
        // slideHeightRatio={0.6}
        widthRatio={5/15}
        springConfig={firstSlider}
      />
      <VerticalSlider
        images={imageUrls}
        // slideHeightRatio={0.6}
        widthRatio={3/15}
        springConfig={secondSlider}
      />
      <VerticalSlider
        images={imageUrls}
        // slideHeightRatio={0.6}
        widthRatio={3/15}
        springConfig={thirdSlider}
      />
      <VerticalSlider
        images={imageUrls}
        // slideHeightRatio={0.6}
        widthRatio={3/15}
        springConfig={forthSlider}
      />
    </div>
  )

}

export default App