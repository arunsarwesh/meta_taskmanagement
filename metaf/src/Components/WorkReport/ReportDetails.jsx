import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../Components/Navbar/index";
import api from "../../api"; // Axios instance with token handling
import { format } from "date-fns";
import "./WorkReport.css";

const ReportDetails = () => {
  const { id } = useParams(); // Get the report ID from the URL
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch the specific report by ID
  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/work-reports/${id}/`);
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
        <>
          <h2>
            <center className="det">Title: {report.title}</center>
          </h2>
          <br />
          <p>
            <u className="det">Description:</u> <br />
            <br />
            <b className="det_p">
              <tt>{report.description}</tt>
            </b>
          </p>
          <br />

          {/* Media Preview */}
          {report.media && (
            <div className="card-media">
              {report.media.endsWith(".jpg") ||
              report.media.endsWith(".jpeg") ||
              report.media.endsWith(".png") ||
              report.media.endsWith(".gif") ? (
                <img
                  src={report.media}
                  alt="Media"
                  style={{ width: "300px", height: "auto" }}
                />
              ) : report.media.endsWith(".mp4") ||
                report.media.endsWith(".mov") ||
                report.media.endsWith(".avi") ? (
                <video controls style={{ width: "300px", height: "auto" }}>
                  <source src={report.media} />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <a
                  href={report.media}
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

          <p className="det">
            Submitted on: {format(new Date(report.created_at), "PPP p")}
          </p>
        </>
      ) : (
        <p>No details available for this report.</p>
      )}
    </div>
  );
};

export default ReportDetails;
