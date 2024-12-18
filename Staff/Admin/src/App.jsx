import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login/Login";
import Dashboard from "./components/Dashboard/Dashboard";  
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./components/NotFound";
import Profile from "./components/Profile/profile"
import Attendance from "./components/Attendance/Attendance";
import Course from "./components/pages/course";
import project from "./components/pages/project";
import report from "./components/pages/work-report";

function App() {


  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          <Login />

        } 
        />
        <Route path="/work:id" element={
          <ProtectedRoute>
          <report />
          </ProtectedRoute>

        }
        />
        <Route path="/course:id" element={
          <ProtectedRoute>
          <Course />
          </ProtectedRoute>

        } 
        />
        <Route path="/project:id" element={
          <ProtectedRoute>
          <project />
          </ProtectedRoute>

        } 
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
            <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="/profile/:username" 
        element={
          <ProtectedRoute>
          <Profile />
          </ProtectedRoute>
        }
        />

        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
            <Attendance />
            </ProtectedRoute>
          } 
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
