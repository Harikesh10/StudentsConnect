import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-primary text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center space-x-3">
            <div className="text-2xl font-bold">Sathyabama Connect</div>
          </Link>

          <div className="flex items-center space-x-6">
            <Link
              to="/dashboard"
              className={`hover:text-gray-200 ${isActive('/dashboard') ? 'font-semibold' : ''}`}
            >
              Dashboard
            </Link>

            {user.userType === 'student' && (
              <>
                <Link
                  to="/search"
                  className={`hover:text-gray-200 ${isActive('/search') ? 'font-semibold' : ''}`}
                >
                  Search
                </Link>
                <Link
                  to="/clubs"
                  className={`hover:text-gray-200 ${isActive('/clubs') ? 'font-semibold' : ''}`}
                >
                  Clubs
                </Link>
                <Link
                  to="/applications"
                  className={`hover:text-gray-200 ${isActive('/applications') ? 'font-semibold' : ''}`}
                >
                  My Applications
                </Link>
              </>
            )}

            {user.userType === 'club' && (
              <>
                <Link
                  to="/applications"
                  className={`hover:text-gray-200 ${isActive('/applications') ? 'font-semibold' : ''}`}
                >
                  Applications
                </Link>
              </>
            )}

            <Link
              to="/chat"
              className={`hover:text-gray-200 ${isActive('/chat') ? 'font-semibold' : ''}`}
            >
              Chat
            </Link>

            <Link
              to="/profile"
              className={`hover:text-gray-200 ${isActive('/profile') ? 'font-semibold' : ''}`}
            >
              Profile
            </Link>

            <button
              onClick={onLogout}
              className="bg-white text-primary px-4 py-2 rounded-md hover:bg-gray-100 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
