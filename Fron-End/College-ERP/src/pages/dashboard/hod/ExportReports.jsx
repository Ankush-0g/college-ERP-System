import React from "react";
import { Typography, Card, CardBody, Button } from "@material-tailwind/react";

export default function ExportReports() {
  return (
    <div className="mt-6">
      <Typography variant="h5" className="mb-4">
        Export Reports (PDF / Excel)
      </Typography>
      <Card>
        <CardBody>
          <Typography className="mb-4">
            Placeholder to export selected reports as PDF or Excel.
          </Typography>
          <div className="flex gap-2">
            <Button color="blue">Export PDF</Button>
            <Button color="green">Export Excel</Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
