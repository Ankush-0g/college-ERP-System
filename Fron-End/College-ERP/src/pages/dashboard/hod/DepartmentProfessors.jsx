import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Alert,
} from "@material-tailwind/react";
import axios from "axios";

export function DepartmentProfessors({ hodId }) {
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedProfessor, setSelectedProfessor] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  useEffect(() => {
    if (hodId) {
      fetchProfessors();
    }
  }, [hodId]);

  const fetchProfessors = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8080/api/hod/department/professors/${hodId}`
      );
      setProfessors(response.data || []);
    } catch (err) {
      console.error("Error fetching professors:", err);
      setError("Failed to load professors");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (professor) => {
    setSelectedProfessor(professor);
    setShowDetailsDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDetailsDialog(false);
    setSelectedProfessor(null);
  };

  if (loading) {
    return <Typography>Loading professors...</Typography>;
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
          <Typography color="white" variant="h6">
            Department Professors ({professors.length})
          </Typography>
        </CardHeader>
        <CardBody className="p-4">
          {professors.length === 0 ? (
            <Typography>No professors found in this department</Typography>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] table-auto">
                <thead>
                  <tr className="border-b border-blue-gray-100">
                    <th className="text-left py-3 px-2">Name</th>
                    <th className="text-left py-3 px-2">Email</th>
                    <th className="text-left py-3 px-2">Specialization</th>
                    <th className="text-left py-3 px-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {professors.map((professor) => (
                    <tr
                      key={professor.id}
                      className="border-b border-blue-gray-50 hover:bg-blue-gray-50"
                    >
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-3">
                          <div>
                            <Typography variant="small" color="blue-gray">
                              {professor.name}
                            </Typography>
                            <Typography variant="small" color="gray">
                              {professor.professorId}
                            </Typography>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <Typography variant="small" color="gray">
                          {professor.email}
                        </Typography>
                      </td>
                      <td className="py-3 px-2">
                        <Typography variant="small" color="gray">
                          {professor.subject}
                        </Typography>
                      </td>
                      <td className="py-3 px-2">
                        <Button
                          size="sm"
                          color="blue"
                          variant="outlined"
                          onClick={() => handleViewDetails(professor)}
                        >
                          View
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

      {/* Professor Details Dialog */}
      <Dialog
        open={showDetailsDialog}
        handler={handleCloseDialog}
        size="md"
      >
        <DialogHeader>Professor Details</DialogHeader>
        <DialogBody className="px-6 py-4">
          {selectedProfessor && (
            <div className="space-y-4">
              <div>
                <Typography variant="small" color="gray" className="font-medium">
                  Name
                </Typography>
                <Typography color="blue-gray">{selectedProfessor.name}</Typography>
              </div>
              <div>
                <Typography variant="small" color="gray" className="font-medium">
                  Email
                </Typography>
                <Typography color="blue-gray">{selectedProfessor.email}</Typography>
              </div>
              <div>
                <Typography variant="small" color="gray" className="font-medium">
                  Professor ID
                </Typography>
                <Typography color="blue-gray">{selectedProfessor.professorId}</Typography>
              </div>
              <div>
                <Typography variant="small" color="gray" className="font-medium">
                  Department
                </Typography>
                <Typography color="blue-gray">{selectedProfessor.departmentName}</Typography>
              </div>
              <div>
                <Typography variant="small" color="gray" className="font-medium">
                  Specialization
                </Typography>
                <Typography color="blue-gray">{selectedProfessor.subject}</Typography>
              </div>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button color="blue" variant="text" onClick={handleCloseDialog}>
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default DepartmentProfessors;
