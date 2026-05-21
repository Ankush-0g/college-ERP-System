import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  Button,
} from "@material-tailwind/react";
import { CalendarDaysIcon, DocumentCheckIcon } from "@heroicons/react/24/outline";
import { getClasses } from "@/API/ApiStore";

const fallbackClasses = [
  { time: "09:00 AM", course: "Computer Networks", room: "A-204", status: "Live" },
  { time: "11:00 AM", course: "Data Structures", room: "B-110", status: "Upcoming" },
  { time: "02:00 PM", course: "Database Systems", room: "C-301", status: "Upcoming" },
];

const upcomingDeadlines = [
  { title: "Midterm Assignment", due: "May 20, 2026", course: "Algorithms" },
  { title: "Lab Report", due: "May 22, 2026", course: "Operating Systems" },
];

export default function Home() {
  const [todayClasses, setTodayClasses] = useState(fallbackClasses);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadClasses = async () => {
      setLoading(true);
      try {
        const data = await getClasses();
        if (Array.isArray(data) && data.length > 0) {
          setTodayClasses(
            data.slice(0, 5).map((item) => ({
              time: item.time || item.Time || "09:00 AM",
              course: item.subject || item.subjectName || item.course || "Class",
              room: item.room || item.Room || "TBD",
              status: item.status || "Upcoming",
            }))
          );
        }
      } catch (error) {
        console.error("Unable to load classes:", error);
      } finally {
        setLoading(false);
      }
    };

    loadClasses();
  }, []);

  const quickStats = [
    { label: "Today's Classes", value: todayClasses.length.toString() },
    { label: "Pending Attendance", value: "24" },
    { label: "New Submissions", value: "8" },
    { label: "Unread Messages", value: "5" },
  ];

  return (
    <div className="mt-12 space-y-8">
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {quickStats.map((card) => (
          <Card key={card.label} className="border shadow-sm">
            <CardBody>
              <Typography variant="small" className="text-gray-500">
                {card.label}
              </Typography>
              <Typography variant="h4" className="mt-2">
                {card.value}
              </Typography>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2 border shadow-sm">
          <CardHeader floated={false} shadow={false} className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Typography variant="h6">Today's Classes</Typography>
                <Typography variant="small" className="text-gray-500">
                  {loading ? "Loading class schedule..." : "Your teaching schedule for the day."}
                </Typography>
              </div>
              <CalendarDaysIcon className="h-6 w-6 text-blue-500" />
            </div>
          </CardHeader>
          <CardBody className="p-6 space-y-4">
            {todayClasses.map((session) => (
              <div
                key={`${session.time}-${session.course}`}
                className="flex flex-col gap-3 rounded-xl border p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <Typography className="font-medium">{session.course}</Typography>
                  <Typography variant="small" className="text-gray-500">
                    {session.time} • Room {session.room}
                  </Typography>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                      session.status === "Live"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {session.status}
                  </span>
                  <Button size="sm">Open</Button>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader floated={false} shadow={false} className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Typography variant="h6">Upcoming Deadlines</Typography>
                <Typography variant="small" className="text-gray-500">
                  Keep track of due assignments.
                </Typography>
              </div>
              <DocumentCheckIcon className="h-6 w-6 text-blue-500" />
            </div>
          </CardHeader>
          <CardBody className="p-6 space-y-4">
            {upcomingDeadlines.map((deadline) => (
              <div key={deadline.title} className="rounded-xl border p-4">
                <Typography className="font-medium">{deadline.title}</Typography>
                <Typography variant="small" className="text-gray-500">
                  {deadline.course} • due {deadline.due}
                </Typography>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
