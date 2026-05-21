import React, { useEffect, useState } from "react";
import { Typography, Card, CardBody, Input, Button } from "@material-tailwind/react";
import { getProfessorNotifications, sendNotification } from "@/API/ApiStore";

export default function Messaging() {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true);
      try {
        const notifications = await getProfessorNotifications(1);
        const loaded = Array.isArray(notifications)
          ? notifications.map((notification) => ({
              id: notification.id,
              sender: notification.sender || "Student",
              text: notification.message || notification.subject || "New notification",
            }))
          : [];
        setMessages(
          loaded.length
            ? loaded
            : [{ id: 1, sender: "System", text: "No messages currently." }]
        );
      } catch (error) {
        console.error("Failed to load professor messages:", error);
        setMessages([{ id: 1, sender: "System", text: "Unable to load messages." }]);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, []);

  const sendMessage = async () => {
    if (!draft.trim()) return;
    const newMessage = { id: messages.length + 1, sender: "You", text: draft };
    setMessages((prev) => [...prev, newMessage]);
    setDraft("");

    try {
      await sendNotification({
        title: "Professor Message",
        subject: "Chat Message",
        message: draft,
        sender: "Professor",
        senderId: 1,
        recipientType: "STUDENT",
        recipientId: 1,
      });
    } catch (error) {
      console.error("Failed to send professor message:", error);
    }
  };

  return (
    <div className="mt-6 space-y-6">
      <Typography variant="h5">Messaging / Chat</Typography>
      <Card className="border shadow-sm">
        <CardBody className="space-y-4">
          {loading ? (
            <Typography>Loading messages...</Typography>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`rounded-xl p-4 ${
                    message.sender === "You" ? "bg-blue-50 text-blue-900" : "bg-gray-50"
                  }`}
                >
                  <Typography variant="small" className="text-gray-500">
                    {message.sender}
                  </Typography>
                  <Typography>{message.text}</Typography>
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              label="Write a message"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <Button onClick={sendMessage}>Send</Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
