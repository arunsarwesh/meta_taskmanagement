import React, { useState, useEffect } from "react";
import { format } from 'date-fns';
import { Link } from "react-router-dom";
import Navbar from "../../Components/Navbar/index";
import api from "../../api"; // Axios instance with token handling
import UploadForm from "../Projects/uploadForm.jsx";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import "./Project.css";
const ProjectReport = () => {
  const [reportsList, setReportsList] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // For filtering reports

  // Fetch existing reports on component load
  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await api.get("project/");
      setReportsList(response.data);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError("Failed to fetch reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(); // Load reports initially
  }, []);

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const response = await api.delete(`/project/${id}/`);
      console.log("Report deleted successfully:", response.data);
      setReportsList(reportsList.filter(report => report.id !== id));
      setError(null);
    } catch (err) {
      setError("Failed to delete the report. Please try again.");
      console.error("Error deleting report:", err);
    } finally {
      setLoading(false);
    }
  };
  

  const handleSubmit = async (formData) => {
    console.log("Submitting Project:", formData);
    setLoading(true);
    try {
      const response = await api.post("/project/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Report submitted successfully:", response.data);
      setError(null);
      fetchReports(); // Refetch reports improoftely after report submission
    } catch (err) {
      setError("Failed to submit the report. Please try again.");
      console.error("Error submitting report:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter reports based on search term
  const filteredReports = reportsList.filter((report) => {
    const title = report.project_title || ''; // Ensure title is a string, default to empty string if undefined
    const description = report.description || ''; // Ensure description is a string, default to empty string if undefined
    const search = searchTerm.toLowerCase();
  
    return (
      title.toLowerCase().includes(search) ||
      description.toLowerCase().includes(search)
    );
  });

  return (
    <>
    <Navbar />
    <div className="ProjectReport-container">
      <h2>Project Report</h2>

      <UploadForm onSubmit={handleSubmit} loading={loading} />

      {error && <div className="error-message">{error}</div>}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search Projects"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <h3 className="submitted-reports-heading">Submitted Projects</h3>
      {loading && <p>Loading...</p>}

      <div className="cards-container">
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <div className="card" key={report.id}>
              <Link to={`/projects/${report.id}`} className="view-details-btn">
              <h4>{report.project_title}</h4>
              <p>{report.description}</p>
              <p className="report-date">
                {format(new Date(report.due_at), "PPP p")}
              </p>
              </Link>
              {report.proof.endsWith(".jpg") ||
              report.proof.endsWith(".jpeg") ||
              report.proof.endsWith(".png") ||
              report.proof.endsWith(".gif") ? (
                <img
                  src={report.proof}
                  alt="Media"
                  style={{ width: "200px", height: "auto" }}
                />
              ) : report.proof.endsWith(".mp4") ||
                report.proof.endsWith(".mov") ||
                report.proof.endsWith(".avi") ? (
                <video controls style={{ width: "200px", height: "auto" }}>
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
              <Link to={`/projects/${report.id}`} className="view-details-btn">
              <p className="report-date">
                {format(new Date(report.created_at), "PPP p")}
              </p>
              </Link>
              <span
                className="delete-btn"
                onClick={() => handleDelete(report.id)}
              >
                <FontAwesomeIcon icon={faTrashAlt} />
              </span>
            </div>
          ))
        ) : (
          <div>No reports found.</div>
        )}
      </div>
      <footer className="footer">
            {/* <p>Created by <strong><span1>Muneeswaran </span1>& <span2>Sarweshwar...!</span2></strong></p> */}
          </footer>
    </div>
    </>
    
  );
};

export default ProjectReport;
