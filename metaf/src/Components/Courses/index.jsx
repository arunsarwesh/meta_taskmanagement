import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { format } from "date-fns"; // Import date-fns format function
import api from "../../api"; // Import the axios instance
import Navbar from "../Navbar/index";
import UploadForm from "../Courses/UploadForm";
import { Document, Page } from 'react-pdf'; // Import react-pdf
import "./Course.css"; // Import the CSS file

const Course = () => {
  const [certificateList, setReportsList] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // For filtering reports

  // Fetch existing reports on component load
  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await api.get("course/"); // Use your api instance to fetch data
      setReportsList(response.data); // Adjust if response structure is different
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
      const response = await api.delete(`course/${id}/`); // Use your api instance to delete data
      console.log("Course deleted successfully:", response.data);
      // Ensure to update the state correctly using functional state update
      setReportsList((prevReports) => prevReports.filter(course => course.id !== id));
      setError(null);
    } catch (err) {
      setError("Failed to delete the report. Please try again.");
      console.error("Error deleting report:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    console.log("Submitting course:", formData);
    setLoading(true);
    try {
      const response = await api.post("course/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Course submitted successfully:", response.data);
      setError(null);
      fetchReports(); // Refetch reports immediately after report submission
    } catch (err) {
      setError("Failed to submit the certificate. Please try again.");
      console.error("Error submitting course:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter reports based on search term
  const filteredCourses = certificateList.filter((course) => {
    const courseName = course.course_name || ''; 
    const platform = course.platform || ''; 
    const search = searchTerm.toLowerCase();

    return (
      courseName.toLowerCase().includes(search) ||
      platform.toLowerCase().includes(search)
    );
  });

  return (
    <>
    <Navbar />
    <div className="workreport-container">
      <h2>Course Report</h2>

      <UploadForm onSubmit={handleSubmit} loading={loading} />

      {error && <div className="error-message">{error}</div>}
      <div>
        <input
          type="text"
          placeholder="Search Certificate"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <h3 className="submitted-reports-heading">Certifications</h3>
      {loading && <p>Loading...</p>}

      <div className="cards-container">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <div className="card" key={course.id}>
              <Link to={`/courses/${course.id}`} className="view-details-btn">
                <h4>{course.course_name}</h4>
                <p>{course.platform}</p>
                </Link>
                  {course.certificate && (
                  <div className="card-media">
                    {course.certificate.endsWith(".jpg") ||
                    course.certificate.endsWith(".jpeg") ||
                    course.certificate.endsWith(".png") ||
                    course.certificate.endsWith(".gif") ? (
                      <img
                        src={course.certificate}
                        alt="Media"
                        style={{ width: "300px", height: "auto" }}
                      />
                    ) : course.certificate.endsWith(".mp4") ||
                      course.certificate.endsWith(".mov") ||
                      course.certificate.endsWith(".avi") ? (
                      <video controls style={{ width: "300px", height: "auto" }}>
                        <source src={course.certificate} />
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <a
                        href={course.certificate}
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
                <Link to={`/courses/${course.id}`} className="view-details-btn">
                <p className="report-date">
                  {course.uploaded_at
                    ? format(new Date(course.uploaded_at), "PPP p")
                    : "Date not available"}
                </p>
              </Link>
              <span
                className="delete-btn"
                onClick={() => handleDelete(course.id)}
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
            <p>Created by <strong><span1>Muneeswaran </span1>& <span2>Sarweshwar...!</span2></strong></p>
          </footer>
    </div>
    </>
  );
};

export default Course;
