import React, { useState } from "react";
import { Typography, Card, CardBody, Button, Input } from "@material-tailwind/react";

const links = [
  { id: 1, title: "Database Systems Lecture", url: "https://meet.example.com/dbs" },
  { id: 2, title: "Algorithms Review", url: "https://meet.example.com/algo" },
];

export default function OnlineLectures() {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");

  return (
    <div className="mt-6 space-y-6">
      <Typography variant="h5">Online Lecture Links</Typography>
      <Card className="border shadow-sm">
        <CardBody className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Input label="Lecture Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input label="Meeting URL" value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>
          <Button>Save Link</Button>
        </CardBody>
      </Card>
      <Card className="border shadow-sm">
        <CardBody>
          <Typography variant="h6" className="mb-4">
            Shared Links
          </Typography>
          <div className="space-y-3">
            {links.map((link) => (
              <div key={link.id} className="rounded-xl border p-4">
                <Typography className="font-medium">{link.title}</Typography>
                <Typography variant="small" className="text-gray-500">
                  {link.url}
                </Typography>
                <Button size="sm" className="mt-3">
                  Open Link
                </Button>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
