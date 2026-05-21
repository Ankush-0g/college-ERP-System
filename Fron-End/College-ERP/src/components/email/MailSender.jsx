import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Typography,
  Spinner,
  Select,
  Option,
} from "@material-tailwind/react";
import { sendNotification, getStudents, getAllProfessors } from "@/API/ApiStore";

const MailSender = () => {
  const [recipientType, setRecipientType] = useState("ALL_STUDENTS");
  const [recipientId, setRecipientId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [students, setStudents] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchRecipients = async () => {
      try {
        const [studentData, professorData] = await Promise.all([getStudents(), getAllProfessors()]);
        setStudents(Array.isArray(studentData) ? studentData : []);
        setProfessors(Array.isArray(professorData) ? professorData : []);
      } catch (err) {
        setError(err?.message || JSON.stringify(err));
      }
    };

    fetchRecipients();
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
      recipientType,
      recipientId: recipientId ? Number(recipientId) : null,
      subject,
      message: body,
      sender: "HOD",
    };

    try {
      setIsLoading(true);
      await sendNotification(notificationData);
      setSuccess("Notification sent successfully.");
      setSubject("");
      setBody("");
      setRecipientId("");
      setRecipientType("ALL_STUDENTS");
    } catch (err) {
      setError(err?.message || JSON.stringify(err));
    } finally {
      setIsLoading(false);
    }
  };

  const getRecipientLabel = () => {
    if (recipientType === "STUDENT") return "Select Student";
    if (recipientType === "PROFESSOR") return "Select Professor";
    return "Recipient";
  };

  return (
    <Card className="max-w-2xl mx-auto mt-12 shadow-lg border border-gray-100">
      <CardHeader className="bg-blue-500 text-white p-4 flex items-center justify-between">
        <Typography variant="h5" className="font-semibold">
          Send E-Mail Notification
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
            <Select value={recipientType} onChange={(value) => setRecipientType(value)} className="w-full">
              <Option value="ALL_STUDENTS">All Students</Option>
              <Option value="ALL_PROFESSORS">All Professors</Option>
              <Option value="ALL_STUDENTS_AND_PROFESSORS">All Students + All Professors</Option>
              <Option value="STUDENT">Individual Student</Option>
              <Option value="PROFESSOR">Individual Professor</Option>
            </Select>
          </div>

          {(recipientType === "STUDENT" || recipientType === "PROFESSOR") && (
            <div>
              <Typography variant="small" className="block text-gray-700 font-medium mb-2">
                {getRecipientLabel()}
              </Typography>
              <Select value={recipientId} onChange={(value) => setRecipientId(value)} className="w-full">
                <Option value="">Select One</Option>
                {recipientType === "STUDENT"
                  ? students.map((student) => (
                      <Option key={student.id} value={student.id}>
                        {student.studName || student.email} ({student.email})
                      </Option>
                    ))
                  : professors.map((professor) => (
                      <Option key={professor.id} value={professor.id}>
                        {professor.name || professor.email} ({professor.email})
                      </Option>
                    ))}
              </Select>
            </div>
          )}

          <div>
            <Typography variant="small" className="block text-gray-700 font-medium mb-2">
              Subject
            </Typography>
            <Input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject"
              required
              className="w-full"
            />
          </div>

          <div>
            <Typography variant="small" className="block text-gray-700 font-medium mb-2">
              Message
            </Typography>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message"
              rows="6"
              required
              className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <Button type="submit" color="blue" disabled={isLoading} fullWidth className="flex items-center justify-center">
              {isLoading ? <Spinner className="h-5 w-5" /> : "Send Email Notification"}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
};

export default MailSender;
