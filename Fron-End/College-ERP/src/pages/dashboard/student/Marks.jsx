import React from "react";
import { Typography, Card, CardBody } from "@material-tailwind/react";

const marks = [
  { subject: "Computer Networks", internal: 24, external: 65, total: 89 },
  { subject: "Data Structures", internal: 22, external: 60, total: 82 },
  { subject: "Database Systems", internal: 21, external: 58, total: 79 },
];

export default function Marks() {
  return (
    <div className="mt-6 space-y-6">
      <Typography variant="h5">View Marks & GPA</Typography>
      <Card className="border shadow-sm">
        <CardBody>
          <Typography variant="h6" className="mb-4">
            Current Semester Grades
          </Typography>
          <div className="space-y-4">
            {marks.map((row) => (
              <div key={row.subject} className="rounded-xl border p-4">
                <Typography className="font-medium">{row.subject}</Typography>
                <Typography variant="small" className="text-gray-500">
                  Internal: {row.internal}, External: {row.external}, Total: {row.total}
                </Typography>
              </div>
            ))}
          </div>
          <Typography variant="h6" className="mt-6">
            GPA: 7.8
          </Typography>
        </CardBody>
      </Card>
    </div>
  );
}
