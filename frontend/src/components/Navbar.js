import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../styles/Navbar.css';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!token) return null; // hide navbar on login/register

  return (
    <nav className="navbar">
      <div className="nav-left" onClick={() => navigate('/projects')}>
        <span className="logo">Task<span>Hub</span></span>
      </div>

      <div className="nav-links">
        <Link
          to="/projects"
          className={`nav-link ${location.pathname === '/projects' ? 'active' : ''}`}
        >
          Projects
        </Link>
        <Link
          to="/profile"
          className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
        >
          Profile
        </Link>
      </div>

      <div className="nav-right">
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
