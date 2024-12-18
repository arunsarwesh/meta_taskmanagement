import React, { useEffect, useState } from "react";
import "./Profile.css";
import Navbar from "../Navbar/index.jsx";
import api from "../../api";

const Profile = () => {
  const [userData, setUserData] = useState({
    name: "",
    domain: "",
    phone_no: "",
    mail_id: "",
    linkedin_url: "",
    github_url: "",
    about: "",
    profile_photo: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const username = localStorage.getItem("username");
  const authToken = localStorage.getItem("access");

  const domains = [
    "FullStack",
    "Cyber Security",
    "AI&ML",
    "IOT",
    "AR/VR" 
  ];

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`profile/${username}/`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setUserData({
        name: response.data.name || username,
        domain: response.data.domain || "No information provided",
        phone_no: response.data.phone_no || "No information provided",
        mail_id: response.data.mail_id || "No information provided",
        linkedin_url: response.data.linkedin_url || "No information provided",
        github_url: response.data.github_url || "No information provided",
        about: response.data.about || "No information provided",
        profile_photo: response.data.profile_photo,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (username && authToken) {
      fetchUserData();
    } else {
      setError("Authentication required. Please log in.");
    }
  }, [username, authToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserData({
        ...userData,
        profile_photo: file,
      });
      localStorage.setItem("profile_photo", URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const formData = new FormData();
      formData.append("username", localStorage.getItem("username"));
      formData.append("name", userData.name);
      formData.append("domain", userData.domain);
      formData.append("phone_no", userData.phone_no);
      formData.append("mail_id", userData.mail_id);
      formData.append("linkedin_url", userData.linkedin_url);
      formData.append("github_url", userData.github_url);
      formData.append("about", userData.about);

      if (userData.profile_photo instanceof File) {
        formData.append("profile_photo", userData.profile_photo);
      } else {
        const storedProfilePhoto = localStorage.getItem("profile_photo");
        if (storedProfilePhoto) {
          formData.append("profile_photo", storedProfilePhoto);
        }
      }

      const response = await api.post(`profile/`, formData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setUserData({ ...userData, ...response.data });
      setIsEditing(false);
    } catch (err) {
      setError(`Failed to update profile: ${err.response?.data?.detail || err.message}`);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <Navbar />
      <div className="profile-page">
        {error && <div className="error-message">{error}</div>}

        <div className="profile-section-card">
          <img
            src={
              userData.profile_photo
                ? userData.profile_photo instanceof File
                  ? URL.createObjectURL(userData.profile_photo)
                  : userData.profile_photo
                : localStorage.getItem("profile_photo") || "https://via.placeholder.com/150"
            }
            alt="Profile"
            className="profile-picture"
          />
          {isEditing && <input type="file" accept="image/*" onChange={handleFileChange} />}

          {isEditing ? (
            <input type="text" name="name" value={userData.name} onChange={handleChange} placeholder="Name" />
          ) : (
            <h2>{userData.name}</h2>
          )}

          {isEditing ? (
            <select name="domain" value={userData.domain} onChange={handleChange}>
              <option value="">Select Domain</option>
              {domains.map((domain, index) => (
                <option key={index} value={domain}>
                  {domain}
                </option>
              ))}
            </select>
          ) : (
            <p><strong>Domain:</strong> {userData.domain}</p>
          )}

          {isEditing ? (
            <input type="text" name="phone_no" value={userData.phone_no} onChange={handleChange} placeholder="Phone" />
          ) : (
            <p><strong>Phone:</strong> {userData.phone_no}</p>
          )}

          {isEditing ? (
            <input type="text" name="mail_id" value={userData.mail_id} onChange={handleChange} placeholder="Email" />
          ) : (
            <p><strong>Email:</strong> <a href={`mailto:${userData.mail_id}`}>{userData.mail_id}</a></p>
          )}

          {isEditing ? (
            <input type="text" name="linkedin_url" value={userData.linkedin_url} onChange={handleChange} placeholder="LinkedIn" />
          ) : (
            <p><strong>LinkedIn:</strong> <a href={userData.linkedin_url} target="_blank" rel="noopener noreferrer">{userData.linkedin_url}</a></p>
          )}

          {isEditing ? (
            <input type="text" name="github_url" value={userData.github_url} onChange={handleChange} placeholder="GitHub" />
          ) : (
            <p><strong>GitHub:</strong> <a href={userData.github_url} target="_blank" rel="noopener noreferrer">{userData.github_url}</a></p>
          )}

          <div className="about-section">
            <strong>About:</strong>
            {isEditing ? (
              <textarea name="about" value={userData.about} onChange={handleChange} placeholder="Tell us something about yourself" />
            ) : (
              <p>{userData.about}</p>
            )}
          </div>

          <button onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? "Cancel" : "Edit"}
          </button>
          {isEditing && <button onClick={handleSubmit}>Update</button>}
        </div>
      </div>
      <footer className="footer">
        <p>Created by <strong><span1>Muneeswaran </span1>& <span2>Sarweshwar...!</span2></strong></p>
      </footer>
    </div>
  );
};

export default Profile;
