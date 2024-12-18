import React, { useState, useEffect } from "react";
import api from "../../api"; // Import the configured API instance
import "./Attendance.css";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar/index.jsx";

const Attendance = () => {
  const [location, setLocation] = useState({ latitude: "", longitude: "" });
  const [showDetails, setShowDetails] = useState(false);
  const [message, setMessage] = useState("");
  const [dateTime, setDateTime] = useState(""); // State for storing the date-time
  const [morningMarked, setMorningMarked] = useState(false); // Track morning attendance
  const [afternoonMarked, setAfternoonMarked] = useState(false); // Track afternoon attendance
  const navigate = useNavigate();

  // Function to get the current date in "YYYY-MM-DD" format
  const getCurrentDate = () => {
    const current = new Date();
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, "0");
    const day = String(current.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`; // Format: YYYY-MM-DD
  };

  // Function to get the current date-time in "YYYY-MM-DD HH:mm:ss" format (in UTC)
  const getCurrentDateTime = () => {
    const current = new Date();
    return current.toISOString().replace("T", " ").substring(0, 19); // Convert to "YYYY-MM-DD HH:mm:ss"
  };

  // Function to check if the current time is within allowed attendance time ranges
  const getTimeRange = () => {
    const currentTime = new Date();
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();

    // Convert current time to minutes since midnight
    const currentMinutes = hours * 60 + minutes;

    // Define the time ranges in minutes since midnight
    const morningStart = 8 * 60 + 30; // 8:30 AM
    const morningEnd = 9 * 60 + 50; // 9:20 AM
    const afternoonStart = 13 * 60 + 45; // 1:45 PM
    const afternoonEnd = 14 * 60 + 30; // 2:30 PM

    // Determine if it's morning or afternoon based on the time
    if (currentMinutes >= morningStart && currentMinutes <= morningEnd) return "morning";
    if (currentMinutes >= afternoonStart && currentMinutes <= afternoonEnd) return "afternoon";

    return null; // Invalid time range
  };

  // Load the attendance state on component mount
  useEffect(() => {
    const todayDate = getCurrentDate();
    const attendanceStatus = JSON.parse(localStorage.getItem("attendanceStatus")) || {};

    // Check if morning or afternoon attendance is already marked
    if (attendanceStatus[todayDate]?.morning) setMorningMarked(true);
    if (attendanceStatus[todayDate]?.afternoon) setAfternoonMarked(true);

    // Update the dateTime every second
    const intervalId = setInterval(() => {
      setDateTime(getCurrentDateTime());
    }, 1000);

    return () => clearInterval(intervalId); // Cleanup the interval on unmount
  }, []);

  // Function to fetch the user's location
  const fetchLocation = () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const locationData = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            setLocation(locationData);
            resolve(locationData);
          },
          (error) => {
            reject(error);
          }
        );
      } else {
        reject(new Error("Geolocation is not supported by your browser."));
      }
    });
  };

  // Function to handle the "Mark Attendance" button click
  const handleAttendanceClick = async () => {
    const todayDate = getCurrentDate();
    const timeRange = getTimeRange();

    if (!timeRange) {
      setMessage("Attendance can only be marked during specific time ranges.");
      return;
    }

    const attendanceStatus = JSON.parse(localStorage.getItem("attendanceStatus")) || {};
    const alreadyMarked = attendanceStatus[todayDate]?.[timeRange];

    if (alreadyMarked) {
      setMessage(`You have already marked ${timeRange} attendance for today.`);
      return;
    }

    try {
      const locationData = await fetchLocation();

      const attendanceData = {
        username: localStorage.getItem("username"),
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        time: getCurrentDateTime(), // Send current time in "YYYY-MM-DD HH:mm:ss" format
      };

      console.log("Attendance Data Sent:", attendanceData); // Debug log

      const response = await api.post("attendance/", attendanceData);

      // Update local storage for attendance status
      attendanceStatus[todayDate] = attendanceStatus[todayDate] || {};
      attendanceStatus[todayDate][timeRange] = true;
      localStorage.setItem("attendanceStatus", JSON.stringify(attendanceStatus));

      setMessage(`Attendance marked successfully for ${timeRange}!`);
      setShowDetails(true);

      // Update state for attendance marking
      if (timeRange === "morning") setMorningMarked(true);
      if (timeRange === "afternoon") setAfternoonMarked(true);

      console.log("Response:", response.data);
    } catch (error) {
      console.error("Error posting attendance:", error.message);
      setMessage(error.message || "Failed to mark attendance.");
    }
  };

  return (
    <>
    <Navbar />
    <div className="attendance-page">
      
      <div className="attendance-card">
        <h1>Mark Your Attendance</h1>
        <button
          onClick={handleAttendanceClick}
          disabled={morningMarked && afternoonMarked}
        >
          Mark Attendance
        </button>

        {showDetails && (
          <>
            <div className="date-time">
              <p>
                <b>Date & Time:</b> {dateTime}
              </p>
            </div>
            <div className="location">
              <p>
                <u>Location</u>
              </p>
              <p>Latitude: {location.latitude}</p>
              <p>Longitude: {location.longitude}</p>
            </div>
          </>
        )}

        {message && <div className="message">{message}</div>}
      </div>

      <footer className="footer">
            <p>Created by <strong><span1>Muneeswaran </span1>& <span2>Sarweshwar...!</span2></strong></p>
          </footer>

    </div>
    </>
  );
};

export default Attendance;
