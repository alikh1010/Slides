import { useEffect, useState } from 'react'

// Helper to create a simple unique ID (you can swap this for uuid if you like)
const makeId = () => `${Date.now()}-${Math.floor(Math.random() * 100000)}`

function PostImages({ wordpressApiUrl, count = 25, onImagesReady }) {
  const [images, setImages] = useState([])

  useEffect(() => {
    const fetchImages = async () => {

      // 1. No WP URL? → dummy array
      if (!wordpressApiUrl) {
        const dummy = Array.from({ length: count }, (_, i) => ({
          id: makeId(),
          src: `https://placehold.co/400x600/000000/FFFFFF?text=Image+${i + 1}`
        }))
        setImages(dummy)
        onImagesReady(dummy)
        return
      }

      // 2. Fetch posts + embed featured media
      try {
        const res = await fetch(
          `${wordpressApiUrl}/wp-json/wp/v2/posts?_embed&per_page=${count}`
        )
        if (!res.ok) throw new Error(`WP returned ${res.status}`)
        const posts = await res.json()

        const mapped = posts.map((post, i) => {
          const media = post._embedded?.['wp:featuredmedia']?.[0]
          return {
            id: post.id,
            src:
              media?.source_url ||
              `https://placehold.co/400x600/000000/FFFFFF?text=Post+${i + 1}`
          }
        })

        setImages(mapped)
        onImagesReady(mapped)
      } catch (err) {
        console.error('Failed to fetch posts:', err)

        // Fallback to dummy
        const dummy = Array.from({ length: count }, (_, i) => ({
          id: makeId(),
          src: `https://placehold.co/400x600/000000/FFFFFF?text=Slide+${i + 1}`
        }))
        
        setImages(dummy)
        onImagesReady(dummy)
      }
    }

    fetchImages()
  }, [wordpressApiUrl, count, onImagesReady])

  return null
}

export default PostImages