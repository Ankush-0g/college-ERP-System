import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Select,
  Option,
  Checkbox,
  Alert,
} from "@material-tailwind/react";
import axios from "axios";

export function ProfessorAttendance() {
  const [professorData, setProfessorData] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const storedProfessor = localStorage.getItem("professorData");
    if (storedProfessor) {
      const professor = JSON.parse(storedProfessor);
      setProfessorData(professor);
      fetchAssignments(professor.id);
    }
  }, []);

  const fetchAssignments = async (professorId) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/professor-assignments/professor/${professorId}`
      );
      setAssignments(response.data || []);
    } catch (err) {
      console.error("Error fetching assignments:", err);
    }
  };

  const fetchStudentsForAssignment = async (assignment) => {
    try {
      setLoading(true);
      setError("");
      setAttendance({});

      const courseId = assignment?.courseId ?? assignment?.course?.id;
      const courseName = assignment?.courseName ?? assignment?.course?.name;
      const semester = assignment?.semester;

      if (!semester || (!courseId && !courseName)) {
        setStudents([]);
        setError("Selected assignment is missing course or semester details.");
        return;
      }

      // Fetch students by course name and semester
      const response = await axios.get(
        "http://localhost:8080/api/students/by-course-semester",
        {
          params: {
            courseId: courseId ?? undefined,
            courseName: courseId ? undefined : courseName,
            semester,
          },
        }
      );

      const fetchedStudents = Array.isArray(response.data) ? response.data : [];

      setStudents(fetchedStudents);

      // Initialize attendance object
      const initAttendance = {};
      fetchedStudents.forEach((student) => {
        const studentKey = student?.id ?? student?.studentId;
        if (studentKey !== null && studentKey !== undefined) {
          initAttendance[studentKey] = true; // Default to present
        }
      });
      setAttendance(initAttendance);
    } catch (err) {
      console.error("Error fetching students:", err);
      setStudents([]);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load students"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentChange = (assignmentId) => {
    const assignment = assignments.find(
      (a) => a?.id !== null && a?.id !== undefined && a.id.toString() === assignmentId
    );
    setSelectedAssignment(assignment);
    const firstSubjectId = (assignment?.subjectIds || []).find(
      (id) => id !== null && id !== undefined
    );
    setSelectedSubjectId(
      firstSubjectId !== null && firstSubjectId !== undefined
        ? firstSubjectId.toString()
        : ""
    );
    if (assignment) {
      fetchStudentsForAssignment(assignment);
    }
  };

  const toggleAttendance = (studentId) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const selectedSubjectOptions = (selectedAssignment?.subjectIds || []).reduce(
    (acc, subjectId, index) => {
      if (subjectId === null || subjectId === undefined) {
        return acc;
      }

      const subjectName =
        selectedAssignment?.subjectNames?.[index] || `Subject ${subjectId}`;

      acc.push({
        key: `${subjectId}-${index}`,
        value: subjectId.toString(),
        label: subjectName,
      });

      return acc;
    },
    []
  );

  const handleSubmitAttendance = async () => {
    if (!selectedAssignment) {
      setError("Please select an assignment first");
      return;
    }

    if (!selectedSubjectId) {
      setError("Please select an assigned subject");
      return;
    }

    if (Object.values(attendance).filter(v => v !== null && v !== undefined).length === 0) {
      setError("Please mark attendance for at least one student");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const attendanceMarkingRequest = {
        professorId: professorData.id,
        subjectId: Number(selectedSubjectId),
        courseId: selectedAssignment.courseId,
        semester: selectedAssignment.semester,
        attendanceDate: selectedDate,
        studentAttendance: attendance,
        remarks: "",
      };

      const response = await axios.post(
        "http://localhost:8080/api/attendance/mark",
        attendanceMarkingRequest
      );

      setSuccess(`Attendance marked successfully for ${response.data.count} students`);
      setAttendance({});
      setSelectedAssignment(null);
      setStudents([]);

      setTimeout(() => {
        setSuccess("");
      }, 5000);
    } catch (err) {
      console.error("Error marking attendance:", err);
      setError(err.response?.data?.message || "Failed to mark attendance");
    } finally {
      setLoading(false);
    }
  };

  if (!professorData) {
    return (
      <div className="m-8">
        <Card>
          <CardBody>
            <Typography color="red">Professor data not found</Typography>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="m-8">
      <Card className="border border-blue-gray-100 shadow-sm">
        <CardHeader variant="gradient" color="indigo" className="mb-6 p-6">
          <Typography variant="h4" color="white">
            Mark Attendance
          </Typography>
          <Typography variant="small" color="white" className="opacity-80 mt-2">
            Only students from your assigned subjects and semesters are shown
          </Typography>
        </CardHeader>

        <CardBody className="px-6 py-8">
          {error && (
            <Alert color="red" className="mb-4">
              {error}
            </Alert>
          )}
          {success && (
            <Alert color="green" className="mb-4">
              {success}
            </Alert>
          )}

          {/* Selection Controls */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Select Course & Semester
              </label>
              <Select
                value={selectedAssignment?.id?.toString() || ""}
                onChange={(value) => handleAssignmentChange(value)}
              >
                <Option value="">Choose an assignment</Option>
                {assignments
                  .filter((assignment) => assignment?.id !== null && assignment?.id !== undefined)
                  .map((assignment) => (
                  <Option key={assignment.id} value={assignment.id.toString()}>
                    {assignment.courseName} - Semester {assignment.semester}
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Select Assigned Subject
              </label>
              <Select
                value={selectedSubjectId}
                onChange={(value) => setSelectedSubjectId(value || "")}
                disabled={!selectedAssignment}
              >
                <Option value="">Choose a subject</Option>
                {selectedSubjectOptions.map((subject) => (
                  <Option key={subject.key} value={subject.value}>
                    {subject.label}
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2"
              />
            </div>

            <div className="flex items-end">
              <Button
                color="blue"
                onClick={handleSubmitAttendance}
                disabled={!selectedAssignment || !selectedSubjectId || students.length === 0 || loading}
                className="w-full"
              >
                {loading ? "Marking..." : "Submit Attendance"}
              </Button>
            </div>
          </div>

          {/* Subjects Display */}
          {selectedAssignment && (
            <div className="mb-6 rounded-lg bg-blue-gray-50 p-4">
              <Typography variant="small" className="text-blue-gray-600">
                Assigned Subjects for this Class:
              </Typography>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedAssignment.subjectNames?.map((subject, idx) => (
                  <span
                    key={idx}
                    className="rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-800"
                  >
                    {subject}
                  </span>
                )) || (
                  <Typography color="gray">No subjects assigned</Typography>
                )}
              </div>
            </div>
          )}

          {/* Students Attendance Table */}
          {selectedAssignment && students.length > 0 ? (
            <div>
              <Typography variant="h6" className="mb-4">
                Students in {selectedAssignment.courseName} - Semester{" "}
                {selectedAssignment.semester}
              </Typography>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] table-auto border-collapse">
                  <thead>
                    <tr className="border-b border-blue-gray-100 bg-blue-gray-50 text-left">
                      <th className="p-4">
                        <Typography variant="small" color="blue-gray" className="font-bold">
                          Enrollment
                        </Typography>
                      </th>
                      <th className="p-4">
                        <Typography variant="small" color="blue-gray" className="font-bold">
                          Name
                        </Typography>
                      </th>
                      <th className="p-4">
                        <Typography variant="small" color="blue-gray" className="font-bold">
                          Email
                        </Typography>
                      </th>
                      <th className="p-4 text-center">
                        <Typography variant="small" color="blue-gray" className="font-bold">
                          Present
                        </Typography>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, idx) => (
                      <tr
                        key={student.id ?? student.studentId ?? idx}
                        className={idx % 2 === 0 ? "bg-white" : "bg-blue-gray-50"}
                      >
                        <td className="p-4">
                          <Typography variant="small" className="text-blue-gray-900">
                            {student.studentId ?? student.id ?? "-"}
                          </Typography>
                        </td>
                        <td className="p-4">
                          <Typography variant="small" className="text-blue-gray-900">
                            {student.studName ?? student.studentName ?? "Unknown"}{" "}
                            {student.studLastName ?? ""}
                          </Typography>
                        </td>
                        <td className="p-4">
                          <Typography variant="small" className="text-blue-gray-600">
                            {student.email ?? "-"}
                          </Typography>
                        </td>
                        <td className="p-4 text-center">
                          <Checkbox
                            checked={attendance[student.id ?? student.studentId] || false}
                            onChange={() => toggleAttendance(student.id ?? student.studentId)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : selectedAssignment ? (
            <div className="rounded-lg border border-dashed border-blue-gray-200 bg-slate-50 p-6 text-center">
              <Typography color="gray">
                No students found for this course and semester
              </Typography>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-blue-gray-200 bg-slate-50 p-6 text-center">
              <Typography color="gray">
                Please select a course and semester to view students
              </Typography>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default ProfessorAttendance;
