import React, { useEffect, useState } from "react";
import { Typography, Card, CardBody, Button, Input, Textarea } from "@material-tailwind/react";
import { getStudentLeaves, submitStudentLeave } from "../../../API/ApiStore";

export default function LeaveApplication() {
  const [form, setForm] = useState({ from: "", to: "", reason: "" });
  const [status, setStatus] = useState(null);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchLeaveHistory = async () => {
    setHistoryLoading(true);
    setError("");
    try {
      const data = await getStudentLeaves(1);
      setLeaveHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Failed to fetch leave history.");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveHistory();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const payload = {
        fromDate: form.from,
        toDate: form.to,
        reason: form.reason,
      };
      const response = await submitStudentLeave(1, payload);
      setStatus({ success: true, message: response?.message || "Leave request submitted." });
      setForm({ from: "", to: "", reason: "" });
      fetchLeaveHistory();
    } catch (error) {
      setStatus({ success: false, message: error?.message || "Failed to submit leave request." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 space-y-6">
      <Typography variant="h5">Leave Application</Typography>
      <Card className="border shadow-sm">
        <CardBody className="space-y-4">
          <Input
            label="From"
            type="date"
            value={form.from}
            onChange={(e) => setForm({ ...form, from: e.target.value })}
          />
          <Input
            label="To"
            type="date"
            value={form.to}
            onChange={(e) => setForm({ ...form, to: e.target.value })}
          />
          <Textarea
            label="Reason"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
          />
          <Button onClick={handleSubmit} disabled={loading || !form.from || !form.to || !form.reason}>
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
          <Typography variant="h6">Leave Status</Typography>
          {historyLoading ? (
            <Typography>Loading leave status...</Typography>
          ) : error ? (
            <Typography color="red">{error}</Typography>
          ) : leaveHistory.length === 0 ? (
            <Typography>No leave requests submitted yet.</Typography>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] table-auto text-left">
                <thead>
                  <tr>
                    <th className="py-2">From</th>
                    <th className="py-2">To</th>
                    <th className="py-2">Reason</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveHistory.map((leave) => (
                    <tr key={leave.id} className="border-t">
                      <td className="py-2">{leave.fromDate || "-"}</td>
                      <td className="py-2">{leave.toDate || "-"}</td>
                      <td className="py-2">{leave.reason || "-"}</td>
                      <td className={`py-2 ${
                        leave.status === "Approved"
                          ? "text-green-600"
                          : leave.status === "Rejected"
                          ? "text-red-600"
                          : "text-orange-600"
                      }`}>
                        {leave.status || "Pending"}
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
