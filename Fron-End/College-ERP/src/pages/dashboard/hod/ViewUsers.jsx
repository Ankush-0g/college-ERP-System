import React from "react";
import { Typography, Card, CardBody } from "@material-tailwind/react";

export default function ViewUsers() {
  return (
    <div className="mt-6">
      <Typography variant="h5" className="mb-4">
        View All Students & Faculty
      </Typography>
      <Card>
        <CardBody>
          <Typography>Placeholder for user directory and search.</Typography>
        </CardBody>
      </Card>
    </div>
  );
}
