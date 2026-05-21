import React, { useEffect, useState } from "react";
import { Typography, Card, CardBody, CardHeader, Chip, Input } from "@material-tailwind/react";
import {
  getExamSchedulesByDepartment,
  getUpcomingExams,
} from "@/API/ApiStore";

export default function ExamSchedule() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchSubject, setSearchSubject] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // Assuming departmentId is available from context/localStorage
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const departmentId = user.departmentId || user.major || 1;

  useEffect(() => {
    fetchExamSchedules();
  }, [departmentId]);

  const fetchExamSchedules = async () => {
    setLoading(true);
    try {
      // Get upcoming exams for the student's department
      const data = await getUpcomingExams(departmentId);
      setExams(data || []);
    } catch (error) {
      console.error("Unable to load exam schedule:", error);
      // Fallback: try to get all exams for the department
      try {
        const allExams = await getExamSchedulesByDepartment(departmentId);
        setExams(allExams || []);
      } catch (err) {
        console.error("Unable to load exam schedules:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredExams = exams.filter((exam) => {
    const matchesSubject = exam.subjectName
      .toLowerCase()
      .includes(searchSubject.toLowerCase());
    const matchesDate = !filterDate || exam.examDate === filterDate;
    return matchesSubject && matchesDate;
  });

  const upcomingExams = filteredExams.filter(
    (exam) => new Date(exam.examDate) >= new Date()
  );

  const pastExams = filteredExams.filter(
    (exam) => new Date(exam.examDate) < new Date()
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
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysUntilExam = (examDate) => {
    const today = new Date();
    const exam = new Date(examDate);
    const diffTime = exam - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusBadge = (examDate) => {
    const daysUntil = getDaysUntilExam(examDate);
    if (daysUntil < 0) return { color: "gray", text: "Completed" };
    if (daysUntil === 0) return { color: "red", text: "Today" };
    if (daysUntil === 1) return { color: "orange", text: "Tomorrow" };
    if (daysUntil <= 7) return { color: "amber", text: `${daysUntil} days` };
    return { color: "blue", text: `${daysUntil} days` };
  };

  return (
    <div className="mt-6 space-y-6">
      <Typography variant="h5">Exam Schedule</Typography>

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
              Total Exams
            </Typography>
            <Typography variant="h6">{filteredExams.length}</Typography>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <Typography color="gray" className="text-sm font-medium">
              Upcoming
            </Typography>
            <Typography variant="h6" className="text-blue-600">
              {upcomingExams.length}
            </Typography>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <Typography color="gray" className="text-sm font-medium">
              Completed
            </Typography>
            <Typography variant="h6" className="text-gray-600">
              {pastExams.length}
            </Typography>
          </CardBody>
        </Card>
      </div>

      {/* Upcoming Exams */}
      {upcomingExams.length > 0 && (
        <Card className="border shadow-sm">
          <CardHeader className="border-b p-6">
            <Typography variant="h6">Upcoming Exams</Typography>
          </CardHeader>
          <CardBody className="space-y-4">
            {upcomingExams.map((exam) => {
              const status = getStatusBadge(exam.examDate);
              return (
                <div
                  key={`${exam.id}`}
                  className="rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Typography className="font-semibold text-lg">
                        {exam.subjectName}
                      </Typography>
                      <Typography variant="small" className="text-gray-500">
                        {exam.courseCode}
                      </Typography>
                    </div>
                    <Chip
                      size="sm"
                      color={status.color}
                      value={status.text}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="border-l-2 border-blue-500 pl-3">
                      <Typography variant="small" className="text-gray-500">
                        Date
                      </Typography>
                      <Typography className="font-medium text-sm">
                        {formatDate(exam.examDate)}
                      </Typography>
                    </div>

                    <div className="border-l-2 border-green-500 pl-3">
                      <Typography variant="small" className="text-gray-500">
                        Time
                      </Typography>
                      <Typography className="font-medium text-sm">
                        {formatTime(exam.startTime)} - {formatTime(exam.endTime)}
                      </Typography>
                    </div>

                    <div className="border-l-2 border-purple-500 pl-3">
                      <Typography variant="small" className="text-gray-500">
                        Duration
                      </Typography>
                      <Typography className="font-medium text-sm">
                        {(() => {
                          const start = new Date(`2000-01-01T${exam.startTime}`);
                          const end = new Date(`2000-01-01T${exam.endTime}`);
                          const hours = Math.floor((end - start) / (1000 * 60 * 60));
                          const minutes = Math.floor(((end - start) % (1000 * 60 * 60)) / (1000 * 60));
                          return `${hours}h ${minutes}m`;
                        })()}
                      </Typography>
                    </div>

                    <div className="border-l-2 border-orange-500 pl-3">
                      <Typography variant="small" className="text-gray-500">
                        Hall
                      </Typography>
                      <Typography className="font-medium text-sm">
                        {exam.hallNumber}
                      </Typography>
                    </div>
                  </div>

                  {exam.remarks && (
                    <div className="mt-3 bg-blue-50 rounded p-2">
                      <Typography variant="small" className="text-blue-800">
                        <span className="font-semibold">Note:</span> {exam.remarks}
                      </Typography>
                    </div>
                  )}
                </div>
              );
            })}
          </CardBody>
        </Card>
      )}

      {/* Past Exams */}
      {pastExams.length > 0 && (
        <Card className="border shadow-sm">
          <CardHeader className="border-b p-6">
            <Typography variant="h6">Past Exams</Typography>
          </CardHeader>
          <CardBody className="space-y-4">
            {pastExams.map((exam) => (
              <div
                key={`${exam.id}`}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <Typography className="font-semibold text-lg text-gray-600">
                      {exam.subjectName}
                    </Typography>
                    <Typography variant="small" className="text-gray-400">
                      {exam.courseCode}
                    </Typography>
                  </div>
                  <Chip size="sm" color="gray" value="Completed" />
                </div>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="border-l-2 border-gray-300 pl-3">
                    <Typography variant="small" className="text-gray-400">
                      Date
                    </Typography>
                    <Typography className="font-medium text-sm text-gray-600">
                      {formatDate(exam.examDate)}
                    </Typography>
                  </div>

                  <div className="border-l-2 border-gray-300 pl-3">
                    <Typography variant="small" className="text-gray-400">
                      Time
                    </Typography>
                    <Typography className="font-medium text-sm text-gray-600">
                      {formatTime(exam.startTime)} - {formatTime(exam.endTime)}
                    </Typography>
                  </div>

                  <div className="border-l-2 border-gray-300 pl-3">
                    <Typography variant="small" className="text-gray-400">
                      Duration
                    </Typography>
                    <Typography className="font-medium text-sm text-gray-600">
                      {(() => {
                        const start = new Date(`2000-01-01T${exam.startTime}`);
                        const end = new Date(`2000-01-01T${exam.endTime}`);
                        const hours = Math.floor((end - start) / (1000 * 60 * 60));
                        const minutes = Math.floor(((end - start) % (1000 * 60 * 60)) / (1000 * 60));
                        return `${hours}h ${minutes}m`;
                      })()}
                    </Typography>
                  </div>

                  <div className="border-l-2 border-gray-300 pl-3">
                    <Typography variant="small" className="text-gray-400">
                      Hall
                    </Typography>
                    <Typography className="font-medium text-sm text-gray-600">
                      {exam.hallNumber}
                    </Typography>
                  </div>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      {filteredExams.length === 0 && !loading && (
        <Card className="border shadow-sm">
          <CardBody className="text-center py-12">
            <Typography color="gray">
              {searchSubject || filterDate
                ? "No exams found matching your filters."
                : "No exams scheduled for your department yet."}
            </Typography>
          </CardBody>
        </Card>
      )}

      {loading && (
        <Card className="border shadow-sm">
          <CardBody className="text-center py-12">
            <Typography color="gray">Loading exam schedule...</Typography>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
