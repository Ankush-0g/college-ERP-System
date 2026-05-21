import { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Typography,
  Select,
  Option,
  Spinner,
} from "@material-tailwind/react";
import { sendNotification, getStudents, getAllProfessors } from "@/API/ApiStore";

const NotificationSender = () => {
  const [recipientType, setRecipientType] = useState("ALL_STUDENTS");
  const [recipientId, setRecipientId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [sender, setSender] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadRecipients = async () => {
      try {
        const [studentData, professorData] = await Promise.all([getStudents(), getAllProfessors()]);
        setStudents(Array.isArray(studentData) ? studentData : []);
        setProfessors(Array.isArray(professorData) ? professorData : []);
      } catch (err) {
        setError(err?.message || JSON.stringify(err));
      }
    };
    loadRecipients();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if ((recipientType === "STUDENT" || recipientType === "PROFESSOR") && !recipientId) {
      setError("Please select a recipient.");
      return;
    }

    const notificationData = {
      title,
      message,
      subject,
      recipientType,
      recipientId: recipientId ? Number(recipientId) : null,
      sender: sender || "HOD",
    };

    try {
      setIsLoading(true);
      await sendNotification(notificationData);
      setSuccess("Notification sent successfully.");
      resetForm();
    } catch (err) {
      setError(err?.message || JSON.stringify(err));
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setMessage("");
    setSubject("");
    setSender("");
    setRecipientId("");
    setRecipientType("ALL_STUDENTS");
  };

  return (
    <Card className="max-w-lg mx-auto mt-12 shadow-lg border border-gray-100">
      <CardHeader className="bg-blue-600 text-white p-4">
        <Typography variant="h5" className="font-semibold">
          Send Notification
        </Typography>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <Typography color="red">{error}</Typography>}
          {success && <Typography color="green">{success}</Typography>}

          <div>
            <Typography variant="small" className="block text-gray-700 font-medium mb-2">
              Recipient Type
            </Typography>
            <Select
              value={recipientType}
              onChange={(value) => setRecipientType(value)}
              className="w-full"
            >
              <Option value="ALL_STUDENTS">ALL_STUDENTS</Option>
              <Option value="STUDENT">STUDENT</Option>
              <Option value="ALL_PROFESSORS">ALL_PROFESSORS</Option>
              <Option value="PROFESSOR">PROFESSOR</Option>
              <Option value="ALL_STUDENTS_AND_PROFESSORS">ALL_STUDENTS_AND_PROFESSORS</Option>
            </Select>
          </div>

          {(recipientType === "STUDENT" || recipientType === "PROFESSOR") && (
            <div>
              <Typography variant="small" className="block text-gray-700 font-medium mb-2">
                {recipientType === "STUDENT" ? "Select Student" : "Select Professor"}
              </Typography>
              <Select
                value={recipientId}
                onChange={(value) => setRecipientId(value)}
                className="w-full"
              >
                <Option value="">Select recipient</Option>
                {(recipientType === "STUDENT" ? students : professors).map((item) => (
                  <Option key={item.id} value={item.id}>
                    {recipientType === "STUDENT"
                      ? `${item.studName || item.email} (${item.email})`
                      : `${item.name || item.email} (${item.email})`}
                  </Option>
                ))}
              </Select>
            </div>
          )}

          <div>
            <Typography variant="small" className="block text-gray-700 font-medium mb-2">
              Notification Title
            </Typography>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter notification title"
              required
              className="w-full"
            />
          </div>

          <div>
            <Typography variant="small" className="block text-gray-700 font-medium mb-2">
              Message
            </Typography>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message"
              rows="4"
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <Typography variant="small" className="block text-gray-700 font-medium mb-2">
              Subject
            </Typography>
            <Input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject"
              className="w-full"
            />
          </div>

          <div>
            <Typography variant="small" className="block text-gray-700 font-medium mb-2">
              Sender
            </Typography>
            <Input
              type="text"
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              placeholder="Enter sender name"
              className="w-full"
            />
          </div>

          <div>
            <Button
              type="submit"
              color="blue"
              fullWidth
              className="flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? <Spinner className="h-5 w-5" /> : "Send Notification"}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
};

export default NotificationSender;
