import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../Components/Navbar/index";
import api from "../../api"; // Axios instance with token handling
import { format } from "date-fns";
import "./Course.css";

const CourseDetails = () => {
  const { id } = useParams(); // Get the course ID from the URL
  const [course, setCourse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch the specific course by ID
  const fetchCourse = async () => {
    setLoading(true);
    try {
      const response = await api.get(`course/${id}/`);
      setCourse(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch the course.");
      console.error("Error fetching course:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="course-details-container">
      <Navbar />
      {course ? (
        <>
          <h2> Course Name: {course.course_name} </h2> <br />
          <p><u className="det">Platform:</u>
            <b className="det_p"><tt>{course.platform}</tt></b>
          </p><br />

          {/* Certificate rendering */}
        
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
          <p className="det">
            Submitted on: {format(new Date(course.uploaded_at), "PPP p")}
          </p>
        </>
      ) : (
        <p>No details available for this course.</p>
      )}
    </div>
  );
};

export default CourseDetails;
