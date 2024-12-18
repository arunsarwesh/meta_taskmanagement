import React, { useState } from "react";
import { Link } from "react-router-dom";
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for hamburger menu

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="navcon">

    <nav className="navbar">
      <a href="/" className="logo">MetaVerse</a>
      <button className="menu-toggle" onClick={toggleMenu}>
        ☰
      </button>
      <ul className={`nav-links ${isMenuOpen ? "active" : ""}`}>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/attendance">Attendance</Link></li>
        <li><Link to="/workreport">Work Report</Link></li>
        <li><Link to="/courses">Courses</Link></li>
        <li><Link to="/projects">Projects</Link></li>
        <li><Link to="/profile">Profile</Link></li>
      </ul>
      <Link to="/logout" className="logout">Logout</Link>
    </nav>
    </div>
  );
};

export default Navbar;
