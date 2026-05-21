import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
  CardBody,
  CardHeader,
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  Select,
  Option,
} from "@material-tailwind/react";
import {
  getProfessors,
  getSubjects,
  assignProfessorToSubject,
} from "@/API/ApiStore";

export default function AssignProfessors() {
  const [subjects, setSubjects] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedProfessor, setSelectedProfessor] = useState("");
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [subjectsData, professorsData] = await Promise.all([
        getSubjects(),
        getProfessors(),
      ]);
      setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
      setProfessors(Array.isArray(professorsData) ? professorsData : []);
    } catch (err) {
      setError(err?.message || JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openDialog = (subject) => {
    setSelectedSubject(subject);
    setSelectedProfessor(subject.assignedProfessor?.id?.toString() || "");
    setOpen(true);
  };

  const handleSave = async () => {
    if (!selectedSubject || !selectedProfessor) {
      setError("Please select a professor.");
      return;
    }

    setActionLoading(true);
    setError("");
    try {
      await assignProfessorToSubject(selectedSubject.id, Number(selectedProfessor));
      setOpen(false);
      setSelectedSubject(null);
      setSelectedProfessor("");
      fetchData();
    } catch (err) {
      setError(err?.message || JSON.stringify(err));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <Typography variant="h5">Assign Professors to Subjects</Typography>
      </div>

      <Card>
        <CardHeader shadow={false} floated={false} className="p-4">
          <Typography variant="small" className="text-gray-600">
            Subject allocations
          </Typography>
        </CardHeader>
        <CardBody className="p-4">
          {loading ? (
            <Typography>Loading...</Typography>
          ) : error ? (
            <Typography color="red">{error}</Typography>
          ) : subjects.length === 0 ? (
            <Typography>No subjects available.</Typography>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] table-auto">
                <thead>
                  <tr>
                    <th className="text-left py-2">Subject</th>
                    <th className="text-left py-2">Course</th>
                    <th className="text-left py-2">Assigned Professor</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((subject) => (
                    <tr key={subject.id} className="border-t">
                      <td className="py-2">{subject.name}</td>
                      <td className="py-2">{subject.course?.name || subject.courseName}</td>
                      <td className="py-2">
                        {subject.assignedProfessor?.name || "Unassigned"}
                      </td>
                      <td className="py-2">
                        {subject.assignedProfessor ? "Assigned" : "Pending"}
                      </td>
                      <td className="py-2">
                        <Button size="sm" onClick={() => openDialog(subject)}>
                          Assign
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      <Dialog open={open} handler={() => setOpen(!open)} size="sm">
        <DialogBody>
          <Typography variant="h6" className="mb-2">
            Assign Professor for {selectedSubject?.name}
          </Typography>

          <Select
            label="Professor"
            value={selectedProfessor}
            onChange={(value) => setSelectedProfessor(value)}
          >
            <Option value="">Select Professor</Option>
            {professors.map((prof) => (
              <Option key={prof.id} value={prof.id?.toString()}>
                {prof.name}
              </Option>
            ))}
          </Select>

          {selectedSubject?.course && (
            <Typography variant="small" className="text-gray-500 mt-3 block">
              Course: {selectedSubject.course.name}
            </Typography>
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button color="blue" onClick={handleSave} disabled={actionLoading}>
            {actionLoading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
