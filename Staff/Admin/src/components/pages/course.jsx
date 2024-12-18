import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import api from "../../api";



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
  const [showWorkReports, setShowWorkReports] = useState(false);
  const [showCourses, setShowCourses] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [newProject, setNewProject] = useState({ title: "", description: "", due_at: "" });


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
      const workReportsResponse = await api.get(`/adm-works/${id}/`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setWorkReports(workReportsResponse.data);

      const coursesResponse = await api.get(`/adm-courses/${id}/`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setCourses(coursesResponse.data);

      const projectsResponse = await api.get(`/adm-projects/${id}/`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setProjects(projectsResponse.data);
    } catch (error) {
      console.error("Error fetching member data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignProject = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(
        `/adm-projects/${member.user}/`,
        { ...newProject },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      setProjects((prevProjects) => [...prevProjects, response.data]); // Update projects list
      setShowAssignModal(false); // Close modal
      setNewProject({ title: "", description: "", due_at: "" }); // Reset form
    } catch (error) {
      console.error("Error assigning project:", error);
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

  return (
    <div className="profile-container">
      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}

      {showProfile && member && !loading && (
        <>
          <h2>{member.name}'s Profile</h2>
          <button
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1); // Go back to the previous page
              } else {
                navigate("/dashboard"); // Navigate to the dashboard if no history
              }
            }}
          >
            Back
          </button>
          <button
                onClick={() => setShowAssignModal(true)} // Open modal
                className="assign-btn"
              >
                Assign Project
              </button>

          <div className="profile-info">
            <img
              src={member.profile_photo}
              alt="Profile"
              className="profile-img"
            />
            <p>
              <strong>Domain:</strong> {member.domain}
            </p>
            <p>
              <strong>E-Mail:</strong> {member.mail_id}
            </p>
            <p>
              <strong>Phone-No:</strong> {member.phone_no}
            </p>
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
            <h3>
              Work Reports
              <button 
                onClick={() => {
                  setShowWorkReports((prevState) => !prevState);
                  navigate("");  // Change this to your desired path
                }}
                className="wrk-btn"
              >
                {showWorkReports ? "Hide" : "View"}
              </button>
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
                              style={{ width: "100px", height: "auto" }}
                            />
                          ) : workReport.media.endsWith(".mp4") ||
                            workReport.media.endsWith(".mov") ||
                            workReport.media.endsWith(".avi") ? (
                            <video controls style={{ width: "240px", height: "200px" }}>
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
                        {format(new Date(workReport.created_at), "PPP p")}
                      </p>
                    </li>
                  ))
                ) : (
                  <p>No work reports found</p>
                )}
              </ul>
            )}
          </div>

          {/* Courses Completed Section */}
          <div className="section">
            <h3>
              Courses Completed
              <button
               onClick={() => {
                setShowCourses((prevState) => !prevState);
                navigate("");  // Change this to your desired path
              }}
              className="toggle-btn"
              >
                {showCourses ? "Hide" : "View"}
              </button>
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
                          <img
                            src={course.certificate}
                            alt="Certificate"
                            style={{ width: "100px", height: "auto" }}
                          />
                        </div>
                      )}
                      <p className="course-date">
                        {format(new Date(course.uploaded_at), "PPP p")}
                      </p>
                    </li>
                  ))
                ) : (
                  <p>No courses found</p>
                )}
              </ul>
            )}
          </div>

          {/* Projects Completed Section */}
          <div className="section">
            
            <h3>
              Projects Completed
              <button
                 onClick={() => {
                  setShowProjects((prevState) => !prevState);
                  navigate("");  // Change this to your desired path
                }}
                className="prjct-btn"
                >
                {showProjects ? "Hide" : "View"}
              </button>
            </h3>
            {showProjects && (
              <ul>
                {projects.length ? (
                  projects.map((project) => (
                    <li key={project.id}>
                      <strong>{project.project_title}</strong>
                      <p>{project.description}</p>
                      <p className="course-date">
                        {format(new Date(project.due_at), "PPP p")}
                      </p>
                    </li>
                  ))
                ) : (
                  <p>No projects found</p>
                )}
              </ul>
            )}

             {/* Modal for Assigning Projects */}
             {showAssignModal && (
              <div className="modal">
                <div className="modal-content">
                  <h4>Assign a New Project</h4>
                  <form onSubmit={handleAssignProject}>
                    <label>
                      Project Title:
                      <input
                        type="text"
                        value={newProject.title}
                        onChange={(e) =>
                          setNewProject((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        required
                      />
                    </label>
                    <label>
                      Description:
                      <textarea
                        value={newProject.description}
                        onChange={(e) =>
                          setNewProject((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        required
                      ></textarea>
                    </label>
                    <label>
                      Due Date:
                      <input
                        type="date"
                        value={newProject.due_at}
                        onChange={(e) =>
                          setNewProject((prev) => ({
                            ...prev,
                            due_at: e.target.value,
                          }))
                        }
                        required
                      />
                    </label>
                    <button type="submit" className="save-btn">
                      Save
                    </button>
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => setShowAssignModal(false)}
                    >
                      Cancel
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Profile;
