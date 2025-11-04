import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          JobBoard
        </Link>
        
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">Home</Link>
          </li>
          <li className="nav-item">
            <Link to="/jobs" className="nav-link">Find Jobs</Link>
          </li>
          
          {user ? (
            <>
              {user.role === 'employer' && (
                <>
                  <li className="nav-item">
                    <Link to="/post-job" className="nav-link">Post Job</Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/employer-dashboard" className="nav-link">Dashboard</Link>
                  </li>
                </>
              )}
              
              {user.role === 'candidate' && (
                <li className="nav-item">
                  <Link to="/candidate-dashboard" className="nav-link">Dashboard</Link>
                </li>
              )}
              
              <li className="nav-item">
                <Link to="/profile" className="nav-link">Profile</Link>
              </li>
              
              <li className="nav-item">
                <button onClick={handleLogout} className="nav-btn logout-btn">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link to="/login" className="nav-btn">Login</Link>
              </li>
              <li className="nav-item">
                <Link to="/register" className="nav-btn register-btn">Register</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;