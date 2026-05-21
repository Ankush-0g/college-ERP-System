import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Tabs,
  TabsHeader,
  Tab,
  Chip,
} from "@material-tailwind/react";
import axios from "axios";

export function ProfessorDashboard() {
  const [professorData, setProfessorData] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("overview");

  useEffect(() => {
    // Get professor data from localStorage
    const storedProfessor = localStorage.getItem("professorData");
    if (storedProfessor) {
      const professor = JSON.parse(storedProfessor);
      setProfessorData(professor);
      fetchAssignments(professor.id);
    }
  }, []);

  const fetchAssignments = async (professorId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8080/api/professor-assignments/professor/${professorId}`
      );
      setAssignments(response.data || []);
    } catch (err) {
      console.error("Error fetching assignments:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!professorData) {
    return (
      <div className="m-8">
        <Card>
          <CardBody>
            <Typography color="red">Professor data not found. Please login again.</Typography>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="m-8">
      <Card className="border border-blue-gray-100 shadow-sm mb-8">
        <CardHeader variant="gradient" color="indigo" className="mb-8 p-6">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="h4" color="white">
                {professorData.name}
              </Typography>
              <Typography variant="small" color="white" className="opacity-80 mt-2">
                Professor ID: {professorData.professorId}
              </Typography>
            </div>
            <div className="text-right">
              <Typography variant="small" color="white" className="opacity-80">
                Department: {professorData.departmentName}
              </Typography>
              <Typography variant="small" color="white" className="opacity-80 mt-1">
                Total Assignments: {assignments.length}
              </Typography>
            </div>
          </div>
        </CardHeader>

        <CardBody className="px-6 py-8">
          <Tabs value={selectedTab} className="mt-8">
            <TabsHeader>
              <Tab value="overview" onClick={() => setSelectedTab("overview")}>
                Overview
              </Tab>
              <Tab value="subjects" onClick={() => setSelectedTab("subjects")}>
                Assigned Subjects
              </Tab>
              <Tab value="workload" onClick={() => setSelectedTab("workload")}>
                Workload Summary
              </Tab>
            </TabsHeader>
          </Tabs>

          {/* Overview Tab */}
          {selectedTab === "overview" && (
            <div className="mt-8">
              <Typography variant="h6" className="mb-4">
                Assignment Summary
              </Typography>
              {assignments.length === 0 ? (
                <Typography color="gray">
                  No assignments yet. Please contact your HOD.
                </Typography>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {assignments.map((assignment, index) => (
                    <Card key={index} className="bg-blue-gray-50">
                      <CardBody className="p-4">
                        <Typography variant="small" className="text-blue-gray-600 mb-1">
                          {assignment.courseName}
                        </Typography>
                        <Typography variant="h6" className="text-blue-gray-900">
                          Semester {assignment.semester}
                        </Typography>
                        <Typography variant="small" className="text-blue-gray-600 mt-2">
                          {assignment.subjectNames?.length || 0} Subjects
                        </Typography>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Subjects Tab */}
          {selectedTab === "subjects" && (
            <div className="mt-8">
              <Typography variant="h6" className="mb-6">
                Subjects by Course and Semester
              </Typography>
              {assignments.length === 0 ? (
                <Typography color="gray">
                  No assignments yet.
                </Typography>
              ) : (
                <div className="space-y-6">
                  {assignments.map((assignment, index) => (
                    <Card key={index} className="border border-blue-gray-200">
                      <CardHeader className="bg-blue-gray-50 p-4">
                        <Typography variant="h6" className="text-blue-gray-900">
                          {assignment.courseName} - Semester {assignment.semester}
                        </Typography>
                      </CardHeader>
                      <CardBody className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {assignment.subjectNames?.map((subject, idx) => (
                            <Chip
                              key={idx}
                              value={subject}
                              variant="outlined"
                              color="indigo"
                            />
                          )) || (
                            <Typography color="gray">
                              No subjects assigned
                            </Typography>
                          )}
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Workload Tab */}
          {selectedTab === "workload" && (
            <div className="mt-8">
              <Typography variant="h6" className="mb-6">
                Teaching Workload Summary
              </Typography>
              {assignments.length === 0 ? (
                <Typography color="gray">
                  No assignments yet.
                </Typography>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
                    <CardBody className="p-6">
                      <Typography variant="small" className="text-blue-gray-600">
                        Total Courses
                      </Typography>
                      <Typography variant="h3" className="text-indigo-600 mt-2">
                        {new Set(assignments.map((a) => a.courseId)).size}
                      </Typography>
                    </CardBody>
                  </Card>
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
                    <CardBody className="p-6">
                      <Typography variant="small" className="text-blue-gray-600">
                        Total Semesters
                      </Typography>
                      <Typography variant="h3" className="text-green-600 mt-2">
                        {assignments.length}
                      </Typography>
                    </CardBody>
                  </Card>
                  <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
                    <CardBody className="p-6">
                      <Typography variant="small" className="text-blue-gray-600">
                        Total Subjects
                      </Typography>
                      <Typography variant="h3" className="text-purple-600 mt-2">
                        {assignments.reduce(
                          (sum, a) => sum + (a.subjectNames?.length || 0),
                          0
                        )}
                      </Typography>
                    </CardBody>
                  </Card>
                  <Card className="bg-gradient-to-br from-orange-50 to-yellow-50">
                    <CardBody className="p-6">
                      <Typography variant="small" className="text-blue-gray-600">
                        Avg. Subjects per Semester
                      </Typography>
                      <Typography variant="h3" className="text-orange-600 mt-2">
                        {assignments.length > 0
                          ? (
                              assignments.reduce(
                                (sum, a) => sum + (a.subjectNames?.length || 0),
                                0
                              ) / assignments.length
                            ).toFixed(1)
                          : 0}
                      </Typography>
                    </CardBody>
                  </Card>
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default ProfessorDashboard;
