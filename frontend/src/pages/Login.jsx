import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import api from '../utils/api'

function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    remember: false
  })

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const response = await api.post('/login/', credentials)
      return response.data
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.token)
      localStorage.setItem('userRole', data.user.role)
      navigate('/')
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    loginMutation.mutate({
      username: formData.username,
      password: formData.password
    })
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full px-6 py-8 bg-white rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Welcome back
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#5454c7] hover:text-[#4444b3]">
            Sign up
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#5454c7] focus:outline-none focus:ring-1 focus:ring-[#5454c7]"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#5454c7] focus:outline-none focus:ring-1 focus:ring-[#5454c7]"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-[#5454c7] focus:ring-[#5454c7]"
                checked={formData.remember}
                onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
              />
              <label className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>
            <Link
              to="/forgot-password"
              className="text-sm text-[#5454c7] hover:text-[#4444b3]"
            >
              Forgot your password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-[#5454c7] text-white py-2 px-4 rounded-md hover:bg-[#4444b3] focus:outline-none focus:ring-2 focus:ring-[#5454c7] focus:ring-offset-2"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
          </button>

          {loginMutation.isError && (
            <p className="text-red-500 text-sm text-center">
              {loginMutation.error.response?.data?.error || 'Failed to sign in'}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

export default Login 