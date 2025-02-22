import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-xl text-gray-600 mb-8">
        The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600"
      >
        Go Home
      </Link>
    </div>
  )
}

export default NotFound 