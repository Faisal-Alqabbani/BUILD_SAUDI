import { Outlet } from 'react-router-dom'

function Layout() {
  return (
    <main className="container mx-auto px-4 py-8">
      <Outlet />
    </main>
  )
}

export default Layout 