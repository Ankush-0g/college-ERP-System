import axios from "axios";

const API_BASE = "http://localhost:8080/api";

export const apiClient = axios.create({
  baseURL: API_BASE,
});

// Utility helpers
const safeResponse = (err, fallbackMessage) => {
  throw err.response?.data || fallbackMessage;
};

export const sendForgotPasswordEmail = async (role, email) => {
  const endpointMap = {
    student: "/students/forgot-password",
    professor: "/professors/forgot-password",
    hod: "/hods/forgot-password",
  };

  try {
    const response = await apiClient.post(endpointMap[role], { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || "An error occurred";
  }
};

export const verifyOTP = async (role, email, otp) => {
  const endpointMap = {
    student: "/students/verify-otp",
    professor: "/professors/verify-otp",
    hod: "/hods/verify-otp",
  };

  const endpoint = endpointMap[role] || endpointMap.student;
  try {
    const response = await apiClient.post(
      `${endpoint}?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || "An error occurred");
  }
};

export const resetPassword = async ({ role, email, password }) => {
  const endpointMap = {
    student: "/students/reset-password",
    professor: "/professors/reset-password",
    hod: "/hods/reset-password",
  };

  const endpoint = endpointMap[role] || endpointMap.student;
  try {
    const response = await apiClient.post(endpoint, {
      email,
      newPassword: password,
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data || "An error occurred";
    throw new Error(errorMessage);
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await apiClient.post("/students/register", userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || "An error occurred");
  }
};

export const getClasses = async () => {
  try {
    const res = await apiClient.get("/classes");
    return res.data;
  } catch (err) {
    safeResponse(err, "Failed to fetch class sessions");
  }
};

export const getClassById = async (classId) => {
  try {
    const res = await apiClient.get(`/classes/${classId}`);
    return res.data;
  } catch (err) {
    safeResponse(err, "Failed to fetch class details");
  }
};

export const saveAttendance = async (payload) => {
  try {
    const res = await apiClient.post("/attendance/save", payload);
    return res.data;
  } catch (err) {
    safeResponse(err, "Failed to save attendance");
  }
};

export const getAttendanceByLecturerSubject = async (lecturer, subject) => {
  try {
    const res = await apiClient.get(
      `/attendance/lecturer/subject?lecturer=${encodeURIComponent(lecturer)}&subject=${encodeURIComponent(subject)}`
    );
    return res.data;
  } catch (err) {
    safeResponse(err, "Failed to fetch attendance records");
  }
};

export const getProfessorAttendanceEligibility = async (professorId) => {
  try {
    const res = await apiClient.get(
      `/attendance/professor/eligibility?professorId=${encodeURIComponent(professorId)}`
    );
    return res.data;
  } catch (err) {
    safeResponse(err, "Failed to fetch attendance eligibility");
  }
};


export const getProfessorNotifications = async (professorId) => {
  try {
    const res = await apiClient.get(`/notifications/professor/${professorId}`);
    return res.data;
  } catch (err) {
    safeResponse(err, "Failed to fetch notifications");
  }
};

export const getStudentNotifications = async (studentId) => {
  try {
    const res = await apiClient.get(`/notifications/student/${studentId}`);
    return res.data;
  } catch (err) {
    safeResponse(err, "Failed to fetch notifications");
  }
};

export const sendNotification = async (notificationPayload) => {
  try {
    const res = await apiClient.post("/notifications/send", notificationPayload);
    return res.data;
  } catch (err) {
    safeResponse(err, "Failed to send notification");
  }
};

export const getStudents = async () => {
  try {
    const res = await apiClient.get("/students");
    return res.data;
  } catch (err) {
    safeResponse(err, "Failed to fetch students");
  }
};

export const getAllProfessors = async () => {
  try {
    const res = await apiClient.get("/professors/get-prof");
    return res.data;
  } catch (err) {
    safeResponse(err, "Failed to fetch professors");
  }
};

// ---------- HOD APIs (placeholders) ----------
export const getDepartments = async () => {
  try {
    const res = await apiClient.get("/hod/departments");
    return res.data;
  } catch (err) {
    safeResponse(err, "Failed to fetch departments");
  }
};

export const createDepartment = async (payload) => {
  try {
    const res = await apiClient.post("/hod/departments", payload);
    return res.data;
  } catch (err) {
    safeResponse(err, "Failed to create department");
  }
};

export const getLeaveRequests = async () => {
  try {
    const res = await apiClient.get("/hod/leaves");
    return res.data;
  } catch (err) {
    safeResponse(err, "Failed to fetch leaves");
  }
};

export const getStudentLeaves = async (studentId) => {
  try {
    const res = await apiClient.get(`/students/${studentId}/leaves`);
    return res.data;
  } catch (err) {
    safeResponse(err, "Failed to fetch student leave history");
  }
};

export const approveLeave = async (leaveId, approve = true) => {
  try {
    const res = await apiClient.post(`/hod/leaves/${leaveId}/decision`, { approve });
    return res.data;
  } catch (err) {
    safeResponse(err, "Failed to update leave status");
  }
};

export const getProfessorLeaves = async (professorId) => {
  try {
    const res = await apiClient.get(`/professors/${professorId}/leaves`);
    return res.data;
  } catch (err) {
    safeResponse(err, "Failed to fetch professor leave history");
  }
};

export const exportReport = async (reportType, params) => {
  try {
    const res = await apiClient.post(`/hod/reports/export?type=${encodeURIComponent(reportType)}`, params, {
      responseType: "blob",
    });
    return res.data;
  } catch (err) {
    safeResponse(err, "Failed to export report");
  }
};

export const getHodReportSummary = async () => {
  try {
    const res = await apiClient.get("/hod/reports");
    return res.data;
  } catch (err) {
    safeResponse(err, "Failed to fetch report summary");
  }
};

export const getHodTimetable = async () => {
  try {
    const res = await apiClient.get("/hod/timetables");
    return res.data;
  } catch (err) {
    safeResponse(err, "Failed to fetch timetable entries");
  }
};

export const createHodTimetable = async (payload) => {
  try {
    const res = await apiClient.post("/hod/timetables", payload);
    return res.data;
  } catch (err) {
    safeResponse(err, "Failed to create timetable entry");
  }
};

export const updateHodTimetable = async (timetableId, payload) => {
  try {
    const res = await apiClient.put(`/hod/timetables/${timetableId}`, payload);
    return res.data;
  } catch (err) {
    safeResponse(err, "Failed to update timetable entry");
  }
};

export const deleteHodTimetable = async (timetableId) => {
  try {
    const res = await apiClient.delete(`/hod/timetables/${timetableId}`);
    return res.data;
  } catch (err) {
    safeResponse(err, "Failed to delete timetable entry");
  }
};

// ---------- Professor APIs ----------
export const getProfessorAssignments = async () => {
  try {
    const res = await apiClient.get("/professor/assignments");
    return res.data;
  } catch (err) {
    safeResponse(err, "Failed to fetch assignments");
  }
};

export const uploadAssignment = async (payload) => {
  try {
    const res = await apiClient.post("/professor/assignments", payload);
    return res.data;
  } catch (err) {
    safeResponse(err, "Failed to upload assignment");
  }
};

// ---------- HOD DEPARTMENT MANAGEMENT APIs ----------

export const getHODInfo = async (hodId) => {
  try {
    const res = await apiClient.get(`/hod/department/info/${hodId}`);
    return res.data;
  } catch (err) {
    safeResponse(err, "Failed to fetch HOD information");
  }
};

export const getDepartmentProfessors = async (hodId) => {
  try {
    const res = await apiClient.get(`/hod/department/professors/${hodId}`);
    return res.data;
  } catch (err) {
    safeResponse(err, "Failed to fetch department professors");
  }
};

export const getDepartmentStudents = async (hodId) => {
  try {
    const res = await apiClient.get(`/hod/department/students/${hodId}`);
    return res.data;
  } catch (err) {
    safeResponse(err, "Failed to fetch department students");
  }
};

export const getDepartmentCourses = async (hodId) => {
  try {
    const res = await apiClient.get(`/hod/department/courses/${hodId}`);
    return res.data;
  } catch (err) {
    safeResponse(err, "Failed to fetch department courses");
  }
};

export const getDepartmentCoursesSimple = async (hodId) => {
  try {
    const res = await apiClient.get(`/hod/department/courses-simple/${hodId}`);
    return res.data;
  } catch (err) {
    safeResponse(err, "Failed to fetch department courses");
  }
};

export const getProfessorAssignmentsForHOD = async (hodId, professorId) => {
  try {
    const res = await apiClient.get(
      `/hod/department/professor-assignments/${hodId}/${professorId}`
    );
    return res.data;
  } catch (err) {
    safeResponse(err, "Failed to fetch professor assignments");
  }
};

export const getDepartmentStatistics = async (hodId) => {
  try {
    const res = await apiClient.get(`/hod/department/statistics/${hodId}`);
    return res.data;
  } catch (err) {
    safeResponse(err, "Failed to fetch department statistics");
  }
};

export const getProfessorMaterials = async () => {
  try {
    const res = await apiClient.get("/students/materials");
    return res.data;
  } catch (err) {
    safeResponse(err, "Failed to fetch study materials");
  }
};

export const uploadStudyMaterial = async (payload) => {
  try {
    const res = await apiClient.post("/professor/materials", payload);
    return res.data;
  } catch (err) {
    safeResponse(err, "Failed to upload material");
  }
};

export const getProfessorTimetable = async (professorId) => {
  try {
    const res = await apiClient.get(`/professors/${professorId}/timetable`);
    return res.data;
  } catch (err) {
    safeResponse(err, "Failed to fetch professor timetable");
  }
};

export const enterMarks = async (payload) => {
  try {
    const res = await apiClient.post("/professor/marks", payload);
    return res.data;
  } catch (err) {
    safeResponse(err, "Failed to enter marks");
  }
};

// ---------- Student APIs ----------
export const getStudentAttendance = async (studentId) => {
  try {
    const res = await apiClient.get(`/attendance/student/${studentId}`);
    return res.data;
  } catch (err) {
    safeResponse(err, "Failed to fetch attendance");
  }
};

export const submitAssignment = async (payload) => {
  try {
    const res = await apiClient.post("/students/assignments", payload);
    return res.data;
  } catch (err) {
    safeResponse(err, "Failed to submit assignment");
  }
};

export const getStudentMaterials = async () => {
  try {
    const res = await apiClient.get("/students/materials");
    return res.data;
  } catch (err) {
    safeResponse(err, "Failed to fetch study materials");
  }
};

export const getStudentMarks = async (studentId) => {
  try {
    const res = await apiClient.get(`/students/marks/${studentId}`);
    return res.data;
  } catch (err) {
    safeResponse(err, "Failed to fetch marks");
  }
};

export const getStudentTimetable = async (studentId) => {
  try {
    const res = await apiClient.get(`/students/${studentId}/timetable`);
    return res.data;
  } catch (err) {
    safeResponse(err, "Failed to fetch student timetable");
  }
};

export const getStudentExamSchedule = async (studentId) => {
  try {
    const res = await apiClient.get(`/students/${studentId}/exams`);
    return res.data;
  } catch (err) {
    safeResponse(err, "Failed to fetch exam schedule");
  }
};

export const getStudentHallTicket = async (studentId) => {
  try {
    const res = await apiClient.get(`/students/${studentId}/hall-ticket`);
    return res.data;
  } catch (err) {
    safeResponse(err, "Failed to fetch hall ticket");
  }
};

export const requestCertificate = async (studentId, payload) => {
  try {
    const res = await apiClient.post(`/students/${studentId}/certificate-request`, payload);
    return res.data;
  } catch (err) {
    safeResponse(err, "Failed to submit certificate request");
  }
};

export const submitStudentLeave = async (studentId, payload) => {
  try {
    const res = await apiClient.post(`/students/${studentId}/leave-request`, payload);
    return res.data;
  } catch (err) {
    safeResponse(err, "Failed to submit leave request");
  }
};

export const submitProfessorLeave = async (professorId, payload) => {
  try {
    const res = await apiClient.post(`/professors/${professorId}/leave-request`, payload);
    return res.data;
  } catch (err) {
    safeResponse(err, "Failed to submit professor leave request");
  }
};

export const payFees = async (payload) => {
  try {
    const res = await apiClient.post("/students/fees", payload);
    return res.data;
  } catch (err) {
    safeResponse(err, "Fee payment failed");
  }
};

export const getStudentFeeHistory = async (studentId) => {
  try {
    const res = await apiClient.get(`/students/fees/${studentId}`);
    return res.data;
  } catch (err) {
    safeResponse(err, "Failed to fetch fee history");
  }
};


// ---------- HOD Courses & Subjects (placeholders) ----------
export const getCourses = async () => {
  try {
    const res = await apiClient.get("/hod/courses");
    return res.data;
  } catch (err) {
    throw err.response?.data || "Failed to fetch courses";
  }
};

export const createCourse = async (payload) => {
  try {
    const res = await apiClient.post("/hod/courses", payload);
    return res.data;
  } catch (err) {
    throw err.response?.data || "Failed to create course";
  }
};

export const getSubjects = async () => {
  try {
    const res = await apiClient.get("/hod/subjects");
    return res.data;
  } catch (err) {
    throw err.response?.data || "Failed to fetch subjects";
  }
};

export const createSubject = async (payload) => {
  try {
    const res = await apiClient.post("/hod/subjects", payload);
    return res.data;
  } catch (err) {
    throw err.response?.data || "Failed to create subject";
  }
};

// ---------- EXAM SCHEDULE APIs ----------
export const createExamSchedule = async (examScheduleData) => {
  try {
    const res = await apiClient.post("/exam-schedules/create", examScheduleData);
    return res.data;
  } catch (err) {
    throw err.response?.data || "Failed to create exam schedule";
  }
};

export const getAllExamSchedules = async () => {
  try {
    const res = await apiClient.get("/exam-schedules/all");
    return res.data;
  } catch (err) {
    throw err.response?.data || "Failed to fetch exam schedules";
  }
};

export const getExamScheduleById = async (id) => {
  try {
    const res = await apiClient.get(`/exam-schedules/${id}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || "Failed to fetch exam schedule";
  }
};

export const getExamSchedulesByDepartment = async (departmentId) => {
  try {
    const res = await apiClient.get(`/exam-schedules/department/${departmentId}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || "Failed to fetch exam schedules";
  }
};

export const getExamSchedulesByHOD = async (hodId) => {
  try {
    const res = await apiClient.get(`/exam-schedules/hod/${hodId}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || "Failed to fetch exam schedules";
  }
};

export const getUpcomingExams = async (departmentId) => {
  try {
    const res = await apiClient.get(`/exam-schedules/upcoming/department/${departmentId}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || "Failed to fetch upcoming exams";
  }
};

export const getExamSchedulesByDateRange = async (startDate, endDate) => {
  try {
    const res = await apiClient.get(
      `/exam-schedules/date-range?startDate=${startDate}&endDate=${endDate}`
    );
    return res.data;
  } catch (err) {
    throw err.response?.data || "Failed to fetch exam schedules";
  }
};

export const getExamSchedulesByDepartmentAndDateRange = async (
  departmentId,
  startDate,
  endDate
) => {
  try {
    const res = await apiClient.get(
      `/exam-schedules/department/${departmentId}/date-range?startDate=${startDate}&endDate=${endDate}`
    );
    return res.data;
  } catch (err) {
    throw err.response?.data || "Failed to fetch exam schedules";
  }
};

export const searchExamsBySubject = async (subjectName) => {
  try {
    const res = await apiClient.get(`/exam-schedules/search/subject?subjectName=${subjectName}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || "Failed to search exam schedules";
  }
};

export const getExamSchedulesByCourseCode = async (courseCode) => {
  try {
    const res = await apiClient.get(`/exam-schedules/course/${courseCode}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || "Failed to fetch exam schedules";
  }
};

export const updateExamSchedule = async (id, examScheduleData) => {
  try {
    const res = await apiClient.put(`/exam-schedules/update/${id}`, examScheduleData);
    return res.data;
  } catch (err) {
    throw err.response?.data || "Failed to update exam schedule";
  }
};

export const deleteExamSchedule = async (id) => {
  try {
    const res = await apiClient.delete(`/exam-schedules/delete/${id}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || "Failed to delete exam schedule";
  }
};

export const deleteExamScheduleByDepartment = async (departmentId, examScheduleId) => {
  try {
    const res = await apiClient.delete(`/exam-schedules/delete/${departmentId}/${examScheduleId}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || "Failed to delete exam schedule";
  }
};

export const getExamSchedulesByDepartmentName = async (departmentName) => {
  try {
    const res = await apiClient.get(`/exam-schedules/department-name/${departmentName}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || "Failed to fetch exam schedules";
  }
};

export const deleteSubject = async (subjectId) => {
  try {
    await apiClient.delete(`/subjects/${subjectId}`);
  } catch (err) {
    throw err.response?.data || "Failed to delete subject";
  }
};

export const deleteCourse = async (courseId) => {
  try {
    await apiClient.delete(`/hod/courses/${courseId}`);
  } catch (err) {
    throw err.response?.data || "Failed to delete course";
  }
};

// Create a subject and immediately map it to the given course.
// NOTE: backend expects Subject entity shape.
export const createSubjectAndMapToCourse = async ({ courseId, payload }) => {
  try {
    // 1) create subject (HOD expects SubjectDTO)
    const subjectRes = await apiClient.post("/hod/subjects", payload);
    const subject = subjectRes.data;

    // 2) map to course
    await apiClient.post(`/hod/courses/${courseId}/subjects`, { subjectIds: [subject.id] });

    return subject;
  } catch (err) {
    throw err.response?.data || "Failed to create and map subject";
  }
};




export const mapSubjectsToCourse = async (courseId, subjectIds) => {
  try {
    const res = await apiClient.post(`/hod/courses/${courseId}/subjects`, { subjectIds });
    return res.data;
  } catch (err) {
    throw err.response?.data || "Failed to map subjects to course";
  }
};

export const getProfessors = async () => {
  try {
    const res = await apiClient.get("/hod/professors");
    return res.data;
  } catch (err) {
    throw err.response?.data || "Failed to fetch professors";
  }
};

export const assignProfessorToSubject = async (subjectId, professorId) => {
  try {
    const res = await apiClient.post(`/hod/subjects/${subjectId}/assign-professor`, {
      professorId,
    });
    return res.data;
  } catch (err) {
    throw err.response?.data || "Failed to assign professor to subject";
  }
};
