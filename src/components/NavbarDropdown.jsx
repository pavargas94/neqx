import { useEffect, useId, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

export default function NavbarDropdown({ menu }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const menuId = useId()
  const location = useLocation()

  const isActive = menu.items.some(item => {
    if (item.end) return location.pathname === item.path
    return location.pathname.startsWith(item.path)
  })

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  if (menu.items.length === 1) {
    const item = menu.items[0]
    return (
      <NavLink
        to={item.path}
        end={item.end}
        className={({ isActive: linkActive }) =>
          `navbar-link navbar-link-single${linkActive ? ' active' : ''}`
        }
      >
        {menu.label}
      </NavLink>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`navbar-dropdown${open ? ' open' : ''}${isActive ? ' active' : ''}`}
    >
      <button
        type="button"
        className="navbar-dropdown-toggle"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={menuId}
        onClick={() => setOpen(prev => !prev)}
      >
        <span>{menu.label}</span>
        <span className="navbar-dropdown-caret" aria-hidden="true">▾</span>
      </button>

      <ul id={menuId} className="navbar-dropdown-menu" role="menu">
        {menu.items.map(item => (
          <li key={item.id} role="none">
            <NavLink
              to={item.path}
              end={item.end}
              role="menuitem"
              className={({ isActive: linkActive }) =>
                `navbar-dropdown-item${linkActive ? ' active' : ''}`
              }
              onClick={() => setOpen(false)}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  )
}
