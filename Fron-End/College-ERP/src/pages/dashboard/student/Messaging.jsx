import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
} from "@material-tailwind/react";
import { getStudentNotifications, sendNotification } from "@/API/ApiStore";

export default function Messaging() {
  const [chat, setChat] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true);
      try {
        const notifications = await getStudentNotifications(1);
        const loaded = Array.isArray(notifications)
          ? notifications.map((notification) => ({
              id: notification.id,
              author: notification.sender || "Professor",
              text: notification.message || notification.subject || "New notification",
            }))
          : [];
        setChat(loaded.length ? loaded : [{ id: 1, author: "Professor", text: "No new messages yet." }]);
      } catch (error) {
        console.error("Failed to load messages:", error);
        setChat([{ id: 1, author: "Professor", text: "Unable to load messages right now." }]);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, []);

  const sendMessage = async () => {
    if (!draft.trim()) return;
    const newMessage = { id: chat.length + 1, author: "You", text: draft };
    setChat((prev) => [...prev, newMessage]);
    setDraft("");

    try {
      await sendNotification({
        title: "Student Message",
        subject: "Chat Message",
        message: draft,
        sender: "Student",
        senderId: 1,
        recipientType: "PROFESSOR",
        recipientId: 1,
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="mt-6 space-y-6">
      <Typography variant="h5">Messaging</Typography>
      <Card className="border shadow-sm">
        <CardHeader floated={false} shadow={false} className="p-6">
          <Typography variant="h6">Conversation</Typography>
        </CardHeader>
        <CardBody className="p-6 space-y-4">
          {loading ? (
            <Typography>Loading messages...</Typography>
          ) : (
            chat.map((message) => (
              <div
                key={message.id}
                className={`rounded-xl p-4 ${
                  message.author === "You" ? "bg-blue-50 text-blue-900" : "bg-gray-50"
                }`}
              >
                <Typography variant="small" className="text-gray-500">
                  {message.author}
                </Typography>
                <Typography>{message.text}</Typography>
              </div>
            ))
          )}
          <div className="flex gap-4">
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
