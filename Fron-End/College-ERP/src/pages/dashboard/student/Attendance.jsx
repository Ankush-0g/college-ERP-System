import React, { useEffect, useState } from "react";
import { Typography, Card, CardBody } from "@material-tailwind/react";
import { getAttendanceByLecturerSubject } from "@/API/ApiStore";

export default function Attendance() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [overall, setOverall] = useState(75);
  const [alerts, setAlerts] = useState(2);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadAttendance = async () => {
      setLoading(true);
      try {
        const data = await getAttendanceByLecturerSubject("Dr. Meera Sharma", "Computer Networks");
        if (data && typeof data === "object") {
          const records = Object.entries(data).map(([date, entries]) => {
            const present = Array.isArray(entries)
              ? entries.filter((item) => item.status === "p").length
              : 0;
            const total = Array.isArray(entries) ? entries.length : 0;
            return {
              subject: "Computer Networks",
              attended: present,
              total,
              percent: total ? Math.round((present / total) * 100) : 0,
              date,
            };
          });
          if (records.length) {
            setAttendanceRecords(records);
            const combinedTotal = records.reduce((sum, record) => sum + record.total, 0);
            const combinedPresent = records.reduce((sum, record) => sum + record.attended, 0);
            setOverall(combinedTotal ? Math.round((combinedPresent / combinedTotal) * 100) : 0);
            setAlerts(records.filter((r) => r.percent < 75).length);
          }
        }
      } catch (error) {
        console.error("Failed to load attendance:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, []);

  const recordsToRender = attendanceRecords.length
    ? attendanceRecords
    : [
        { subject: "Computer Networks", attended: 14, total: 16, percent: 88 },
        { subject: "Data Structures", attended: 12, total: 16, percent: 75 },
        { subject: "Database Systems", attended: 10, total: 16, percent: 63 },
      ];

  return (
    <div className="mt-6 space-y-6">
      <Typography variant="h5">View Attendance</Typography>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border shadow-sm">
          <CardBody>
            <Typography variant="small" className="text-gray-500">
              Overall Attendance
            </Typography>
            <Typography variant="h4" className="mt-2">
              {loading ? "Loading..." : `${overall}%`}
            </Typography>
          </CardBody>
        </Card>
        <Card className="border shadow-sm">
          <CardBody>
            <Typography variant="small" className="text-gray-500">
              Alerts
            </Typography>
            <Typography variant="h4" className="mt-2 text-yellow-700">
              {loading ? "..." : `${alerts} Subjects`}
            </Typography>
          </CardBody>
        </Card>
      </div>
      <Card className="border shadow-sm">
        <CardBody>
          <Typography variant="h6" className="mb-4">
            Attendance by Session
          </Typography>
          <div className="space-y-4">
            {recordsToRender.map((record) => (
              <div key={`${record.subject}-${record.date || record.subject}`} className="rounded-xl border p-4">
                <Typography className="font-medium">{record.subject}</Typography>
                <Typography variant="small" className="text-gray-500">
                  {record.date ? `${record.date} • ` : ""}
                  {record.attended}/{record.total} classes attended • {record.percent}%
                </Typography>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
