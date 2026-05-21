import React, { useEffect, useState } from "react";
import { Typography, Card, CardBody } from "@material-tailwind/react";
import { getStudentTimetable } from "../../../API/ApiStore";

export default function Timetable() {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTimetable = async () => {
      setLoading(true);
      try {
        const data = await getStudentTimetable(1);
        setTimetable(data || []);
      } catch (error) {
        console.error("Unable to load timetable:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, []);

  return (
    <div className="mt-6 space-y-6">
      <Typography variant="h5">Student Timetable</Typography>
      <Card className="border shadow-sm">
        <CardBody className="space-y-4">
          {loading && <Typography>Loading timetable...</Typography>}
          {!loading && timetable.length === 0 && (
            <Typography>No timetable entries are available.</Typography>
          )}
          {timetable.map((entry, index) => (
            <div key={`${entry.time}-${entry.subject}-${index}`} className="rounded-xl border p-4">
              <Typography className="font-medium">{entry.subject}</Typography>
              <Typography variant="small" className="text-gray-500">
                {entry.time} • Room {entry.room}
              </Typography>
              <Typography variant="small" className="mt-2 inline-flex rounded-full bg-blue-100 px-3 py-1 text-blue-700">
                {entry.status}
              </Typography>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
