import { Link, useLocation } from 'react-router-dom';
import { useBookCollection } from '../contexts/BookCollectionContext';
import HamburgerMenu from './HamburgerMenu';

const Navigation = () => {
  const location = useLocation();
  const { state } = useBookCollection();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="shadow-lg" style={{ backgroundColor: '#f7f9fa' }}>
      <div className="relative px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo/Brand */}
          <Link
            to="/"
            className="text-2xl font-bold text-gray-800 hover:text-orange-500 transition-colors"
          >
            📚 CodeCaddy
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex flex-1">
            <ul className="flex justify-around items-center w-full">
              <li>
                <Link
                  to="/"
                  className={`hover:text-orange-500 transition-colors font-medium text-gray-700 ${
                    isActive('/') ? 'text-orange-500 font-semibold border-b-2 border-orange-500 pb-1' : ''
                  }`}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/search"
                  className={`hover:text-orange-500 transition-colors font-medium text-gray-700 ${
                    isActive('/search') ? 'text-orange-500 font-semibold border-b-2 border-orange-500 pb-1' : ''
                  }`}
                >
                  Search
                </Link>
              </li>
              <li>
                <Link
                  to="/collection"
                  className={`hover:text-orange-500 transition-colors font-medium flex items-center text-gray-700 ${
                    isActive('/collection') ? 'text-orange-500 font-semibold border-b-2 border-orange-500 pb-1' : ''
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
          {/* Hamburger menu for mobile */}
          <HamburgerMenu />
        </div>
      </div>
    </header>
  );
};

export default Navigation;
