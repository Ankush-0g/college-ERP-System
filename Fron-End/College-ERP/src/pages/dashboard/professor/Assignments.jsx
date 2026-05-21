import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Textarea,
} from "@material-tailwind/react";
import { getProfessorAssignments, uploadAssignment } from "../../../API/ApiStore";

export default function Assignments() {
  const [form, setForm] = useState({ title: "", course: "", deadline: "", description: "", file: null });
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getProfessorAssignments();
      setAssignments(data || []);
    } catch (err) {
      setError(err?.toString() || "Unable to load assignments");
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    setSaving(true);
    setError("");
    try {
      await uploadAssignment({
        title: form.title,
        course: form.course,
        deadline: form.deadline,
        description: form.description,
        fileName: form.file?.name || "",
        professorId: 1,
      });
      setForm({ title: "", course: "", deadline: "", description: "", file: null });
      await fetchAssignments();
      alert("Assignment published successfully.");
    } catch (err) {
      setError(err?.toString() || "Failed to publish assignment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-6 space-y-6">
      <Typography variant="h5">Upload & Manage Assignments</Typography>

      <Card className="border shadow-sm">
        <CardHeader floated={false} shadow={false} className="p-6">
          <Typography variant="h6">New Assignment</Typography>
        </CardHeader>
        <CardBody className="p-6 space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Input
              label="Assignment Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <Input
              label="Course"
              value={form.course}
              onChange={(e) => setForm({ ...form, course: e.target.value })}
            />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Input
              type="date"
              label="Deadline"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
            <Input
              type="file"
              label="Upload File"
              onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })}
            />
          </div>
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          {error && <Typography color="red">{error}</Typography>}
          <Button disabled={saving} onClick={handlePublish}>
            {saving ? "Publishing..." : "Publish Assignment"}
          </Button>
        </CardBody>
      </Card>

      <Card className="border shadow-sm">
        <CardHeader floated={false} shadow={false} className="p-6">
          <Typography variant="h6">Assignments to Review</Typography>
        </CardHeader>
        <CardBody className="p-6 space-y-4">
          {loading && <Typography>Loading assignments...</Typography>}
          {!loading && assignments.length === 0 && (
            <Typography>No assignments available yet.</Typography>
          )}
          {!loading && assignments.map((assignment) => (
            <div key={assignment.id} className="rounded-xl border p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <Typography className="font-medium">{assignment.title}</Typography>
                  <Typography variant="small" className="text-gray-500">
                    {assignment.course} • Due {assignment.deadline}
                  </Typography>
                </div>
                <div className="flex items-center gap-3">
                  <Typography variant="small" className="text-gray-600">
                    {assignment.fileName ? `File: ${assignment.fileName}` : "No file uploaded"}
                  </Typography>
                  <Button size="sm">Review Submissions</Button>
                </div>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
