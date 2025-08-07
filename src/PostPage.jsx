import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

const makeDummy = id => ({
  title: `Dummy Title #${id}`,
  content: `<p>This is some placeholder content for post <strong>${id}</strong>.</p>`
})

export default function PostPage({ wordpressApiUrl }) {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchPost() {
      setLoading(true)
      setError(false)

      // No WP URL? immediate dummy
      if (!wordpressApiUrl) {
        setPost(makeDummy(id))
        setLoading(false)
        return
      }

      try {
        const res = await fetch(
          `${wordpressApiUrl}/wp-json/wp/v2/posts/${id}`
        )
        if (!res.ok) throw new Error(`Status ${res.status}`)
        const json = await res.json()
        setPost({
          title: json.title.rendered,
          content: json.content.rendered
        })
      } catch (err) {
        console.error('Error fetching post:', err)
        setError(true)
        setPost(makeDummy(id))
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [id, wordpressApiUrl])

  if (loading) return <p>Loading post…</p>

  return (
    <article style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/" style={{ display: 'inline-block', marginBottom: '1rem' }}>
        ← Back to home
      </Link>

      {error && (
        <p style={{ color: 'crimson' }}>
          Failed to load real post; showing placeholder.
        </p>
      )}

      <h1 dangerouslySetInnerHTML={{ __html: post.title }} />
      <div
        dangerouslySetInnerHTML={{ __html: post.content }}
        style={{ marginTop: '1.5rem', lineHeight: 1.6 }}
      />
    </article>
  )
}