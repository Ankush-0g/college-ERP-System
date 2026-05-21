import React, { useEffect, useMemo, useState } from "react";
import {
  Typography,
  Card,
  CardBody,
  CardHeader,
  Button,
  Checkbox,
  Input,
  Select,
  Option,
} from "@material-tailwind/react";
import { saveAttendance, getProfessorAttendanceEligibility } from "@/API/ApiStore";

const statusMap = {
  Present: "p",
  Absent: "a",
  Late: "l",
};

const statusCycle = {
  Present: "Absent",
  Absent: "Late",
  Late: "Present",
};

export default function AttendanceManagement() {
  const [loading, setLoading] = useState(true);
  const [eligibility, setEligibility] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState("");

  const [students, setStudents] = useState([]); // [{ studentId, name, status }]

  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [time, setTime] = useState("09:00:00");

  const [saveStatus, setSaveStatus] = useState("");

  const professor = useMemo(() => {
    const storedProfessorData = localStorage.getItem("professorData");
    return storedProfessorData ? JSON.parse(storedProfessorData) : null;
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        if (!professor) {
          setSaveStatus("Professor not found in localStorage.");
          return;
        }

        const professorId = professor.id ?? professor.professorId;
        if (!professorId) {
          setSaveStatus("Professor ID missing in localStorage.");
          return;
        }

        const res = await getProfessorAttendanceEligibility(professorId);
        setEligibility(res);

        const firstSubject = res?.subjects?.[0] ?? "";
        setSelectedSubject(firstSubject);

        const studentRows = (res?.students ?? []).map((s) => ({
          studentId: s.studentId,
          name: s.studentName,
          status: "Absent",
        }));
        setStudents(studentRows);
      } catch (e) {
        console.error(e);
        setSaveStatus("Failed to load attendance eligibility.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [professor]);

  const summary = useMemo(() => {
    return {
      present: students.filter((s) => s.status === "Present").length,
      absent: students.filter((s) => s.status === "Absent").length,
      late: students.filter((s) => s.status === "Late").length,
    };
  }, [students]);

  const toggleStatus = (idx) => {
    setStudents((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, status: statusCycle[s.status] } : s))
    );
  };

  const handleSaveAttendance = async () => {
    setSaveStatus("Saving...");
    try {
      const professorLecturerName = professor?.name;
      if (!professorLecturerName || !selectedSubject) {
        throw new Error("Missing professor or subject.");
      }

      const payload = {
        professor: professorLecturerName,
        subject: selectedSubject,
        attendanceDate,
        time,
        students: students.reduce((acc, s) => {
          acc[s.name] = statusMap[s.status] ?? "a";
          return acc;
        }, {}),
      };

      await saveAttendance(payload);
      setSaveStatus("Attendance saved successfully.");
    } catch (error) {
      console.error(error);
      setSaveStatus("Unable to save attendance.");
    }
  };

  if (loading) {
    return (
      <div className="mt-6 space-y-6">
        <Typography variant="h5">Loading attendance...</Typography>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      <Typography variant="h5">Mark Attendance</Typography>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border shadow-sm">
          <CardBody>
            <Typography variant="small" className="text-gray-500">
              Present
            </Typography>
            <Typography variant="h4" className="mt-2">
              {summary.present}
            </Typography>
          </CardBody>
        </Card>

        <Card className="border shadow-sm">
          <CardBody>
            <Typography variant="small" className="text-gray-500">
              Absent
            </Typography>
            <Typography variant="h4" className="mt-2">
              {summary.absent}
            </Typography>
          </CardBody>
        </Card>

        <Card className="border shadow-sm">
          <CardBody>
            <Typography variant="small" className="text-gray-500">
              Late
            </Typography>
            <Typography variant="h4" className="mt-2">
              {summary.late}
            </Typography>
          </CardBody>
        </Card>
      </div>

      <Card className="border shadow-sm">
        <CardHeader floated={false} shadow={false} className="p-6">
          <Typography variant="h6">Attendance Sheet</Typography>
        </CardHeader>

        <CardBody className="p-6 space-y-6">
          <div className="grid gap-4 lg:grid-cols-3">
            <Input
              label="Date"
              value={attendanceDate}
              type="date"
              onChange={(e) => setAttendanceDate(e.target.value)}
            />
            <Input
              label="Time"
              value={time}
              type="time"
              onChange={(e) => setTime(e.target.value)}
            />

            <Select
              label="Subject (assigned by HOD)"
              value={selectedSubject}
              onChange={(value) => setSelectedSubject(value)}
            >
              {(eligibility?.subjects ?? []).map((subj) => (
                <Option key={subj} value={subj}>
                  {subj}
                </Option>
              ))}
            </Select>
          </div>

          {students.length === 0 ? (
            <Typography className="text-center text-red-600">
              No registered students found for your assigned subjects.
            </Typography>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto text-left">
                <thead>
                  <tr>
                    <th className="py-3">Student</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Update</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, idx) => (
                    <tr key={student.studentId ?? idx} className="border-t">
                      <td className="py-3">{student.name}</td>
                      <td className="py-3">{student.status}</td>
                      <td className="py-3">
                        <Checkbox
                          label="Toggle"
                          checked={student.status === "Present"}
                          onChange={() => toggleStatus(idx)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button className="mt-4" onClick={handleSaveAttendance}>
              Save Attendance
            </Button>
            {saveStatus && (
              <Typography variant="small" className="text-gray-600">
                {saveStatus}
              </Typography>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

