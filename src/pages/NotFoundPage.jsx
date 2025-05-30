import { Link } from 'react-router-dom';
import { ExclamationCircleIcon } from '@heroicons/react/20/solid';

function NotFoundPage() {
  return (
    <div className="flex flex-col bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="flex-1 flex items-center justify-center container mx-auto px-6 py-12">
        <div className="text-center">
          <ExclamationCircleIcon className="h-24 w-24 text-gray-400 mx-auto mb-4" />
          <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
          <p className="text-2xl text-gray-600 mb-8">Oops! Page not found.</p>
          <Link
            to="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;