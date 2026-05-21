import React, { useEffect, useState } from "react";
import { Typography, Card, CardBody, Button } from "@material-tailwind/react";
import { getClasses } from "@/API/ApiStore";

const overviewDefaults = [
  { label: "Attendance", value: "82%" },
  { label: "Upcoming Exams", value: "2" },
  { label: "Pending Assignments", value: "3" },
  { label: "Fees Due", value: "₹5,000" },
];

const fallbackTimetable = [
  { time: "09:00 AM", subject: "Computer Networks", room: "A-204" },
  { time: "11:00 AM", subject: "Data Structures", room: "B-110" },
  { time: "02:00 PM", subject: "Database Systems", room: "C-301" },
];

export default function Home() {
  const [overview, setOverview] = useState(overviewDefaults);
  const [timetable, setTimetable] = useState(fallbackTimetable);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const classes = await getClasses();
        if (Array.isArray(classes) && classes.length > 0) {
          setTimetable(
            classes.slice(0, 4).map((item) => ({
              time: item.time || item.Time || "09:00 AM",
              subject: item.subject || item.subjectName || item.course || "Class",
              room: item.room || item.Room || "TBD",
            }))
          );
        }
      } catch (error) {
        console.error("Unable to load student dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const attendanceValue = Number(overview[0].value.replace("%", ""));
  const alert = attendanceValue < 75;

  return (
    <div className="mt-6 space-y-6">
      <Typography variant="h5">Student Dashboard</Typography>
      {alert && (
        <Card className="border border-yellow-200 bg-yellow-50 shadow-sm">
          <CardBody>
            <Typography variant="h6" className="text-yellow-800">
              Attendance Shortage
            </Typography>
            <Typography className="text-yellow-700">
              Your attendance is below the required threshold. Submit any pending leave requests or review class attendance.
            </Typography>
          </CardBody>
        </Card>
      )}

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {overview.map((stat) => (
          <Card key={stat.label} className="border shadow-sm">
            <CardBody>
              <Typography variant="small" className="text-gray-500">
                {stat.label}
              </Typography>
              <Typography variant="h4" className="mt-2">
                {stat.value}
              </Typography>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card className="border shadow-sm">
        <CardBody>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Typography variant="h6">Today's Classes</Typography>
              <Typography className="text-gray-500">
                {loading ? "Loading class schedule..." : "Review your class schedule for today."}
              </Typography>
            </div>
            <Button size="sm">View Timetable</Button>
          </div>
          <div className="mt-6 grid gap-4">
            {timetable.map((item) => (
              <div
                key={`${item.time}-${item.subject}`}
                className="flex flex-col gap-2 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <Typography className="font-medium">{item.subject}</Typography>
                  <Typography variant="small" className="text-gray-500">
                    {item.time} • Room {item.room}
                  </Typography>
                </div>
                <Button size="sm">Details</Button>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
