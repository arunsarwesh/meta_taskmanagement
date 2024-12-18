import React, { useEffect, useState } from "react";
import api from "../../api"; // Assuming `api` is set up for axios or fetch requests
import { useNavigate } from "react-router-dom"; 
import "./Attendance.css"

function Attendance() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedName, setSelectedName] = useState("");
  const [selectedStartDate, setSelectedStartDate] = useState("");
  const [selectedEndDate, setSelectedEndDate] = useState("");
  const [selectedSession, setSelectedSession] = useState(""); // New state for session filtering

  const navigate = useNavigate(); // Initialize navigation hook

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await api.get("adm-attendance/");
        const dataWithSession = response.data.map((item) => {
          const session = getSessionFromTime(item.time); // Assign session based on time
          return { ...item, session }; // Add session to each attendance item
        });
        setAttendanceData(dataWithSession);
        setFilteredData(dataWithSession); // Set both data and filteredData initially
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to fetch attendance data");
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  const getSessionFromTime = (time) => {
    const date = new Date(time);
    const hours = date.getHours();

    if (hours >= 6 && hours < 12) return "Morning"; // Morning session (6 AM to 12 PM)
    if (hours >= 12 && hours < 18) return "Afternoon"; // Afternoon session (12 PM to 6 PM)
    return "Evening"; // Evening session (6 PM to 12 AM)
  };

  const handleNameSelection = (event) => {
    const name = event.target.value;
    setSelectedName(name);
    applyFilters(name, selectedStartDate, selectedEndDate, selectedSession);
  };

  const handleStartDateChange = (event) => {
    const startDate = event.target.value;
    setSelectedStartDate(startDate);
    applyFilters(selectedName, startDate, selectedEndDate, selectedSession);
  };

  const handleEndDateChange = (event) => {
    const endDate = event.target.value;
    setSelectedEndDate(endDate);
    applyFilters(selectedName, selectedStartDate, endDate, selectedSession);
  };

  const handleSessionSelection = (event) => {
    const session = event.target.value;
    setSelectedSession(session);
    applyFilters(selectedName, selectedStartDate, selectedEndDate, session);
  };

  const applyFilters = (name, startDate, endDate, session) => {
    let filtered = attendanceData;

    if (name) {
      filtered = filtered.filter((item) => item.name === name);
    }

    if (startDate) {
      filtered = filtered.filter((item) => {
        const recordDate = new Date(item.time).toISOString().split("T")[0];
        return recordDate >= startDate;
      });
    }

    if (endDate) {
      filtered = filtered.filter((item) => {
        const recordDate = new Date(item.time).toISOString().split("T")[0];
        return recordDate <= endDate;
      });
    }

    if (session) {
      filtered = filtered.filter((item) => item.session === session);
    }

    setFilteredData(filtered);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const uniqueNames = [...new Set(attendanceData.map((item) => item.name))];
  const uniqueSessions = [...new Set(attendanceData.map((item) => item.session))];

  const getRowColor = (session) => {
    if (!session) return "#ffffff";
    if (session === "Morning") return "#00c3ff";
    if (session === "Afternoon") return "#e41414";
    return "#ffffff";
  };

  return (
    <div className="attendance-container">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)} // Go to the previous page
        className="back-button"
      >
        Back
      </button>

      <h1>Attendance Details</h1>

      <div className="filters">
        <div>
          <label htmlFor="name-dropdown">Select Name:</label>
          <select
            id="name-dropdown"
            value={selectedName}
            onChange={handleNameSelection}
          >
            <option value="">All Users</option>
            {uniqueNames.map((name, index) => (
              <option key={index} value={name}>
                {name || "N/A"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="start-date-filter">Start Date:</label>
          <input
            type="date"
            id="start-date-filter"
            value={selectedStartDate}
            onChange={handleStartDateChange}
          />
        </div>

        <div>
          <label htmlFor="end-date-filter">End Date:</label>
          <input
            type="date"
            id="end-date-filter"
            value={selectedEndDate}
            onChange={handleEndDateChange}
          />
        </div>

        <div>
          <label htmlFor="session-dropdown">Select Session:</label>
          <select
            id="session-dropdown"
            value={selectedSession}
            onChange={handleSessionSelection}
          >
            <option value="">All Sessions</option>
            {uniqueSessions.map((session, index) => (
              <option key={index} value={session}>
                {session || "N/A"}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Latitude</th>
              <th>Longitude</th>
              <th>Time</th>
              <th>Session</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((attendance, index) => (
                <tr
                  key={index}
                  style={{ backgroundColor: getRowColor(attendance.session) }}
                >
                  <td>{attendance.name}</td>
                  <td>{attendance.latitude}</td>
                  <td>{attendance.longitude}</td>
                  <td>{new Date(attendance.time).toLocaleString()}</td>
                  <td>{attendance.session}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <footer className="footer">
            <p>Created by <strong><span1>Muneeswaran </span1>& <span2>Sarweshwar...!</span2></strong></p>
          </footer>
    </div>
  );
}

export default Attendance;
