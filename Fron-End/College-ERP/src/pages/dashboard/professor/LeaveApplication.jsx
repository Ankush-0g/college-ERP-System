import React, { useEffect, useState } from "react";
import { Typography, Card, CardBody, Button, Input, Textarea } from "@material-tailwind/react";
import { submitProfessorLeave, getProfessorLeaves } from "../../../API/ApiStore";

export default function LeaveApplication() {
  const [leave, setLeave] = useState({ from: "", to: "", reason: "" });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  const fetchLeaveHistory = async () => {
    setHistoryLoading(true);
    setHistoryError("");
    try {
      const data = await getProfessorLeaves(1);
      setLeaveHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      setHistoryError(error?.message || "Failed to fetch leave history.");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveHistory();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        fromDate: leave.from,
        toDate: leave.to,
        reason: leave.reason,
      };
      const response = await submitProfessorLeave(1, payload);
      setStatus({ success: true, message: response?.message || "Leave request submitted." });
      setLeave({ from: "", to: "", reason: "" });
      fetchLeaveHistory();
    } catch (error) {
      setStatus({ success: false, message: error?.message || "Failed to submit leave request." });
    } finally {
      setLoading(false);
    }
  };

  const latestLeave = leaveHistory.length
    ? [...leaveHistory].sort((a, b) => (b.id || 0) - (a.id || 0))[0]
    : null;

  return (
    <div className="mt-6 space-y-6">
      <Typography variant="h5">Apply for Leave</Typography>
      <Card className="border shadow-sm">
        <CardBody className="space-y-4">
          <Input
            label="From"
            type="date"
            value={leave.from}
            onChange={(e) => setLeave({ ...leave, from: e.target.value })}
          />
          <Input
            label="To"
            type="date"
            value={leave.to}
            onChange={(e) => setLeave({ ...leave, to: e.target.value })}
          />
          <Textarea
            label="Reason"
            value={leave.reason}
            onChange={(e) => setLeave({ ...leave, reason: e.target.value })}
          />
          <Button onClick={handleSubmit} disabled={loading || !leave.from || !leave.to || !leave.reason}>
            {loading ? "Submitting..." : "Submit Leave Request"}
          </Button>
          {status && (
            <Typography className={status.success ? "text-green-600" : "text-red-600"}>
              {status.message}
            </Typography>
          )}
        </CardBody>
      </Card>

      <Card className="border shadow-sm">
        <CardBody className="space-y-4">
          <Typography variant="h5">Leave Status</Typography>
          {historyLoading ? (
            <Typography>Loading leave status...</Typography>
          ) : historyError ? (
            <Typography className="text-red-600">{historyError}</Typography>
          ) : leaveHistory.length === 0 ? (
            <Typography>No leave requests submitted yet.</Typography>
          ) : (
            <div className="space-y-3">
              <div className="rounded-lg border p-4 bg-gray-50">
                <Typography variant="small" className="text-gray-500">
                  Most recent request
                </Typography>
                <Typography className="text-sm">
                  From: {latestLeave.fromDate || latestLeave.from}
                </Typography>
                <Typography className="text-sm">
                  To: {latestLeave.toDate || latestLeave.to}
                </Typography>
                <Typography className="text-sm">Reason: {latestLeave.reason}</Typography>
                <Typography className={
                  latestLeave.status === "Approved"
                    ? "text-green-600"
                    : latestLeave.status === "Rejected"
                    ? "text-red-600"
                    : "text-yellow-600"
                }>
                  Status: {latestLeave.status || "Pending"}
                </Typography>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
