import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './TopNavigation.css'

export default function TopNavigation({ links = [], logo }) {
  const [hidden, setHidden] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    let lastDeltaY = 0

    const handleWheel = (e) => {
      const deltaY = e.deltaY

      // Only react to intentional scroll movements
      if (deltaY > 0 && lastDeltaY <= 0) {
        // scrolling down
        setHidden(true)
      } else if (deltaY < 0 && lastDeltaY >= 0) {
        // scrolling up
        setHidden(false)
      }
      lastDeltaY = deltaY
    }

    window.addEventListener('wheel', handleWheel, { passive: true })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [])

  return (
    <nav className={`top-nav ${hidden ? 'top-nav--hidden' : ''}`}>
      <div className="top-nav__inner">

        {/* Left side logo */}
        <div className="top-nav__logo"  style={{
              height: '100%', width: '3em', float: 'left'
            }} >
          {typeof logo === 'string' ? (
            <img src={logo} alt="Logo" style={{width: '100%'}}/>
          ) : (
            logo
          )}
        </div>

        {/* Right side links */}
        <ul className="top-nav__list" style={{float: 'right'}}>
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
      </div>
    </nav>
  )
}