import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './Home'
import PostPage from './PostPage'

export default function App() {
  const WP_API = ''

  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Home wordpressApiUrl={WP_API} count={25} />}/>
        <Route path="/project/:id" element={<PostPage wordpressApiUrl={WP_API} />}/>
      </Routes>
    </BrowserRouter>
  )
}