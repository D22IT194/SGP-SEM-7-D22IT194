import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import reactLogo from '../assets/logo.png';

const Navbar = ({ userName, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const openNav = () => {
    setIsMenuOpen(true);
  };

  const closeNav = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="header-bar">
      <div className="logo">
        <img className="real-logo" src={reactLogo} alt="Real-Estate" />
      </div>

      <div id="main">
        <button className="openbtn" onClick={openNav}>☰</button>
      </div>

      <div
        className="pages"
        id="pages"
        style={{ width: isMenuOpen ? '250px' : '', display: isMenuOpen ? 'block' : '' }}
      >
        <div className="clsbtn">
          <button className="closebtn" onClick={closeNav}>×</button>
        </div>

        <ul>
          <Link to='/'><li className="Home">Home</li></Link>
          <Link to='/About'><li className="About">About</li></Link>
          <Link to='/Contact'><li className="Contact">Contact Us</li></Link>
          <Link to='/login'><li className="login">Login</li></Link>
          

        </ul>
      </div>
    </header>
  );
};

export default Navbar;
