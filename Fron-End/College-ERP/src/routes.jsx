import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  EnvelopeIcon,
  PencilIcon,
} from "@heroicons/react/24/solid";
import { lazy, Suspense } from "react";

const HODHome = lazy(() => import("@/pages/dashboard/hod/Home"));
const HODProfile = lazy(() => import("@/pages/dashboard/hod/Profile"));
const Email = lazy(() => import("@/components/email/MailSender"));
const HODSemesterTable = lazy(() =>
  import("@/pages/dashboard/hod/SemesterTable")
);
const HODNotifications = lazy(() =>
  import("@/pages/dashboard/hod/Notifications")
);
const HODManageDepartments = lazy(() =>
  import("@/pages/dashboard/hod/ManageDepartments")
);
const HODManageCourses = lazy(() => import("@/pages/dashboard/hod/ManageCourses"));
const HODAssignProfessors = lazy(() =>
  import("@/pages/dashboard/hod/AssignProfessors")
);
const HODApproveLeaves = lazy(() => import("@/pages/dashboard/hod/ApproveLeaves"));
const HODDepartmentReports = lazy(() =>
  import("@/pages/dashboard/hod/DepartmentReports")
);
const HODTimetable = lazy(() =>
  import("@/pages/dashboard/hod/TimetableManagement")
);
const HODExamScheduling = lazy(() => import("@/pages/dashboard/hod/ExamScheduling"));
const HODNotices = lazy(() => import("@/pages/dashboard/hod/Notices"));
const HODViewUsers = lazy(() => import("@/pages/dashboard/hod/ViewUsers"));
const HODExportReports = lazy(() => import("@/pages/dashboard/hod/ExportReports"));
const HODDashboard = lazy(() => import("@/pages/dashboard/hod/HODDashboard"));

const ProfessorHome = lazy(() => import("@/pages/dashboard/professor/Home"));
const ProfessorProfile = lazy(() =>
  import("@/pages/dashboard/professor/Profile")
);
const ProfessorNotifications = lazy(() =>
  import("@/pages/dashboard/professor/Notifications")
);


const ProfessorAssignments = lazy(() => import("@/pages/dashboard/professor/Assignments"));
const ProfessorStudyMaterials = lazy(() => import("@/pages/dashboard/professor/StudyMaterials"));
const ProfessorMarks = lazy(() => import("@/pages/dashboard/professor/Marks"));
const ProfessorTimetable = lazy(() => import("@/pages/dashboard/professor/Timetable"));
const ProfessorLeaveApplication = lazy(() => import("@/pages/dashboard/professor/LeaveApplication"));
const ProfessorMessaging = lazy(() => import("@/pages/dashboard/professor/Messaging"));
const ProfessorOnlineLectures = lazy(() => import("@/pages/dashboard/professor/OnlineLectures"));
const ProfessorPerformance = lazy(() =>
  import("@/pages/dashboard/professor/PerformanceAnalytics")
);
const ProfessorDashboard = lazy(() => import("@/pages/dashboard/professor/ProfessorDashboard"));
const ProfessorAttendance = lazy(() => import("@/pages/dashboard/professor/ProfessorAttendance"));

const AttendancePage = lazy(() =>
  import("@/pages/dashboard/professor/Attendance/AttendanceFlow")
);
const ProfessorExamSchedule = lazy(() =>
  import("@/pages/dashboard/professor/ExamSchedule")
);

const StudentSemesterTable = lazy(() =>
  import("@/pages/dashboard/student/SemesterTable")
);

const StudentAttendance = lazy(() => import("@/pages/dashboard/student/Attendance"));
const StudentTimetable = lazy(() => import("@/pages/dashboard/student/Timetable"));
const StudentHome = lazy(() => import("@/pages/dashboard/student/Home"));
const StudentProfile = lazy(() => import("@/pages/dashboard/student/Profile"));
const StudentNotifications = lazy(() => import("@/pages/dashboard/student/Notifications"));
const StudentMaterials = lazy(() => import("@/pages/dashboard/student/Materials"));
const StudentSubmitAssignment = lazy(() => import("@/pages/dashboard/student/SubmitAssignment"));
const StudentExamSchedule = lazy(() => import("@/pages/dashboard/student/ExamSchedule"));
const StudentHallTicket = lazy(() => import("@/pages/dashboard/student/HallTicket"));
const StudentMarks = lazy(() => import("@/pages/dashboard/student/Marks"));
const StudentFeePayment = lazy(() => import("@/pages/dashboard/student/FeePayment"));
const StudentLeaveApplication = lazy(() => import("@/pages/dashboard/student/LeaveApplication"));
const StudentCertificateRequest = lazy(() => import("@/pages/dashboard/student/CertificateRequest"));
const StudentMessaging = lazy(() => import("@/pages/dashboard/student/Messaging"));
const StudentAttendanceView = lazy(() => import("@/pages/dashboard/student/StudentAttendanceView"));

const HODSignIn = lazy(() => import("@/pages/auth/hod/HODSignIn"));
const HODSignUp = lazy(() => import("@/pages/auth/hod/HODSignUp"));

const ProfessorSignIn = lazy(() =>
  import("@/pages/auth/professor/ProfessorSignIn")
);
const ProfessorSignUp = lazy(() =>
  import("@/pages/auth/professor/ProfessorSignUp")
);

const StudentSignIn = lazy(() => import("@/pages/auth/student/StudentSignIn"));
const StudentSignUp = lazy(() => import("@/pages/auth/student/StudentSignUp"));

const ForgotPasswordFlow = lazy(() =>
  import("./pages/forgotPassword/ForgotPasswordFlow")
);

const icon = {
  className: "w-5 h-5 text-inherit",
};

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="relative">
      <div className="h-24 w-24 rounded-full border-t-8 border-b-8 border-gray-200"></div>
      <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-8 border-b-8 border-blue-500 animate-spin"></div>
    </div>
  </div>
);

export const routes = [
  // HOD Dashboard Routes
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "HOD dashboard",
        path: "/hod/home",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <HODHome />
          </Suspense>
        ),
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "HOD Information",
        path: "/hod/information",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <HODProfile />
          </Suspense>
        ),
      },

      {
        icon: <UserCircleIcon {...icon} />,
        name: "Subject Assignment",
        path: "/hod/subject-assignment",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <HODDashboard />
          </Suspense>
        ),
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "HOD notifications",
        path: "/hod/notifications",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <HODNotifications />
          </Suspense>
        ),
      },

      {
        icon: <TableCellsIcon {...icon} />,
        name: "Manage Departments",
        path: "/hod/manage-departments",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <HODManageDepartments />
          </Suspense>
        ),
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "Manage Courses & Subjects",
        path: "/hod/manage-courses",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <HODManageCourses />
          </Suspense>
        ),
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "Assign Professors",
        path: "/hod/assign-professors",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <HODAssignProfessors />
          </Suspense>
        ),
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "Approve Leaves",
        path: "/hod/approve-leaves",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <HODApproveLeaves />
          </Suspense>
        ),
      },
      {
        icon: <ServerStackIcon {...icon} />,
        name: "Department Reports",
        path: "/hod/department-reports",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <HODDepartmentReports />
          </Suspense>
        ),
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "Timetable Management",
        path: "/hod/timetable",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <HODTimetable />
          </Suspense>
        ),
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "Exam Scheduling",
        path: "/hod/exam-scheduling",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <HODExamScheduling />
          </Suspense>
        ),
      },
      {
        icon: <EnvelopeIcon {...icon} />,
        name: "Notices",
        path: "/hod/notices",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <HODNotices />
          </Suspense>
        ),
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "View All Users",
        path: "/hod/users",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <HODViewUsers />
          </Suspense>
        ),
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "Export Reports",
        path: "/hod/export-reports",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <HODExportReports />
          </Suspense>
        ),
      },
    ],
  },
  // Professor Dashboard Routes
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "Professor dashboard",
        path: "/professor/home",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProfessorHome />
          </Suspense>
        ),
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "Professor Information",
        path: "/professor/information",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProfessorProfile />
          </Suspense>
        ),
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "Professor notifications",
        path: "/professor/notifications",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProfessorNotifications />
          </Suspense>
        ),
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "My Workload",
        path: "/professor/workload",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProfessorDashboard />
          </Suspense>
        ),
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "Mark Subject Attendance",
        path: "/professor/subject-attendance",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProfessorAttendance />
          </Suspense>
        ),
      },
      {
        icon: <PencilIcon {...icon} />,
        name: "Student Attendence",
        path: "/professor/Attendence",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AttendancePage />
          </Suspense>
        ),
      },

      {
        icon: <EnvelopeIcon {...icon} />,
        name: "Assignments",
        path: "/professor/assignments",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProfessorAssignments />
          </Suspense>
        ),
      },
      {
        icon: <ServerStackIcon {...icon} />,
        name: "Study Materials",
        path: "/professor/materials",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProfessorStudyMaterials />
          </Suspense>
        ),
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "Marks & Mark Sheets",
        path: "/professor/marks",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProfessorMarks />
          </Suspense>
        ),
      },
      {
        icon: <HomeIcon {...icon} />,
        name: "Timetable",
        path: "/professor/timetable",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProfessorTimetable />
          </Suspense>
        ),
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "Apply for Leave",
        path: "/professor/leave",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProfessorLeaveApplication />
          </Suspense>
        ),
      },
      {
        icon: <EnvelopeIcon {...icon} />,
        name: "Messaging",
        path: "/professor/messaging",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProfessorMessaging />
          </Suspense>
        ),
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "Online Lectures",
        path: "/professor/lectures",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProfessorOnlineLectures />
          </Suspense>
        ),
      },
      {
        icon: <ServerStackIcon {...icon} />,
        name: "Performance Analytics",
        path: "/professor/performance",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProfessorPerformance />
          </Suspense>
        ),
      },
    ],
  },
  // Student Dashboard Routes
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "Student dashboard",
        path: "/student/home",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <StudentHome />
          </Suspense>
        ),
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "Student Information",
        path: "/student/information",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <StudentProfile />
          </Suspense>
        ),
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "Student notifications",
        path: "/student/notifications",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <StudentNotifications />
          </Suspense>
        ),
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "Student Semester Table",
        path: "/student/semestertable",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <StudentSemesterTable />
          </Suspense>
        ),
      },
      {
        icon: <HomeIcon {...icon} />,
        name: "View Attendance",
        path: "/student/attendance",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <StudentAttendanceView />
          </Suspense>
        ),
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "Timetable",
        path: "/student/timetable",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <StudentTimetable />
          </Suspense>
        ),
      },
      {
        icon: <ServerStackIcon {...icon} />,
        name: "Study Materials",
        path: "/student/materials",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <StudentMaterials />
          </Suspense>
        ),
      },
      {
        icon: <EnvelopeIcon {...icon} />,
        name: "Submit Assignments",
        path: "/student/submit-assignment",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <StudentSubmitAssignment />
          </Suspense>
        ),
      },
      {
        icon: <PencilIcon {...icon} />,
        name: "Exam Schedule",
        path: "/student/exams",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <StudentExamSchedule />
          </Suspense>
        ),
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "Hall Ticket",
        path: "/student/hall-ticket",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <StudentHallTicket />
          </Suspense>
        ),
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "Marks & GPA",
        path: "/student/marks",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <StudentMarks />
          </Suspense>
        ),
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "Fee Payment",
        path: "/student/fees",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <StudentFeePayment />
          </Suspense>
        ),
      },
      {
        icon: <ServerStackIcon {...icon} />,
        name: "Leave Application",
        path: "/student/leave",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <StudentLeaveApplication />
          </Suspense>
        ),
      },
      {
        icon: <EnvelopeIcon {...icon} />,
        name: "Certificate Requests",
        path: "/student/certificates",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <StudentCertificateRequest />
          </Suspense>
        ),
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "Messaging",
        path: "/student/messaging",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <StudentMessaging />
          </Suspense>
        ),
      },
    ],
  },
  // Auth Routes
  {
    title: "auth pages",
    layout: "auth",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "Student sign-in",
        path: "student/sign-in",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <StudentSignIn />
          </Suspense>
        ),
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "Student sign-up",
        path: "student/sign-up",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <StudentSignUp />
          </Suspense>
        ),
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "forgot password",
        path: "/forgot-password",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ForgotPasswordFlow />
          </Suspense>
        ),
      },
      {
        icon: <ServerStackIcon {...icon} />,
        name: "Professor sign-in",
        path: "professor/sign-in",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProfessorSignIn />
          </Suspense>
        ),
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "Professor sign-up",
        path: "professor/sign-up",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProfessorSignUp />
          </Suspense>
        ),
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "HOD sign-in",
        path: "hod/sign-in",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <HODSignIn />
          </Suspense>
        ),
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "HOD sign-up",
        path: "hod/sign-up",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <HODSignUp />
          </Suspense>
        ),
      },
    ],
  },
];

export default routes;
