import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Typography } from "@material-tailwind/react";
import { getStudentAttendance } from "@/API/ApiStore";

export function StudentAttendanceView() {
  const [studentData, setStudentData] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [error, setError] = useState("");

  const normalizeRecord = (record) => ({
    date: record?.date || record?.attendanceDate || record?.attendance_date || "",
    present: Boolean(record?.present ?? record?.isPresent ?? record?.status === "p"),
    markedBy: record?.markedBy || record?.professorName || record?.professor || "N/A",
    status: record?.status || (record?.present ?? record?.isPresent ?? record?.status === "p" ? "p" : "a"),
  });

  const normalizeSubject = (subject) => {
    const records = Array.isArray(subject?.records) ? subject.records.map(normalizeRecord) : [];
    const totalClasses = Number(subject?.totalClasses ?? records.length ?? 0);
    const classesAttended = Number(
      subject?.classesAttended ?? records.filter((record) => record.present).length ?? 0
    );
    const attendancePercentage = Number.isFinite(Number(subject?.attendancePercentage))
      ? Number(subject.attendancePercentage)
      : totalClasses > 0
      ? (classesAttended / totalClasses) * 100
      : 0;

    return {
      subjectId: subject?.subjectId ?? subject?.id ?? subject?.subject?.id ?? subject?.subjectName ?? "",
      subjectName: subject?.subjectName || subject?.name || subject?.subject?.name || "Subject",
      professorName: subject?.professorName || "Unknown",
      totalClasses,
      classesAttended,
      attendancePercentage,
      records,
    };
  };

  useEffect(() => {
    const storedStudent = localStorage.getItem("studentData");
    if (storedStudent) {
      try {
        const student = JSON.parse(storedStudent);
        setStudentData(student);
        fetchAttendance(student.id || student.studentId);
      } catch (err) {
        console.error("Error parsing student data:", err);
        setError("Failed to load student data");
        setLoading(false);
      }
    } else {
      setError("Please log in first");
      setLoading(false);
    }
  }, []);

  const fetchAttendance = async (studentId) => {
    try {
      setLoading(true);
      setError("");
      const data = await getStudentAttendance(studentId);
      const normalizedSubjects = Array.isArray(data?.subjects) ? data.subjects.map(normalizeSubject) : [];

      setSubjects(normalizedSubjects);

      if (normalizedSubjects.length > 0) {
        setSelectedSubject(String(normalizedSubjects[0].subjectId));
        setSelectedRecords(normalizedSubjects[0].records || []);
      } else {
        setSelectedSubject(null);
        setSelectedRecords([]);
      }
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setError(err.response?.data?.message || "Failed to fetch attendance data");
      setSubjects([]);
      setSelectedSubject(null);
      setSelectedRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectChange = (value) => {
    const subjectId = value?.target ? value.target.value : value;
    setSelectedSubject(subjectId);
    const subject = subjects.find((item) => String(item.subjectId) === String(subjectId));
    if (subject) {
      setSelectedRecords(subject.records || []);
    }
  };

  if (!studentData) {
    return (
      <div className="m-8">
        <Card>
          <CardBody>
            <Typography color="red">{error || "Student data not found"}</Typography>
          </CardBody>
        </Card>
      </div>
    );
  }

  const attendanceOverview = subjects.reduce(
    (summary, subject) => {
      summary.totalClasses += Number(subject.totalClasses || 0);
      summary.classesAttended += Number(subject.classesAttended || 0);
      return summary;
    },
    { totalClasses: 0, classesAttended: 0 }
  );

  const overallPercentage = attendanceOverview.totalClasses
    ? Math.round((attendanceOverview.classesAttended / attendanceOverview.totalClasses) * 100)
    : 0;

  const selectedSubjectData = subjects.find(
    (subject) => String(subject.subjectId) === String(selectedSubject)
  );

  return (
    <div className="m-8 space-y-8">
      <Card className="border border-blue-gray-100 shadow-sm">
        <CardHeader variant="gradient" color="indigo" className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <Typography variant="h4" color="white">
                {studentData?.studName || "Student"} {studentData?.studLastName || ""}
              </Typography>
              <Typography variant="small" color="white" className="mt-2 opacity-80">
                Enrollment ID: {studentData?.studentId || studentData?.id || "N/A"}
              </Typography>
            </div>
            <div className="grid gap-1 text-right">
              <Typography variant="small" color="white" className="opacity-80">
                Course: {studentData?.course || "N/A"}
              </Typography>
              <Typography variant="small" color="white" className="opacity-80">
                Semester: {studentData?.semester || "N/A"}
              </Typography>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border border-blue-gray-100 shadow-sm">
          <CardBody className="p-6">
            <Typography variant="small" color="gray">
              Overall Attendance
            </Typography>
            <Typography variant="h4" className="mt-2 text-blue-gray-900">
              {overallPercentage}%
            </Typography>
          </CardBody>
        </Card>
        <Card className="border border-blue-gray-100 shadow-sm">
          <CardBody className="p-6">
            <Typography variant="small" color="gray">
              Classes Attended
            </Typography>
            <Typography variant="h4" className="mt-2 text-blue-gray-900">
              {attendanceOverview.classesAttended}
            </Typography>
          </CardBody>
        </Card>
        <Card className="border border-blue-gray-100 shadow-sm">
          <CardBody className="p-6">
            <Typography variant="small" color="gray">
              Total Classes
            </Typography>
            <Typography variant="h4" className="mt-2 text-blue-gray-900">
              {attendanceOverview.totalClasses}
            </Typography>
          </CardBody>
        </Card>
      </div>

      {loading ? (
        <Card className="border border-blue-gray-100 shadow-sm">
          <CardBody className="p-8 text-center">
            <Typography variant="h6">Loading attendance data...</Typography>
          </CardBody>
        </Card>
      ) : error ? (
        <Card className="border border-blue-gray-100 shadow-sm">
          <CardBody className="p-8">
            <Typography color="red" variant="h6">
              {error}
            </Typography>
          </CardBody>
        </Card>
      ) : subjects.length === 0 ? (
        <Card className="border border-blue-gray-100 shadow-sm">
          <CardBody className="p-8 text-center">
            <Typography color="gray">No attendance records found yet</Typography>
          </CardBody>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {subjects.map((subject) => {
              const percentage = Math.max(0, Math.min(100, Number(subject.attendancePercentage || 0)));
              const active = String(subject.subjectId) === String(selectedSubject);

              return (
                <button
                  key={subject.subjectId}
                  type="button"
                  onClick={() => handleSubjectChange(String(subject.subjectId))}
                  className={`text-left transition-transform hover:-translate-y-0.5 ${active ? "scale-[1.01]" : ""}`}
                >
                  <Card
                    className={`border shadow-sm ${active ? "border-indigo-500 ring-2 ring-indigo-100" : "border-blue-gray-100"}`}
                  >
                    <CardBody className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Typography variant="h6" className="text-blue-gray-900">
                            {subject.subjectName}
                          </Typography>
                          <Typography variant="small" color="gray" className="mt-1">
                            {subject.professorName}
                          </Typography>
                        </div>
                        <div className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
                          {Math.round(percentage)}%
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="mb-2 flex items-center justify-between text-sm text-blue-gray-600">
                          <span>
                            Present: {subject.classesAttended}/{subject.totalClasses}
                          </span>
                          <span>{percentage >= 75 ? "On track" : percentage >= 60 ? "Watch" : "Low"}</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-blue-gray-100">
                          <div
                            className={`h-full rounded-full ${percentage >= 75 ? "bg-green-500" : percentage >= 60 ? "bg-orange-500" : "bg-red-500"}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </button>
              );
            })}
          </div>

          <Card className="border border-blue-gray-100 shadow-sm">
            <CardHeader className="border-b border-blue-gray-50 bg-blue-gray-50 p-6 shadow-none">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <Typography variant="h6" className="text-blue-gray-900">
                    Attendance Details
                  </Typography>
                  <Typography variant="small" color="gray" className="mt-1">
                    Review the attendance history for the selected subject.
                  </Typography>
                </div>
                <select
                  className="min-w-[240px] rounded-lg border border-blue-gray-200 bg-white px-3 py-2 text-sm text-blue-gray-900 outline-none transition focus:border-indigo-500"
                  value={selectedSubject?.toString() || ""}
                  onChange={handleSubjectChange}
                >
                  {subjects.map((subject) => (
                    <option key={subject.subjectId} value={subject.subjectId.toString()}>
                      {subject.subjectName}
                    </option>
                  ))}
                </select>
              </div>
            </CardHeader>
            <CardBody className="overflow-x-auto p-0">
              <div className="p-6">
                <Typography variant="small" color="gray">
                  {selectedSubjectData
                    ? `${selectedSubjectData.subjectName} • ${selectedSubjectData.classesAttended}/${selectedSubjectData.totalClasses} present`
                    : "Select a subject to view attendance details."}
                </Typography>
              </div>

              {selectedRecords.length === 0 ? (
                <div className="p-6 pt-0 text-center">
                  <Typography color="gray">No attendance records for this subject</Typography>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] table-auto text-left">
                    <thead className="bg-blue-gray-50 text-blue-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-sm font-semibold">Date</th>
                        <th className="px-6 py-4 text-sm font-semibold">Status</th>
                        <th className="px-6 py-4 text-sm font-semibold">Marked By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRecords.map((record, idx) => {
                        const isPresent = Boolean(record.present);
                        const formattedDate = record.date ? new Date(record.date).toLocaleDateString() : "N/A";

                        return (
                          <tr key={`${formattedDate}-${idx}`} className="border-t border-blue-gray-50">
                            <td className="px-6 py-4 text-sm text-blue-gray-900">{formattedDate}</td>
                            <td className="px-6 py-4 text-sm">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${isPresent ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
                              >
                                {isPresent ? "Present" : "Absent"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-blue-gray-700">{record.markedBy || "N/A"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}

export default StudentAttendanceView;
