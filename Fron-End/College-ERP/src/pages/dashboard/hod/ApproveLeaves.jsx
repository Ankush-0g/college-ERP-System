import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
  CardBody,
  CardHeader,
  Button,
} from "@material-tailwind/react";
import { getLeaveRequests, approveLeave } from "@/API/ApiStore";

export default function ApproveLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  const fetchLeaves = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getLeaveRequests();
      setLeaves(Array.isArray(data) ? data : []);
    } catch (err) {
      // axios error shape: err.response?.status, err.response?.data
      const status = err?.response?.status;
      const data = err?.response?.data;
      setError(
        `Failed to load leaves${status ? ` (HTTP ${status})` : ""}` +
          (data ? `: ${typeof data === "string" ? data : JSON.stringify(data)}` : "")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleDecision = async (id, approve) => {
    setActionLoading(id);
    try {
      await approveLeave(id, approve);
      fetchLeaves();
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      setError(
        `Decision failed for leave ${id}${status ? ` (HTTP ${status})` : ""}` +
          (data ? `: ${typeof data === "string" ? data : JSON.stringify(data)}` : "")
      );
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <Typography variant="h5">Approve Leave Requests</Typography>
      </div>

      <Card>
        <CardHeader shadow={false} floated={false} className="p-4">
          <Typography variant="small" className="text-gray-600">
            Pending leave requests
          </Typography>
        </CardHeader>
        <CardBody className="p-4">
          {loading ? (
            <Typography>Loading...</Typography>
          ) : error ? (
            <Typography color="red" className="whitespace-pre-wrap">
              {error}
            </Typography>
          ) : leaves.length === 0 ? (
            <Typography>No leave requests found.</Typography>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] table-auto">
                <thead>
                  <tr>
                    <th className="text-left py-2">Applicant</th>
                    <th className="text-left py-2">Role</th>
                    <th className="text-left py-2">From</th>
                    <th className="text-left py-2">To</th>
                    <th className="text-left py-2">Reason</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((l) => {
                    const isPending = (l.status || "Pending") === "Pending";
                    return (
                      <tr key={l.id} className="border-t">
                        <td className="py-2">{l.name || l.applicantName || `User ${l.userId}`}</td>
                        <td className="py-2">{l.role}</td>
                        <td className="py-2">{l.fromDate}</td>
                        <td className="py-2">{l.toDate}</td>
                        <td className="py-2">{l.reason}</td>
                        <td className="py-2">{l.status || "Pending"}</td>
                        <td className="py-2">
                          {isPending ? (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                color="green"
                                onClick={() => handleDecision(l.id, true)}
                                disabled={actionLoading === l.id}
                              >
                                {actionLoading === l.id ? "..." : "Approve"}
                              </Button>
                              <Button
                                size="sm"
                                color="red"
                                onClick={() => handleDecision(l.id, false)}
                                disabled={actionLoading === l.id}
                              >
                                {actionLoading === l.id ? "..." : "Decline"}
                              </Button>
                            </div>
                          ) : (
                            <Typography className={
                              l.status === "Approved"
                                ? "text-green-600"
                                : l.status === "Rejected"
                                ? "text-red-600"
                                : "text-gray-600"
                            }>
                              {l.status}
                            </Typography>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
