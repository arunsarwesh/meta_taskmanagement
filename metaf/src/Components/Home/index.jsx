import React, { useState } from "react";
import Navbar from "../Navbar/index.jsx"; 
import "./home.css";
import Login from "../Home/Login/Login"; // Import the Login component

function App() {
  const [isLoginVisible, setIsLoginVisible] = useState(false); // State to manage login visibility

  const handleJoinUsClick = () => {
    setIsLoginVisible(true); // Show login page when the button is clicked
  };

  const handleBackClick = () => {
    setIsLoginVisible(false); // Go back to the homepage
  };

  return (
    <>
    <Navbar />
    <div className="homepage">
      
       {}
      {isLoginVisible ? (
        <Login onBack={handleBackClick} /> // Render the login page if visible
      ) : (
        <>
          <section className="hero" id="home">
            <div className="overlay"></div>
            <div className="hero-content">
              <h1>Welcome to Metaverse</h1>
              <p>Empowering students through innovation and collaboration.</p>
              <p>Explore our clubs and shape the future of technology.</p>
              
            </div>
          </section>

          <section className="clubs" id="clubs">
            <div className="clubs-heading">
              <h2>Our Clubs</h2>
            </div>
            <div className="club-grid">
              <div className="club-card">
                <h3>Full Stack Development</h3>
                <p>Master web and app development from scratch.</p>
              </div>
              <div className="club-card">
                <h3>AI & ML</h3>
                <p>Unlock the power of artificial intelligence and machine learning.</p>
              </div>
              <div className="club-card">
                <h3>Cybersecurity</h3>
                <p>Explore ethical hacking and safeguard digital landscapes.</p>
              </div>
              <div className="club-card">
                <h3>IoT</h3>
                <p>Connect the world through the Internet of Things.</p>
              </div>
              <div className="club-card">
                <h3>AR/VR</h3>
                <p>Immerse in augmented and virtual realities.</p>
              </div>
            </div>
          </section>

          <footer className="footer">
            <p>Created by <strong><span1>Muneeswaran </span1>& <span2>Sarweshwar...!</span2></strong></p>
          </footer>
        </>
      )}
    </div>
    </>

  );
}

export default App;
