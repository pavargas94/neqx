import { useSelector } from 'react-redux'
import { NAV_MENUS } from '../data/adminNav'
import { isAdmin } from '../utils/roles'
import NavbarDropdown from './NavbarDropdown'

export default function AppNavbar() {
  const user = useSelector(state => state.auth.user)

  if (!user) return null

  const visibleMenus = NAV_MENUS.filter(menu => !menu.adminOnly || isAdmin(user))

  return (
    <nav className="app-navbar" aria-label="Navegación principal">
      {visibleMenus.map(menu => (
        <NavbarDropdown key={menu.id} menu={menu} />
      ))}
    </nav>
  )
}
