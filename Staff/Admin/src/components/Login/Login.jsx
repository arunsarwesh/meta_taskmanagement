import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../../constants";
import './Login.css';

const Login = ({ route = "token/", method = "login" }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if the user is already logged in
  useEffect(() => {
    const savedUsername = localStorage.getItem("username");
    if (savedUsername) {
      navigate("/"); // Redirect to profile if already logged in
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post(route, { username, password })
      console.log(res.data);

      if (res.status === 200) {
        // Save tokens and username to localStorage
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        localStorage.setItem("username", username); // Save username
        navigate("/"); // Navigate to Profile or Home page after login
      } else {
        setError("Unexpected error occurred. Please try again.");
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          setError("Invalid username or password.");
        } else if (error.response.status === 500) {
          setError("Server error. Please try again later.");
        } else {
          setError("An error occurred. Please check your username and password.");
        }
      } else {
        setError("Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Admin Login</h2>
        <form onSubmit={handleSubmit}>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="form-input"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
            required
          />
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? `Loading...` : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
