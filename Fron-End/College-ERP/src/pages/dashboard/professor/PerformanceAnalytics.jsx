import React from "react";
import {
  Typography,
  Card,
  CardBody,
  CardHeader,
} from "@material-tailwind/react";

const analytics = [
  { label: "Average Score", value: "78%" },
  { label: "Top Performer", value: "Ananya Gupta" },
  { label: "Low Attendance", value: "10 students" },
];

export default function PerformanceAnalytics() {
  return (
    <div className="mt-6 space-y-6">
      <Typography variant="h5">Student Performance Analytics</Typography>
      <div className="grid gap-6 lg:grid-cols-3">
        {analytics.map((item) => (
          <Card key={item.label} className="border shadow-sm">
            <CardBody>
              <Typography variant="small" className="text-gray-500">
                {item.label}
              </Typography>
              <Typography variant="h4" className="mt-2">
                {item.value}
              </Typography>
            </CardBody>
          </Card>
        ))}
      </div>
      <Card className="border shadow-sm">
        <CardHeader floated={false} shadow={false} className="p-6">
          <Typography variant="h6">Performance Summary</Typography>
        </CardHeader>
        <CardBody className="p-6 text-gray-600">
          Use this section to analyze student performance trendlines, identify weak topics, and plan remedial actions. The UI can be enhanced with charts and reports when the backend is connected.
        </CardBody>
      </Card>
    </div>
  );
}
