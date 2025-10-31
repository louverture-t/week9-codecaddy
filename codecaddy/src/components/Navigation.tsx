import { Link, useLocation } from 'react-router-dom';
import { useBookCollection } from '../contexts/BookCollectionContext';

const Navigation = () => {
  const location = useLocation();
  const { state } = useBookCollection();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo/Brand */}
          <Link
            to="/"
            className="text-2xl font-bold hover:text-orange-300 transition-colors"
          >
            📚 CodeCaddy
          </Link>

          {/* Navigation Links */}
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link
                  to="/"
                  className={`hover:text-orange-300 transition-colors font-medium ${
                    isActive('/') ? 'text-orange-300 font-semibold border-b-2 border-orange-300 pb-1' : ''
                  }`}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/search"
                  className={`hover:text-orange-300 transition-colors font-medium ${
                    isActive('/search') ? 'text-orange-300 font-semibold border-b-2 border-orange-300 pb-1' : ''
                  }`}
                >
                  Search
                </Link>
              </li>
              <li>
                <Link
                  to="/collection"
                  className={`hover:text-orange-300 transition-colors font-medium flex items-center ${
                    isActive('/collection') ? 'text-orange-300 font-semibold border-b-2 border-orange-300 pb-1' : ''
                  }`}
                >
                  Collection
                  {state.books.length > 0 && (
                    <span className="ml-2 bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {state.books.length}
                    </span>
                  )}
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
