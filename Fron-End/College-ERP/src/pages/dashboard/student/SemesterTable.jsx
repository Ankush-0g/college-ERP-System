import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Chip,
} from "@material-tailwind/react";
import { courseSubjectMap, getSubjectsForCourseSemester } from "@/data/courseSubjects";

export function SemesterTable() {
  const [student, setStudent] = useState(null);
  const [course, setCourse] = useState("");
  const [semester, setSemester] = useState("");
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const storedStudent = localStorage.getItem("studentData");
    const storedCourse = localStorage.getItem("studentCourse");
    const storedSemester = localStorage.getItem("studentSemester");
    const storedSubjects = localStorage.getItem("studentSubjects");

    const parsedStudent = storedStudent ? JSON.parse(storedStudent) : null;
    let resolvedCourse = parsedStudent?.course || storedCourse || "";
    let resolvedSemester = parsedStudent?.semester || storedSemester || "";
    let resolvedSubjects = [];

    if (parsedStudent?.subjects && Array.isArray(parsedStudent.subjects)) {
      resolvedSubjects = parsedStudent.subjects;
    } else if (storedSubjects) {
      try {
        const parsedSubjects = JSON.parse(storedSubjects);
        if (Array.isArray(parsedSubjects)) {
          resolvedSubjects = parsedSubjects;
        }
      } catch (error) {
        console.warn("Failed to parse stored student subjects", error);
      }
    }

    if (resolvedCourse && resolvedSemester && (!resolvedSubjects || resolvedSubjects.length === 0)) {
      resolvedSubjects = getSubjectsForCourseSemester(resolvedCourse, resolvedSemester);
    }

    setStudent(parsedStudent);
    setCourse(resolvedCourse);
    setSemester(resolvedSemester);
    setSubjects(resolvedSubjects);
  }, []);

  const studentName = student
    ? `${student.studName || ""} ${student.studLastName || ""}`.trim()
    : "Student";
  const displayHeading = course ? `${course} - Semester ${semester || "N/A"}` : "Semester Subjects";

  return (
    <div className="mt-12 mb-8 flex flex-col gap-8">
      <Card className="border border-blue-gray-100 shadow-sm">
        <CardHeader variant="gradient" color="blue" className="mb-6 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <Typography variant="h5" color="white">
                {displayHeading}
              </Typography>
              <Typography variant="small" className="text-white opacity-80">
                {studentName}
                {student?.major ? ` · Department: ${student.major}` : ""}
                {student?.year ? ` · Year: ${student.year}` : ""}
              </Typography>
            </div>
            <div className="flex flex-wrap gap-2">
              {course ? (
                <Chip
                  value={course}
                  variant="ghost"
                  color="cyan"
                  className="text-white"
                />
              ) : null}
              {semester ? (
                <Chip
                  value={`Semester ${semester}`}
                  variant="ghost"
                  color="cyan"
                  className="text-white"
                />
              ) : null}
            </div>
          </div>
        </CardHeader>
        <CardBody className="space-y-4 p-6">
          <Typography variant="paragraph" color="blue-gray" className="text-sm">
            This page shows the subjects assigned to the selected course and semester during registration.
            If your student record does not include course or semester details, please make sure the registration step is completed and the browser session has the selected data.
          </Typography>
        </CardBody>
      </Card>

      <Card className="border border-blue-gray-100 shadow-sm">
        <CardHeader variant="gradient" color="gray" className="p-6">
          <Typography variant="h6" color="white">
            Assigned Subjects
          </Typography>
        </CardHeader>
        <CardBody className="px-6 pb-6 pt-4">
          {subjects.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {subjects.map((subject, index) => (
                <div
                  key={`${subject}-${index}`}
                  className="rounded-2xl border border-blue-gray-100 bg-white p-4 shadow-sm"
                >
                  <Typography variant="small" className="text-blue-gray-500">
                    Subject {index + 1}
                  </Typography>
                  <Typography variant="h6" className="mt-2 text-blue-gray-900">
                    {subject}
                  </Typography>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-blue-gray-200 bg-slate-50 p-6 text-center">
              <Typography variant="h6" className="mb-2 text-blue-gray-700">
                No subjects available
              </Typography>
              <Typography variant="paragraph" color="blue-gray" className="text-sm">
                Select a course and semester during sign-up to populate this page. The chosen subjects will appear here when registration data is available.
              </Typography>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default SemesterTable;
