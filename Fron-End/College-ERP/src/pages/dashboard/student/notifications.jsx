import React, { useState, useEffect } from "react";
import {
  Typography,
  Alert,
  Card,
  CardHeader,
  CardBody,
} from "@material-tailwind/react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import axios from "axios";

export function Notifications({ studentId }) {
  const [notifications, setNotifications] = useState([]);
  const [showAlerts, setShowAlerts] = useState({});
  const [student, setStudent] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to use prop first, then fall back to localStorage
    if (studentId) {
      setStudent({ id: studentId });
      return;
    }

    const storedStudentData = localStorage.getItem("studentData");
    const storedStudentId = localStorage.getItem("studentId");

    if (storedStudentData) {
      try {
        const studentData = JSON.parse(storedStudentData);
        setStudent(studentData);
      } catch (e) {
        console.error("Failed to parse studentData from localStorage", e);
        setError("No valid student data. Please log in again.");
      }
    } else if (storedStudentId) {
      setStudent({ id: Number(storedStudentId) });
    } else {
      setError("No student data available. Please log in again.");
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (!student || !student.id) return;

        const response = await axios.get(
          `http://localhost:8080/api/notifications/student/${student.id}`
        );

        setNotifications(response.data || []);

        // Initialize showAlerts state
        const initialAlerts = (response.data || []).reduce((acc, n) => {
          acc[n.id] = true;
          return acc;
        }, {});

        setShowAlerts(initialAlerts);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError("Failed to load notifications. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [student]);

  const handleCloseAlert = (notificationId) => {
    setShowAlerts((prev) => ({ ...prev, [notificationId]: false }));
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <div className="mx-auto my-20 flex max-w-screen-lg flex-col gap-8">
      <Card>
        <CardHeader
          color="transparent"
          floated={false}
          shadow={false}
          className="m-0 p-4"
        >
          <Typography variant="h5" color="blue-gray">
            Notifications
          </Typography>
        </CardHeader>
        <CardBody className="flex flex-col gap-4 p-4">
          {error && (
            <Alert color="red" icon={<InformationCircleIcon className="h-6 w-6" />}>
              {error}
            </Alert>
          )}

          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <Alert
                key={notification.id}
                open={showAlerts[notification.id]}
                color="blue"
                icon={<InformationCircleIcon strokeWidth={2} className="h-6 w-6" />}
                onClose={() => handleCloseAlert(notification.id)}
              >
                <strong>{notification.title}</strong>: {notification.message}
              </Alert>
            ))
          ) : (
            <Typography>No notifications available.</Typography>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default Notifications;
