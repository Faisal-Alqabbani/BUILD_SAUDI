import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import api from '../utils/api'

function Navbar() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const userRole = localStorage.getItem('userRole')

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post('/logout/')
      localStorage.removeItem('token')
      localStorage.removeItem('userRole')
      navigate('/login')
    }
  })

  const handleLogout = () => {
    logoutMutation.mutate()
  }

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-[#5454c7] text-xl font-bold">Property Management</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="text-black hover:text-[#5454c7] px-3 py-2 text-sm font-medium"
            >
              Home
            </Link>
            
            {token && userRole === 'user' && (
              <>
                <Link
                  to="/properties"
                  className="text-black hover:text-[#5454c7] px-3 py-2 text-sm font-medium"
                >
                  My Properties
                </Link>
                <Link
                  to="/properties/create"
                  className="text-black hover:text-[#5454c7] px-3 py-2 text-sm font-medium"
                >
                  Add Property
                </Link>
              </>
            )}

            {token && userRole === 'admin' && (
              <Link
                to="/admin/requests"
                className="text-black hover:text-[#5454c7] px-3 py-2 text-sm font-medium"
              >
                Property Requests
              </Link>
            )}

            {token && userRole === 'contractor' && (
              <Link
                to="/contractor/properties"
                className="text-black hover:text-[#5454c7] px-3 py-2 text-sm font-medium"
              >
                Assigned Properties
              </Link>
            )}

            {token ? (
              <button
                onClick={handleLogout}
                className="text-black hover:text-[#5454c7] px-3 py-2 text-sm font-medium"
              >
                Sign out
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-black hover:text-[#5454c7] px-3 py-2 text-sm font-medium"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="bg-[#5454c7] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#4444b3]"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar 