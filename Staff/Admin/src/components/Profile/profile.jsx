import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, isValid } from "date-fns";
import api from "../../api";
import "./Profile.css";

const authToken = localStorage.getItem("access");

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [workReports, setWorkReports] = useState([]);
  const [courses, setCourses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showProfile, setShowProfile] = useState(true);
  const [due_at, setDue_at] = useState("");
  const [showWorkReports, setShowWorkReports] = useState(false);
  const [showCourses, setShowCourses] = useState(false);
  const [showProjects, setShowProjects] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const fetchMemberData = async () => {
    if (!username) {
      setError("Username is required in the URL.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const memberResponse = await api.get(`profile/${username}/`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      setMember(memberResponse.data);

      const id = memberResponse.data.user;
      const [workReportsResponse, coursesResponse, projectsResponse] = await Promise.all([
        api.get(`/adm-works/${id}/`, {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
        api.get(`/adm-courses/${id}/`, {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
        api.get(`/adm-projects/${id}/`, {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
      ]);

      setWorkReports(workReportsResponse.data);
      setCourses(coursesResponse.data);
      setProjects(projectsResponse.data);
    } catch (error) {
      console.error("Error fetching member data:", error);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  const handleAssignProject = async () => {
    if (!projectTitle || !projectDescription || !due_at) {
      alert("Please fill in all fields!");
      return;
    }
  
    try {
      // Step 1: Create the project
      const createProjectResponse = await api.post(
        `/project/`, // Replace with your actual API endpoint
        {
          username: username, // Ensure 'username' is properly defined
          title: projectTitle,
          description: projectDescription,
          due_at: due_at,
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
  
      // Retrieve the project ID from the response
      const projectId = createProjectResponse.data?.data?.id || createProjectResponse.data?.id; // Handle nested response
      console.log("Created Project ID:", projectId);
  
      if (!projectId) {
        alert("Failed to retrieve project ID.");
        return;
      }
  
      // Step 2: Assign the project
      const assigneeId = createProjectResponse.data?.data?.user || createProjectResponse.data?.user;; // Assuming 'username' represents the assignee ID
      console.log("Assignee ID:", assigneeId);
  
      if (!assigneeId) {
        alert("Assignee ID is required.");
        return;
      }
  
      await api.post(
        `/assign-project/`, // Replace with your actual API endpoint
        {
          username:username,
          title: projectTitle,
          description: projectDescription,
          due_at: due_at,
          project_id: projectId,
          assignee_id: assigneeId,
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
  
      // Notify success
      alert("Project assigned successfully!");
      
      // Reset form fields and close modal
      setShowModal(false);
      setProjectTitle("");
      setProjectDescription("");
  
      // Refresh the data
      fetchMemberData();
    } catch (error) {
      // Log and display error
      console.error("Error during project creation or assignment:", error);
  
      // Provide detailed error feedback
      const errorMessage = error.response?.data?.message || "An unexpected error occurred.";
      alert(`Failed to create and assign project: ${errorMessage}`);
    }
  };
  
  
  useEffect(() => {
    if (username) {
      fetchMemberData();
    } else {
      setError("Username is required in the URL.");
      setLoading(false);
    }
  }, [username]);

  const formatDate = (date) => {
    const parsedDate = new Date(date);
    return isValid(parsedDate) ? format(parsedDate, "PPP p") : "Invalid Date";
  };

  return (
    <div className="profile-container">
      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}

      {showProfile && member && !loading && (
        <>
          <div className="profile-header">
            <h2>{member.name}'s Profile</h2>
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1); // Go back to the previous page
                } else {
                  navigate("/dashboard"); // Navigate to the home page if there's no history
                }
              }}
            >
              Back
            </button>
          </div>

          <div className="profile-info">
            <img
              src={member.profile_photo}
              alt="Profile"
              className="profile-img"
            />
            <p><strong>Domain:</strong> {member.domain}</p>
            <p><strong>E-Mail:</strong> {member.mail_id}</p>
            <p><strong>Phone-No:</strong> {member.phone_no}</p>
            <p>
              <strong>LinkedIn:</strong>{" "}
              <a
                href={member.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
            </p>
            <p>
              <strong>GitHub:</strong>{" "}
              <a
                href={member.github_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </p>
          </div>

          {/* Work Reports Section */}
          <div className="section">
            <h3 onClick={() => setShowWorkReports((prevState) => !prevState)}>
              Work Reports {showWorkReports ? "▲" : "▼"}
            </h3>
            {showWorkReports && (
              <ul>
                {workReports.length ? (
                  workReports.map((workReport) => (
                    <li key={workReport.id}>
                      <strong>{workReport.title}</strong>
                      <p>{workReport.description}</p>
                      {workReport.media && (
                        <div className="card-media">
                          {workReport.media.endsWith(".jpg") ||
                          workReport.media.endsWith(".jpeg") ||
                          workReport.media.endsWith(".png") ||
                          workReport.media.endsWith(".gif") ? (
                            <img
                              src={workReport.media}
                              alt="Media"
                              style={{ width: "200px", height: "250px" }}
                            />
                          ) : workReport.media.endsWith(".mp4") ||
                            workReport.media.endsWith(".mov") ||
                            workReport.media.endsWith(".avi") ? (
                            <video controls style={{ width: "200px", height: "auto" }}>
                              <source src={workReport.media} />
                              Your browser does not support the video tag.
                            </video>
                          ) : (
                            <a
                              href={workReport.media}
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
                      <p className="report-date">
                        Uploaded on: {formatDate(workReport.created_at)}
                      </p>
                    </li>
                  ))
                ) : (
                  <p>No work reports found</p>
                )}
              </ul>
            )}
          </div>

          {/* Courses Section */}
          <div className="section">
            <h3 onClick={() => setShowCourses((prevState) => !prevState)}>
              Courses {showCourses ? "▲" : "▼"}
            </h3>
            {showCourses && (
              <ul>
                {courses.length ? (
                  courses.map((course) => (
                    <li key={course.id}>
                      <strong>{course.course_name}</strong>
                      <p>{course.platform}</p>
                      {course.certificate && (
                        <div className="card-media">
                          {course.certificate.endsWith(".jpg") ||
                          course.certificate.endsWith(".jpeg") ||
                          course.certificate.endsWith(".png") ||
                          course.certificate.endsWith(".gif") ? (
                            <img
                              src={course.certificate}
                              alt="Media"
                              style={{ width: "200px", height: "250px" }}
                            />
                          ) : course.certificate.endsWith(".mp4") ||
                            course.certificate.endsWith(".mov") ||
                            course.certificate.endsWith(".avi") ? (
                            <video controls style={{ width: "200px", height: "auto" }}>
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
                      <p className="report-date">
                        Completed on: {formatDate(course.uploaded_at)}
                      </p>
                    </li>
                  ))
                ) : (
                  <p>No courses found</p>
                )}
              </ul>
            )}
          </div>

          {/* Projects Section */}
          <div className="section">
            <h3 onClick={() => setShowProjects((prevState) => !prevState)}>
              Projects {showProjects ? "▲" : "▼"}
            </h3>
            {showProjects && (
              <ul>
                {projects.length ? (
                  projects.map((project) => (
                    <li key={project.id}>
                      <strong>{project.project_title}</strong>
                      <p>{project.description}</p>
                      <p className="report-date">
                        Due Date: {formatDate(project.due_at)}
                      </p>
                      {project.proof && (
                        <div className="card-proof">
                          {project.proof.endsWith(".jpg") ||
                          project.proof.endsWith(".jpeg") ||
                          project.proof.endsWith(".png") ||
                          project.proof.endsWith(".gif") ? (
                            <img
                              src={project.proof}
                              alt="proof"
                              style={{ width: "200px", height: "250px" }}
                            />
                          ) : project.proof.endsWith(".mp4") ||
                            project.proof.endsWith(".mov") ||
                            project.proof.endsWith(".avi") ? (
                            <video controls style={{ width: "200px", height: "auto" }}>
                              <source src={project.proof} />
                              Your browser does not support the video tag.
                            </video>
                          ) : (
                            <a
                              href={project.proof}
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
                      <p className="report-date">
                        Assigned on: {formatDate(project.created_at)}
                      </p>
                    </li>
                  ))
                ) : (
                  <p>No projects found</p>
                )}
              </ul>
            )}
          </div>
        </>
      )}

          <footer className="footer">
            <p>Created by <strong><span1>Muneeswaran </span1>& <span2>Sarweshwar...!</span2></strong></p>
          </footer>
   
    </div>
  );
};

export default Profile;
