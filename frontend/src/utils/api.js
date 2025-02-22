import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
})

// Add a request interceptor to add the auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Token ${token}`
  }
  return config
})

export default api 