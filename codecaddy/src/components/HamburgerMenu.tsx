import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const HamburgerMenu: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden absolute top-4 right-4 z-50">
      <button
        aria-label="Open menu"
        className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow"
        onClick={() => setOpen((prev) => !prev)}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-800">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      {open && (
        <div className="mt-2 bg-white rounded-lg shadow-lg py-2 w-40 flex flex-col text-right animate-fade-in">
          <Link to="/" className="block px-4 py-2 text-gray-800 hover:bg-blue-100" onClick={() => setOpen(false)}>Home</Link>
          <Link to="/search" className="block px-4 py-2 text-gray-800 hover:bg-blue-100" onClick={() => setOpen(false)}>Search</Link>
          <Link to="/collection" className="block px-4 py-2 text-gray-800 hover:bg-blue-100" onClick={() => setOpen(false)}>Collection</Link>
        </div>
      )}
    </div>
  );
};

export default HamburgerMenu;
