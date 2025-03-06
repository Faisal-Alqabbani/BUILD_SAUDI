import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import Layout from './components/Layout'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import NotFound from './pages/NotFound'
import CreateProperty from './pages/CreateProperty'
import MyProperties from './pages/MyProperties'
import AdminRequests from './pages/AdminRequests'
import ContractorProperties from './pages/ContractorProperties'
import ProtectedRoute from './components/ProtectedRoute'
import PropertyDetails from './pages/PropertyDetails'
import ContractorAvailableProperties from './pages/ContractorAvailableProperties'
import ContractorOffers from './pages/ContractorOffers'
import HomeownerPendingOffers from './pages/HomeownerPendingOffers'

// Create a client
const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="pt-16"> {/* Add padding for fixed navbar */}
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
              </Route>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/properties" element={<MyProperties />} />
              <Route path="/properties/create" element={<CreateProperty />} />
              <Route path="/admin/requests" element={<AdminRequests />} />
              <Route 
                path="/contractor/properties" 
                element={
                  <ProtectedRoute allowedRoles={['contractor']}>
                    <ContractorProperties />
                  </ProtectedRoute>
                } 
              />
              <Route path="/properties/:id" element={<PropertyDetails />} />
              <Route path="/contractor/available-properties" element={
                <ProtectedRoute allowedRoles={['contractor']}>
                  <ContractorAvailableProperties />
                </ProtectedRoute>
              } />
              <Route path="/contractor/offers" element={
                <ProtectedRoute allowedRoles={['contractor']}>
                  <ContractorOffers />
                </ProtectedRoute>
              } />
              <Route path="/my-offers" element={
                <ProtectedRoute allowedRoles={['user']}>
                  <HomeownerPendingOffers />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App 