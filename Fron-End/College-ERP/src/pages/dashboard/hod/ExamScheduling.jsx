import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Typography,
  Button,
  Input,
  Select,
  Option,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  IconButton,
  Tooltip,
  Chip,
} from "@material-tailwind/react";
import {
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  createExamSchedule,
  getExamSchedulesByHOD,
  updateExamSchedule,
  deleteExamSchedule,
  getExamSchedulesByDepartment,
  getUpcomingExams,
} from "@/API/ApiStore";

const ExamSchedulingForm = ({ onClose, onSuccess, hodId, departmentId }) => {
  const [formData, setFormData] = useState({
    departmentId: departmentId || "",
    subjectName: "",
    courseCode: "",
    examDate: "",
    startTime: "",
    endTime: "",
    hallNumber: "",
    hodId: hodId || "",
    remarks: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const validateForm = () => {
    if (!formData.departmentId) {
      setError("Department is required");
      return false;
    }
    if (!formData.subjectName.trim()) {
      setError("Subject name is required");
      return false;
    }
    if (!formData.courseCode.trim()) {
      setError("Course code is required");
      return false;
    }
    if (!formData.examDate) {
      setError("Exam date is required");
      return false;
    }
    if (!formData.startTime) {
      setError("Start time is required");
      return false;
    }
    if (!formData.endTime) {
      setError("End time is required");
      return false;
    }
    if (formData.startTime >= formData.endTime) {
      setError("Start time must be before end time");
      return false;
    }
    if (!formData.hallNumber.trim()) {
      setError("Hall number is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await createExamSchedule(formData);
      setFormData({
        departmentId: departmentId || "",
        subjectName: "",
        courseCode: "",
        examDate: "",
        startTime: "",
        endTime: "",
        hallNumber: "",
        hodId: hodId || "",
        remarks: "",
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err?.message || "Failed to create exam schedule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <Input
        label="Subject Name"
        name="subjectName"
        value={formData.subjectName}
        onChange={handleChange}
        required
      />

      <Input
        label="Course Code"
        name="courseCode"
        value={formData.courseCode}
        onChange={handleChange}
        required
      />

      <Input
        type="date"
        label="Exam Date"
        name="examDate"
        value={formData.examDate}
        onChange={handleChange}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          type="time"
          label="Start Time"
          name="startTime"
          value={formData.startTime}
          onChange={handleChange}
          required
        />
        <Input
          type="time"
          label="End Time"
          name="endTime"
          value={formData.endTime}
          onChange={handleChange}
          required
        />
      </div>

      <Input
        label="Hall Number"
        name="hallNumber"
        value={formData.hallNumber}
        onChange={handleChange}
        placeholder="e.g., A101, B205"
        required
      />

      <Input
        label="Remarks"
        name="remarks"
        value={formData.remarks}
        onChange={handleChange}
        placeholder="Optional remarks"
      />

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="text"
          color="gray"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          color="blue"
          loading={loading}
        >
          Create Schedule
        </Button>
      </div>
    </form>
  );
};

const EditScheduleForm = ({ schedule, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    subjectName: schedule.subjectName || "",
    courseCode: schedule.courseCode || "",
    examDate: schedule.examDate || "",
    startTime: schedule.startTime || "",
    endTime: schedule.endTime || "",
    hallNumber: schedule.hallNumber || "",
    remarks: schedule.remarks || "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const validateForm = () => {
    if (!formData.subjectName.trim()) {
      setError("Subject name is required");
      return false;
    }
    if (!formData.courseCode.trim()) {
      setError("Course code is required");
      return false;
    }
    if (!formData.examDate) {
      setError("Exam date is required");
      return false;
    }
    if (!formData.startTime) {
      setError("Start time is required");
      return false;
    }
    if (!formData.endTime) {
      setError("End time is required");
      return false;
    }
    if (formData.startTime >= formData.endTime) {
      setError("Start time must be before end time");
      return false;
    }
    if (!formData.hallNumber.trim()) {
      setError("Hall number is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await updateExamSchedule(schedule.id, formData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err?.message || "Failed to update exam schedule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <Input
        label="Subject Name"
        name="subjectName"
        value={formData.subjectName}
        onChange={handleChange}
        required
      />

      <Input
        label="Course Code"
        name="courseCode"
        value={formData.courseCode}
        onChange={handleChange}
        required
      />

      <Input
        type="date"
        label="Exam Date"
        name="examDate"
        value={formData.examDate}
        onChange={handleChange}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          type="time"
          label="Start Time"
          name="startTime"
          value={formData.startTime}
          onChange={handleChange}
          required
        />
        <Input
          type="time"
          label="End Time"
          name="endTime"
          value={formData.endTime}
          onChange={handleChange}
          required
        />
      </div>

      <Input
        label="Hall Number"
        name="hallNumber"
        value={formData.hallNumber}
        onChange={handleChange}
        required
      />

      <Input
        label="Remarks"
        name="remarks"
        value={formData.remarks}
        onChange={handleChange}
        placeholder="Optional remarks"
      />

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="text"
          color="gray"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          color="blue"
          loading={loading}
        >
          Update Schedule
        </Button>
      </div>
    </form>
  );
};

export default function ExamScheduling() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchSubject, setSearchSubject] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // Assuming hodId and departmentId are available from context/localStorage
  const hodId = JSON.parse(localStorage.getItem("user"))?.id || 1;
  const departmentId = JSON.parse(localStorage.getItem("user"))?.departmentId || 1;

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const data = await getExamSchedulesByHOD(hodId);
      setSchedules(data || []);
    } catch (error) {
      console.error("Failed to fetch exam schedules:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteExamSchedule(id);
      setSchedules(schedules.filter((s) => s.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Failed to delete exam schedule:", error);
    }
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setOpenEditDialog(true);
  };

  const filteredSchedules = schedules.filter((schedule) => {
    const matchesSubject = schedule.subjectName
      .toLowerCase()
      .includes(searchSubject.toLowerCase());
    const matchesDate =
      !filterDate || schedule.examDate === filterDate;
    return matchesSubject && matchesDate;
  });

  const upcomingSchedules = filteredSchedules.filter(
    (s) => new Date(s.examDate) >= new Date()
  );

  const pastSchedules = filteredSchedules.filter(
    (s) => new Date(s.examDate) < new Date()
  );

  const formatTime = (time) => {
    if (!time) return "";
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="mt-6 space-y-6">
      <div className="flex items-center justify-between">
        <Typography variant="h5">Exam Scheduling</Typography>
        <Button
          color="blue"
          onClick={() => setOpenCreateDialog(true)}
          className="flex items-center gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          Add Exam Schedule
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Search by Subject"
              value={searchSubject}
              onChange={(e) => setSearchSubject(e.target.value)}
              placeholder="e.g., Mathematics"
            />
            <Input
              type="date"
              label="Filter by Date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
        </CardBody>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardBody className="text-center">
            <Typography color="gray" className="text-sm font-medium">
              Total Schedules
            </Typography>
            <Typography variant="h6">{filteredSchedules.length}</Typography>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <Typography color="gray" className="text-sm font-medium">
              Upcoming Exams
            </Typography>
            <Typography variant="h6" className="text-blue-600">
              {upcomingSchedules.length}
            </Typography>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <Typography color="gray" className="text-sm font-medium">
              Past Exams
            </Typography>
            <Typography variant="h6" className="text-gray-600">
              {pastSchedules.length}
            </Typography>
          </CardBody>
        </Card>
      </div>

      {/* Upcoming Exams Table */}
      {upcomingSchedules.length > 0 && (
        <Card>
          <CardHeader className="border-b p-6">
            <Typography variant="h6">Upcoming Exams</Typography>
          </CardHeader>
          <CardBody className="overflow-x-auto p-0">
            <table className="w-full text-left">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-700">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-700">
                    Course Code
                  </th>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-700">
                    Time
                  </th>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-700">
                    Hall
                  </th>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {upcomingSchedules.map((schedule) => (
                  <tr key={schedule.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">
                      {schedule.subjectName}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Chip
                        size="sm"
                        variant="ghost"
                        value={schedule.courseCode}
                      />
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {formatDate(schedule.examDate)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {formatTime(schedule.startTime)} -{" "}
                      {formatTime(schedule.endTime)}
                    </td>
                    <td className="px-6 py-4 text-sm">{schedule.hallNumber}</td>
                    <td className="px-6 py-4 space-x-2">
                      <Tooltip content="Edit">
                        <IconButton
                          size="sm"
                          variant="text"
                          color="blue"
                          onClick={() => handleEdit(schedule)}
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip content="Delete">
                        <IconButton
                          size="sm"
                          variant="text"
                          color="red"
                          onClick={() => setDeleteConfirm(schedule.id)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </IconButton>
                      </Tooltip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}

      {/* Past Exams Table */}
      {pastSchedules.length > 0 && (
        <Card>
          <CardHeader className="border-b p-6">
            <Typography variant="h6">Past Exams</Typography>
          </CardHeader>
          <CardBody className="overflow-x-auto p-0">
            <table className="w-full text-left">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-700">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-700">
                    Course Code
                  </th>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-700">
                    Time
                  </th>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-700">
                    Hall
                  </th>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {pastSchedules.map((schedule) => (
                  <tr
                    key={schedule.id}
                    className="border-b bg-gray-50 hover:bg-gray-100"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-500">
                      {schedule.subjectName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <Chip
                        size="sm"
                        variant="ghost"
                        value={schedule.courseCode}
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(schedule.examDate)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatTime(schedule.startTime)} -{" "}
                      {formatTime(schedule.endTime)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {schedule.hallNumber}
                    </td>
                    <td className="px-6 py-4 space-x-2">
                      <Tooltip content="Delete">
                        <IconButton
                          size="sm"
                          variant="text"
                          color="red"
                          onClick={() => setDeleteConfirm(schedule.id)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </IconButton>
                      </Tooltip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}

      {filteredSchedules.length === 0 && !loading && (
        <Card>
          <CardBody className="text-center py-12">
            <Typography color="gray">
              No exam schedules found. Create one to get started!
            </Typography>
          </CardBody>
        </Card>
      )}

      {loading && (
        <Card>
          <CardBody className="text-center py-12">
            <Typography color="gray">Loading exam schedules...</Typography>
          </CardBody>
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog
        open={openCreateDialog}
        size="md"
        handler={() => setOpenCreateDialog(false)}
      >
        <DialogHeader className="border-b">Add Exam Schedule</DialogHeader>
        <DialogBody className="space-y-4">
          <ExamSchedulingForm
            onClose={() => setOpenCreateDialog(false)}
            onSuccess={fetchSchedules}
            hodId={hodId}
            departmentId={departmentId}
          />
        </DialogBody>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={openEditDialog}
        size="md"
        handler={() => setOpenEditDialog(false)}
      >
        <DialogHeader className="border-b">Edit Exam Schedule</DialogHeader>
        <DialogBody className="space-y-4">
          {editingSchedule && (
            <EditScheduleForm
              schedule={editingSchedule}
              onClose={() => setOpenEditDialog(false)}
              onSuccess={fetchSchedules}
            />
          )}
        </DialogBody>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={deleteConfirm !== null}
        handler={() => setDeleteConfirm(null)}
        size="sm"
      >
        <DialogHeader>Confirm Delete</DialogHeader>
        <DialogBody>
          Are you sure you want to delete this exam schedule? This action cannot
          be undone.
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="gray"
            onClick={() => setDeleteConfirm(null)}
          >
            Cancel
          </Button>
          <Button
            color="red"
            onClick={() => handleDelete(deleteConfirm)}
          >
            Delete
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
