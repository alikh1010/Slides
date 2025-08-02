import { useEffect, useState } from 'react'

function PostImages({ wordpressApiUrl, count = 25, onImagesReady }) {
  const [images, setImages] = useState([])

  useEffect(() => {
    const fetchImages = async () => {
      if (!wordpressApiUrl) {
        // Fallback to dummy
        const dummy = Array.from({ length: count }, (_, i) =>
          `https://placehold.co/400x600/000000/FFFFFF?text=Slide+${i + 1}`
        )
        setImages(dummy)
        onImagesReady(dummy)
        return
      }

      try {
        const res = await fetch(`${wordpressApiUrl}/wp-json/wp/v2/posts?_embed&per_page=${count}`)
        const posts = await res.json()

        const imageUrls = posts.map((post, i) => {
          const media = post._embedded?.['wp:featuredmedia']?.[0]
          return media?.source_url || `https://placehold.co/400x600/000000/FFFFFF?text=Post+${i + 1}`
        })

        setImages(imageUrls)
        onImagesReady(imageUrls)
      } catch (err) {
        console.error('Failed to fetch posts:', err)

        // Fallback
        const dummy = Array.from({ length: count }, (_, i) =>
          `https://placehold.co/400x600/000000/FFFFFF?text=Slide+${i + 1}`
        )
        
        setImages(dummy)
        onImagesReady(dummy)
      }
    }

    fetchImages()
  }, [wordpressApiUrl, count, onImagesReady])

  return null // this is a headless component
}

export default PostImages