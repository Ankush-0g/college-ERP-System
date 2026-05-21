import React, { useState } from "react";
import { Typography, Card, CardBody, Button, Input, Textarea } from "@material-tailwind/react";
import { submitAssignment } from "../../../API/ApiStore";

export default function SubmitAssignment() {
  const [assignment, setAssignment] = useState({ title: "", description: "", file: null });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!assignment.title || !assignment.description) {
      setMessage("Please complete the assignment title and description.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      await submitAssignment({
        studentId: 1,
        title: assignment.title,
        description: assignment.description,
        fileName: assignment.file?.name || "",
      });
      setAssignment({ title: "", description: "", file: null });
      setMessage("Assignment submitted successfully.");
    } catch (error) {
      setMessage(error?.toString() || "Failed to submit assignment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-6 space-y-6">
      <Typography variant="h5">Submit Assignments</Typography>
      <Card className="border shadow-sm">
        <CardBody className="space-y-4">
          <Input
            label="Assignment Title"
            value={assignment.title}
            onChange={(e) => setAssignment({ ...assignment, title: e.target.value })}
          />
          <Textarea
            label="Description"
            value={assignment.description}
            onChange={(e) => setAssignment({ ...assignment, description: e.target.value })}
          />
          <Input
            type="file"
            label="Upload File"
            onChange={(e) => setAssignment({ ...assignment, file: e.target.files?.[0] || null })}
          />
          {message && <Typography color={message.includes("Failed") ? "red" : "green"}>{message}</Typography>}
          <Button disabled={submitting} onClick={handleSubmit}>
            {submitting ? "Submitting..." : "Submit Assignment"}
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
