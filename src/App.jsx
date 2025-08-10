import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './Home'
import PostPage from './PostPage'
import TopNavigation from './TopNavigation'
import Cursor from './TinyCursor'

export default function App() {
  // const WP_API = 'https://kdesigns.ir'
  const WP_API = ''
  const navLinks = [
    { to: '/', label: 'Projects' },
    { to: '/notes', label: 'Notes' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' }
  ]

  return (
    <>
      <Cursor />
      <BrowserRouter>
        <TopNavigation links={navLinks} logo={'./AhmadYounLogo.png'} />
        <div>
          <Routes>
            <Route index element={<Home wordpressApiUrl={WP_API} count={25} />} />
            <Route path="/project/:id" element={<PostPage wordpressApiUrl={WP_API} />} />
          </Routes>
        </div>
      </BrowserRouter>
    </>
  )
}