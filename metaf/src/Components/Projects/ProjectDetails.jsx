import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../Components/Navbar/index";
import api from "../../api"; // Axios instance with token handling
import { format } from "date-fns";
import "./Project.css";

const ProjectDetails = () => {
  const { id } = useParams(); // Get the report ID from the URL
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch the specific report by ID
  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await api.get(`project/${id}/`);
      setReport(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch the report.");
      console.error("Error fetching report:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="report-details-container">
      <Navbar />
      {report ? (
        <div className="project-card">
          <h2 className="project-title">Project Title: {report.project_title}</h2>
          <p className="description-label"><u>Description</u></p>
          <p className="description-text">{report.description}</p>
          <p className="report-date">
                {format(new Date(report.due_at), "PPP p")}
              </p>
          {report.proof && (
            <div className="card-media">
              {report.proof.endsWith(".jpg") ||
              report.proof.endsWith(".jpeg") ||
              report.proof.endsWith(".png") ||
              report.proof.endsWith(".gif") ? (
                <img
                  src={report.proof}
                  alt="Media"
                  style={{ width: "300px", height: "auto" }}
                />
              ) : report.proof.endsWith(".mp4") ||
                report.proof.endsWith(".mov") ||
                report.proof.endsWith(".avi") ? (
                <video controls style={{ width: "300px", height: "auto" }}>
                  <source src={report.proof} />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <a
                  href={report.proof}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    textDecoration: "none",
                    color: "#007bff",
                    fontWeight: "bold",
                  }}
                >
                  View File
                </a>
              )}
            </div>
          )}
          <br />
          <p className="submission-date">
            Submitted on: {format(new Date(report.created_at), "PPP p")}
          </p>
        </div>
      ) : (
        <p>No details available for this Project.</p>
      )}
    </div>
  );
};

export default ProjectDetails;
