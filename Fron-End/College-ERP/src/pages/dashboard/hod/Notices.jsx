import React from "react";
import { Typography, Card, CardBody, Button } from "@material-tailwind/react";

export default function Notices() {
  return (
    <div className="mt-6">
      <Typography variant="h5" className="mb-4">
        Notices & Announcements
      </Typography>
      <Card>
        <CardBody>
          <Typography className="mb-4">Create and send notices.</Typography>
          <Button>New Notice</Button>
        </CardBody>
      </Card>
    </div>
  );
}
