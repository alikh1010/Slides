// TopNavigation.jsx
import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './TopNavigation.css'

export default function TopNavigation({ links = [] }) {
  const [hidden, setHidden] = useState(false)
  const lastY = useRef(window.scrollY)
  const { pathname } = useLocation()

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      const currentY = window.scrollY
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // hide when scrolling down past 50px, show when scrolling up
          if (currentY > lastY.current && currentY > 50) {
            setHidden(true)
          } else {
            setHidden(false)
          }
          lastY.current = currentY
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`top-nav ${hidden ? 'top-nav--hidden' : ''}`}>
      <ul className="top-nav__list">
        {links.map(({ to, label }) => (
          <li key={to} className="top-nav__item">
            <Link
              to={to}
              className={`top-nav__link${pathname === to ? ' top-nav__link--active' : ''}`}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}