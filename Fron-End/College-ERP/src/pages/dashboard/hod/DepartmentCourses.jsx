import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Alert,
  Accordion,
  AccordionHeader,
  AccordionBody,
} from "@material-tailwind/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import axios from "axios";

export function DepartmentCourses({ hodId }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openAccordion, setOpenAccordion] = useState(0);

  useEffect(() => {
    if (hodId) {
      fetchCourses();
    }
  }, [hodId]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8080/api/hod/department/courses/${hodId}`
      );
      setCourses(response.data || []);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleAccordionOpen = (index) => {
    setOpenAccordion(openAccordion === index ? -1 : index);
  };

  if (loading) {
    return <Typography>Loading courses...</Typography>;
  }

  return (
    <div>
      {error && (
        <Alert color="red" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="space-y-4">
        {courses.map((course, courseIndex) => (
          <Card key={courseIndex} className="border border-blue-gray-100">
            <CardHeader
              variant="gradient"
              color="blue"
              className="p-4"
              onClick={() => handleAccordionOpen(courseIndex)}
            >
              <div className="flex items-center justify-between cursor-pointer">
                <div>
                  <Typography color="white" variant="h6">
                    {course.courseName} ({course.courseCode})
                  </Typography>
                  <Typography color="white" variant="small" className="opacity-75">
                    Department: {course.departmentName}
                  </Typography>
                </div>
                <ChevronDownIcon
                  className={`h-5 w-5 transition-transform ${
                    openAccordion === courseIndex ? "rotate-180" : ""
                  }`}
                  color="white"
                />
              </div>
            </CardHeader>

            {openAccordion === courseIndex && (
              <CardBody className="p-4">
                {course.semesters && course.semesters.length > 0 ? (
                  <div className="space-y-4">
                    {course.semesters.map((semester, semIndex) => (
                      <div key={semIndex} className="border border-blue-gray-100 rounded p-3">
                        <Typography
                          variant="h6"
                          color="blue-gray"
                          className="mb-3 font-semibold"
                        >
                          Semester {semester.semesterNumber}
                        </Typography>
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                          {semester.subjects.map((subject, subjIndex) => (
                            <div
                              key={subjIndex}
                              className="bg-blue-gray-50 rounded p-2 border border-blue-gray-100"
                            >
                              <Typography variant="small" color="blue-gray">
                                {subject.name}
                              </Typography>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Typography>No semesters available for this course</Typography>
                )}
              </CardBody>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

export default DepartmentCourses;
