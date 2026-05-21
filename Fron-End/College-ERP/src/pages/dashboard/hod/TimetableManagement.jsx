import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
  CardBody,
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  Input,
  Select,
  Option,
} from "@material-tailwind/react";
import {
  getHodTimetable,
  createHodTimetable,
  updateHodTimetable,
  deleteHodTimetable,
} from "@/API/ApiStore";

const defaultEntry = {
  day: "Monday",
  time: "09:00",
  subject: "",
  room: "",
  professor: "",
  status: "Scheduled",
};

export default function TimetableManagement() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(defaultEntry);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const loadEntries = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getHodTimetable();
      setEntries(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const openDialog = (entry = null) => {
    if (entry) {
      setEditingId(entry.id);
      setForm({
        day: entry.day || "Monday",
        time: entry.time || "09:00",
        subject: entry.subject || "",
        room: entry.room || "",
        professor: entry.professor || "",
        status: entry.status || "Scheduled",
      });
    } else {
      setEditingId(null);
      setForm(defaultEntry);
    }
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    setForm(defaultEntry);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!form.subject || !form.professor || !form.room || !form.time) {
      setError("Please complete all required fields.");
      return;
    }

    try {
      setError("");
      if (editingId) {
        await updateHodTimetable(editingId, form);
      } else {
        await createHodTimetable(form);
      }
      closeDialog();
      loadEntries();
    } catch (err) {
      setError(err?.message || JSON.stringify(err));
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteHodTimetable(id);
      loadEntries();
    } catch (err) {
      setError(err?.message || JSON.stringify(err));
    }
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <Typography variant="h5">Timetable Management</Typography>
        <Button size="sm" color="green" onClick={() => openDialog(null)}>
          New Slot
        </Button>
      </div>

      <Card>
        <CardBody>
          {loading ? (
            <Typography>Loading timetable...</Typography>
          ) : error ? (
            <Typography color="red">{error}</Typography>
          ) : entries.length === 0 ? (
            <Typography>No timetable entries available.</Typography>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] table-auto">
                <thead>
                  <tr>
                    <th className="text-left py-2">Day</th>
                    <th className="text-left py-2">Time</th>
                    <th className="text-left py-2">Subject</th>
                    <th className="text-left py-2">Room</th>
                    <th className="text-left py-2">Professor</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} className="border-t">
                      <td className="py-2">{entry.day}</td>
                      <td className="py-2">{entry.time}</td>
                      <td className="py-2">{entry.subject}</td>
                      <td className="py-2">{entry.room}</td>
                      <td className="py-2">{entry.professor}</td>
                      <td className="py-2">{entry.status}</td>
                      <td className="py-2">
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => openDialog(entry)}>
                            Edit
                          </Button>
                          <Button size="sm" color="red" onClick={() => handleDelete(entry.id)}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      <Dialog open={open} handler={closeDialog} size="lg">
        <DialogBody>
          <Typography variant="h6" className="mb-4">
            {editingId ? "Edit Timetable Slot" : "New Timetable Slot"}
          </Typography>
          <div className="grid gap-4 md:grid-cols-2">
            <Select value={form.day} onChange={(value) => setForm({ ...form, day: value })} label="Day">
              <Option value="Monday">Monday</Option>
              <Option value="Tuesday">Tuesday</Option>
              <Option value="Wednesday">Wednesday</Option>
              <Option value="Thursday">Thursday</Option>
              <Option value="Friday">Friday</Option>
              <Option value="Saturday">Saturday</Option>
            </Select>
            <Input
              label="Time"
              type="time"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
            />
            <Input
              label="Subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
            <Input
              label="Room"
              value={form.room}
              onChange={(e) => setForm({ ...form, room: e.target.value })}
            />
            <Input
              label="Professor"
              value={form.professor}
              onChange={(e) => setForm({ ...form, professor: e.target.value })}
            />
            <Select
              value={form.status}
              onChange={(value) => setForm({ ...form, status: value })}
              label="Status"
            >
              <Option value="Scheduled">Scheduled</Option>
              <Option value="Ongoing">Ongoing</Option>
              <Option value="Completed">Completed</Option>
            </Select>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={closeDialog}>
            Cancel
          </Button>
          <Button color="blue" onClick={handleSave}>
            {editingId ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
