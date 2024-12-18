import React, { useEffect, useState } from "react";
import api from "../../api";

const DashboardStats = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("statistics/");
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    };

    fetchStats();
  }, []);

  if (!stats) return <div>Loading...</div>;

  return (
    <div>
      <h3>Statistics</h3>
      <p>Total Profiles: {stats.total_profiles}</p>
      <p>Total Courses: {stats.total_courses}</p>
      <p>Total Projects: {stats.total_projects}</p>

      <h4>Individual Stats</h4>
      {stats.individual_counts.map((user) => (
        <div key={user.username}>
          <p>Username: {user.username}</p>
          <p>Profile Count: {user.profile_count}</p>
          <p>Course Count: {user.course_count}</p>
          <p>Project Count: {user.project_count}</p>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
