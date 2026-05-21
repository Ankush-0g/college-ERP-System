import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Stat,
  Statistic,
} from "@material-tailwind/react";
import axios from "axios";

export function DepartmentOverview({ hodId }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (hodId) {
      fetchStatistics();
    }
  }, [hodId]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8080/api/hod/department/statistics/${hodId}`
      );
      setStats(response.data);
    } catch (err) {
      console.error("Error fetching statistics:", err);
      setError("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Typography>Loading department overview...</Typography>;
  }

  if (!stats) {
    return <Typography color="red">Failed to load statistics</Typography>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border border-blue-gray-100">
        <CardBody className="p-4">
          <Typography color="blue-gray" variant="small" className="font-medium">
            Total Professors
          </Typography>
          <Typography variant="h4" className="mt-2">
            {stats.totalProfessors || 0}
          </Typography>
          <Typography
            variant="small"
            color="blue-gray"
            className="mt-2 opacity-75"
          >
            Teaching Staff
          </Typography>
        </CardBody>
      </Card>

      <Card className="border border-blue-gray-100">
        <CardBody className="p-4">
          <Typography color="blue-gray" variant="small" className="font-medium">
            Total Students
          </Typography>
          <Typography variant="h4" className="mt-2">
            {stats.totalStudents || 0}
          </Typography>
          <Typography
            variant="small"
            color="blue-gray"
            className="mt-2 opacity-75"
          >
            Enrolled Students
          </Typography>
        </CardBody>
      </Card>

      <Card className="border border-blue-gray-100">
        <CardBody className="p-4">
          <Typography color="blue-gray" variant="small" className="font-medium">
            Total Courses
          </Typography>
          <Typography variant="h4" className="mt-2">
            {stats.totalCourses || 0}
          </Typography>
          <Typography
            variant="small"
            color="blue-gray"
            className="mt-2 opacity-75"
          >
            Active Courses
          </Typography>
        </CardBody>
      </Card>

      <Card className="border border-blue-gray-100">
        <CardBody className="p-4">
          <Typography color="blue-gray" variant="small" className="font-medium">
            Subject Assignments
          </Typography>
          <Typography variant="h4" className="mt-2">
            {stats.totalAssignments || 0}
          </Typography>
          <Typography
            variant="small"
            color="blue-gray"
            className="mt-2 opacity-75"
          >
            Active Assignments
          </Typography>
        </CardBody>
      </Card>
    </div>
  );
}

export default DepartmentOverview;
