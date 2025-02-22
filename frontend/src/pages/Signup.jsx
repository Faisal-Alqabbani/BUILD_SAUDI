import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import api from '../utils/api'

function Signup() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    first_name: '',
    last_name: '',
    gender: 'male',
    date_of_birth: '',
    phone: '',
    national_id: '',
    role: 'user',
    // Contractor specific fields
    specialization: '',
    experience_years: '',
    license_number: ''
  })

  const signupMutation = useMutation({
    mutationFn: async (userData) => {
      const response = await api.post('/signup/', userData)
      return response.data
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.token)
      navigate('/')
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const userData = {
      username: formData.email,
      email: formData.email,
      password: formData.password,
      first_name: formData.first_name,
      last_name: formData.last_name,
      gender: formData.gender,
      date_of_birth: formData.date_of_birth || null,
      phone: formData.phone,
      national_id: formData.national_id,
      role: formData.role
    }

    if (formData.role === 'contractor') {
      userData.contractor_details = {
        specialization: formData.specialization,
        experience_years: parseInt(formData.experience_years),
        license_number: formData.license_number
      }
    }

    signupMutation.mutate(userData)
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12">
      <div className="max-w-md w-full px-6 py-8 bg-white rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Start Managing Properties
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Register to evaluate and manage abandoned properties{' '}
          <Link to="/login" className="text-[#5454c7] hover:text-[#4444b3]">
            Sign in
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Register as <span className="text-red-500">*</span>
            </label>
            <select
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#5454c7] focus:outline-none focus:ring-1 focus:ring-[#5454c7]"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="user">Property Owner</option>
              <option value="contractor">Contractor</option>
            </select>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#5454c7] focus:outline-none focus:ring-1 focus:ring-[#5454c7]"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          {/* Password */}
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

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                First name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#5454c7] focus:outline-none focus:ring-1 focus:ring-[#5454c7]"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Last name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#5454c7] focus:outline-none focus:ring-1 focus:ring-[#5454c7]"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
            </div>
          </div>

          {/* Gender and Date of Birth */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#5454c7] focus:outline-none focus:ring-1 focus:ring-[#5454c7]"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date of Birth
              </label>
              <input
                type="date"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#5454c7] focus:outline-none focus:ring-1 focus:ring-[#5454c7]"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone number
              </label>
              <input
                type="tel"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#5454c7] focus:outline-none focus:ring-1 focus:ring-[#5454c7]"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                National ID
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#5454c7] focus:outline-none focus:ring-1 focus:ring-[#5454c7]"
                value={formData.national_id}
                onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
              />
            </div>
          </div>

          {/* Contractor Fields */}
          {formData.role === 'contractor' && (
            <div className="space-y-6 border-t pt-6">
              <h2 className="text-lg font-medium text-gray-900">Contractor Details</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Specialization <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#5454c7] focus:outline-none focus:ring-1 focus:ring-[#5454c7]"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Years of Experience <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#5454c7] focus:outline-none focus:ring-1 focus:ring-[#5454c7]"
                  value={formData.experience_years}
                  onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  License Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#5454c7] focus:outline-none focus:ring-1 focus:ring-[#5454c7]"
                  value={formData.license_number}
                  onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#5454c7] text-white py-2 px-4 rounded-md hover:bg-[#4444b3] focus:outline-none focus:ring-2 focus:ring-[#5454c7] focus:ring-offset-2"
            disabled={signupMutation.isPending}
          >
            {signupMutation.isPending ? 'Creating account...' : 'Create account'}
          </button>

          {signupMutation.isError && (
            <p className="text-red-500 text-sm text-center">
              {signupMutation.error.response?.data?.error || 'Failed to create account'}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

export default Signup 