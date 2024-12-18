import React from "react";
import "./Logout.css";
import { Navigate } from "react-router-dom";

const Logout = () => {

  const handleLogout = () => {
    localStorage.clear(); // Clear storage
    window.location.reload(); // Reload to reset the app state
    return <Navigate to="/login" />;
  };

  return (
    <div className="logout-container">
      <h2>Logout</h2>
      <p>Are you sure you want to log out?</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
    

    
  );
};

export default Logout;
