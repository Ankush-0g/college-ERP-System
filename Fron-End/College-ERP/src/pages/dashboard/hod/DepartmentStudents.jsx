import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Alert,
  Input,
} from "@material-tailwind/react";
import axios from "axios";

export function DepartmentStudents({ hodId }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (hodId) {
      fetchStudents();
    }
  }, [hodId]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8080/api/hod/department/students/${hodId}`
      );
      setStudents(response.data || []);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Typography>Loading students...</Typography>;
  }

  return (
    <div>
      {error && (
        <Alert color="red" className="mb-4">
          {error}
        </Alert>
      )}

      <Card className="border border-blue-gray-100">
        <CardHeader variant="gradient" color="blue" className="mb-4 p-4">
          <div className="flex items-center justify-between">
            <Typography color="white" variant="h6">
              Department Students ({students.length})
            </Typography>
          </div>
        </CardHeader>
        <CardBody className="p-4">
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Search by name, roll number, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          {filteredStudents.length === 0 ? (
            <Typography>No students found in this department</Typography>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] table-auto">
                <thead>
                  <tr className="border-b border-blue-gray-100">
                    <th className="text-left py-3 px-2">Roll No</th>
                    <th className="text-left py-3 px-2">Name</th>
                    <th className="text-left py-3 px-2">Email</th>
                    <th className="text-left py-3 px-2">Department</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="border-b border-blue-gray-50 hover:bg-blue-gray-50"
                    >
                      <td className="py-3 px-2">
                        <Typography variant="small" color="gray">
                          {student.rollNo}
                        </Typography>
                      </td>
                      <td className="py-3 px-2">
                        <Typography variant="small" color="blue-gray">
                          {student.name}
                        </Typography>
                      </td>
                      <td className="py-3 px-2">
                        <Typography variant="small" color="gray">
                          {student.email}
                        </Typography>
                      </td>
                      <td className="py-3 px-2">
                        <Typography variant="small" color="gray">
                          {student.departmentName}
                        </Typography>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default DepartmentStudents;
