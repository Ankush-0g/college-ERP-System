import React, { useEffect, useState } from "react";
import { Typography, Card, CardBody, Button } from "@material-tailwind/react";
import { getStudentHallTicket } from "../../../API/ApiStore";

export default function HallTicket() {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTicket = async () => {
      setLoading(true);
      try {
        const data = await getStudentHallTicket(1);
        setTicket(data);
      } catch (error) {
        console.error("Unable to load hall ticket:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, []);

  return (
    <div className="mt-6 space-y-6">
      <Typography variant="h5">Hall Ticket</Typography>
      <Card className="border shadow-sm">
        <CardBody>
          {loading && <Typography>Loading hall ticket...</Typography>}
          {!loading && !ticket && <Typography>No hall ticket is available yet.</Typography>}
          {ticket && (
            <div className="space-y-3">
              <Typography className="font-medium">{ticket.studentName}</Typography>
              <Typography variant="small" className="text-gray-500">
                Roll No: {ticket.rollNumber}
              </Typography>
              <Typography variant="small" className="text-gray-500">
                Exam: {ticket.examName}
              </Typography>
              <Typography variant="small" className="text-gray-500">
                Venue: {ticket.venue}
              </Typography>
              <Button size="sm" color="blue" onClick={() => window.print()}>
                Print Hall Ticket
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
