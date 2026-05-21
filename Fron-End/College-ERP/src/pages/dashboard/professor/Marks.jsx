import React, { useState } from "react";
import {
  Typography,
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
} from "@material-tailwind/react";
import { enterMarks } from "../../../API/ApiStore";

const students = [
  { id: 1, name: "Aarav Singh", internal: 24, external: 60 },
  { id: 2, name: "Priya Rao", internal: 22, external: 58 },
  { id: 3, name: "Vikram Patel", internal: 25, external: 62 },
];

export default function Marks() {
  const [marks, setMarks] = useState(students);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const updateMark = (id, field, value) => {
    setMarks((prev) =>
      prev.map((student) =>
        student.id === id ? { ...student, [field]: Number(value) } : student
      )
    );
  };

  const handleSaveMarks = async () => {
    setSaving(true);
    setMessage("");
    try {
      const payload = {
        professorId: 1,
        marks: marks.map((student) => ({
          studentId: student.id,
          studentName: student.name,
          internal: student.internal,
          external: student.external,
          total: student.internal + student.external,
        })),
      };
      await enterMarks(payload);
      setMessage("Marks saved successfully.");
    } catch (error) {
      setMessage(error?.toString() || "Failed to save marks.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-6 space-y-6">
      <Typography variant="h5">Enter Internal/External Marks</Typography>
      <Card className="border shadow-sm">
        <CardHeader floated={false} shadow={false} className="p-6">
          <Typography variant="h6">Mark Entry</Typography>
        </CardHeader>
        <CardBody className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full table-auto text-left">
              <thead>
                <tr>
                  <th className="py-3">Student</th>
                  <th className="py-3">Internal</th>
                  <th className="py-3">External</th>
                </tr>
              </thead>
              <tbody>
                {marks.map((student) => (
                  <tr key={student.id} className="border-t">
                    <td className="py-3">{student.name}</td>
                    <td className="py-3">
                      <Input
                        type="number"
                        value={student.internal}
                        onChange={(e) => updateMark(student.id, "internal", e.target.value)}
                      />
                    </td>
                    <td className="py-3">
                      <Input
                        type="number"
                        value={student.external}
                        onChange={(e) => updateMark(student.id, "external", e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {message && <Typography color={message.includes("Failed") ? "red" : "green"}>{message}</Typography>}
          <div className="mt-4 flex flex-wrap gap-3">
            <Button disabled={saving} onClick={handleSaveMarks}>
              {saving ? "Saving..." : "Save Marks"}
            </Button>
            <Button color="green">Generate Mark Sheet</Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
