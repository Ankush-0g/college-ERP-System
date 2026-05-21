import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Select,
  Option,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Checkbox,
  Alert,
} from "@material-tailwind/react";
import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

export function HODDashboard() {
  const [hodInfo, setHodInfo] = useState(null);
  const [departmentProfessors, setDepartmentProfessors] = useState([]);
  const [departmentCourses, setDepartmentCourses] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [semesters, setSemesters] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [assignments, setAssignments] = useState([]);

  // Keep a stable HOD id for API calls
  const hodId = (() => {
    try {
      const storedHod = localStorage.getItem("hodData");
      if (!storedHod) return undefined;
      const hodData = JSON.parse(storedHod);
      const rawHodId =
        hodData?.id ??
        hodData?.hodId ??
        hodData?.hod_id ??
        localStorage.getItem("hodId");
      const parsed = rawHodId !== undefined && rawHodId !== null && String(rawHodId).trim() !== ""
        ? Number(rawHodId)
        : undefined;
      return parsed && !Number.isNaN(parsed) ? parsed : undefined;
    } catch {
      return undefined;
    }
  })();



  const [showDialog, setShowDialog] = useState(false);
  const [selectedProfessor, setSelectedProfessor] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fetchingData, setFetchingData] = useState(false);

  const resolveSubjectId = (subject, subjectCatalog = []) => {
    if (!subject) {
      return null;
    }

    // Try to get ID from the subject itself first
    if (subject.id !== undefined && subject.id !== null && String(subject.id).trim() !== "") {
      return subject.id;
    }

    // If subject has subjectId, use it
    if (subject.subjectId !== undefined && subject.subjectId !== null && String(subject.subjectId).trim() !== "") {
      return subject.subjectId;
    }

    // Normalize the subject's identifying attributes
    const subjectName = subject.name?.trim().toLowerCase();
    const subjectCode = subject.code?.trim().toLowerCase();
    const subjectNumber = subject.subjectNumber?.toString().trim();

    // Try to match against the catalog
    const matchedSubject = subjectCatalog.find((item) => {
      if (!item || (item.id === undefined && item.subjectId === undefined) ||
          (item.id === null && item.subjectId === null)) {
        return false;
      }

      const itemName = item.name?.trim().toLowerCase();
      const itemCode = item.code?.trim().toLowerCase();
      const itemNumber = item.subjectNumber?.toString().trim();

      // Match by exact name, code, or subject number
      return (
        (subjectName && itemName && itemName === subjectName) ||
        (subjectCode && itemCode && itemCode === subjectCode) ||
        (subjectNumber && itemNumber && itemNumber === subjectNumber)
      );
    });

    if (matchedSubject) {
      return matchedSubject.id ?? matchedSubject.subjectId ?? null;
    }

    return null;
  };

  const resolveProfessorId = (professor) => {
    if (!professor) {
      return null;
    }

    return professor.id ?? professor.professorId ?? professor.professor_id ?? null;
  };

  const normalizeSubjectOptions = (subjects, subjectCatalog = allSubjects) =>
    (Array.isArray(subjects) ? subjects : [])
      .map((subject) => {
        const resolvedId = resolveSubjectId(subject, subjectCatalog);
        return {
          ...subject,
          id: resolvedId !== null ? resolvedId : subject.id,
        };
      })
      .filter((subject) => subject.id !== null && subject.id !== undefined);

  // Initialize HOD data from localStorage
  useEffect(() => {
        const storedHod = localStorage.getItem("hodData");
    if (storedHod) {
      try {
        const hodData = JSON.parse(storedHod);
        setHodInfo(hodData);

        // hodId must be a real number, otherwise backend URL will break
        // Login response / saved object shape may vary (id, hodId, hod_id, departmentId, etc.)
        const rawHodId =
          hodData?.id ??
          hodData?.hodId ??
          hodData?.hod_id ??
          // login flow sometimes stores hod id separately
          localStorage.getItem("hodId");
        const hodId =
          rawHodId !== undefined && rawHodId !== null && String(rawHodId).trim() !== ""
            ? Number(rawHodId)
            : undefined;

        if (!hodId || Number.isNaN(hodId)) {
          console.error("[HODDashboard] Invalid hodId from localStorage hodData:", hodData);
          setError(
            `Failed to load department: HOD id missing/invalid in localStorage (expected id). Got: ${String(rawHodId)}`
          );
          return;
        }

        fetchDepartmentData(hodId, hodData.departmentName ?? hodData?.department?.name);
      } catch (e) {
        console.error("Error parsing HOD data:", e);
        setError("Failed to load HOD information");
      }
    }
  }, []);

  // Fetch department courses and professors
  const fetchDepartmentData = async (hodId, deptName) => {
    try {
      setFetchingData(true);
      setError("");

      const subjectResponse = await axios.get(`${API_BASE_URL}/hod/subjects`);
      setAllSubjects(Array.isArray(subjectResponse.data) ? subjectResponse.data : []);

      // Get professors for dropdown (HOD-scoped).
      // Backend endpoint is: /api/hod/department/professors/{hodId} (in HODDepartmentController)
      const profResponse = await axios.get(
        `${API_BASE_URL}/hod/department/professors/${hodId}`
      );
      setDepartmentProfessors(profResponse.data || []);




      // Get HOD department courses with SPPU semester mappings
      const courseResponse = await axios.get(
        `${API_BASE_URL}/hod/department/courses/${hodId}`
      );
      if (!hodId) {
        throw new Error("HOD id is missing (hodData.id not found) while fetching department courses");
      }
      const courses = courseResponse.data || [];
      setDepartmentCourses(courses);

      if (!courses || courses.length === 0) {
        setSelectedCourse("");
        setSemesters([]);
        setSubjectOptions([]);
        return;
      }

      if (courses.length > 0) {
        const firstCourse = courses[0];
        const firstCourseId =
          firstCourse.courseId?.toString?.() || firstCourse.id?.toString?.() || "";

        setSelectedCourse(firstCourseId);

        // Set semesters from the first course
        const courseSemesters = Array.isArray(firstCourse.semesters)
          ? firstCourse.semesters
          : [];

        if (courseSemesters.length > 0) {
          const semesterNumbers = courseSemesters
            .map((sem) => sem?.semesterNumber ?? sem?.semester)
            .filter((v) => v !== null && v !== undefined && String(v).trim() !== "")
            .map((v) => String(v));

          setSemesters(semesterNumbers);

          if (firstCourseId && semesterNumbers.length > 0) {
            const firstSemester = semesterNumbers[0];
            setSelectedSemester(firstSemester);

            // Guard: only fetch if course+semester are valid
            await fetchCourseSubjects(firstCourseId, firstSemester, subjectResponse.data || []);
            await fetchAssignments(firstCourseId, firstSemester);
          }
        } else {
          setSemesters([]);
          setSubjectOptions([]);
        }
      } else {
        setSelectedCourse("");
        setSemesters([]);
        setSubjectOptions([]);
      }
    } catch (err) {
      console.error("Error fetching department data:", err);
      setError("Failed to load department data: " + (err.response?.data?.message || err.message));
    } finally {
      setFetchingData(false);
    }
  };

  // Fetch course subjects for a specific semester
  const fetchCourseSubjects = async (courseId, semester, subjectCatalog = allSubjects) => {
    try {
      if (!courseId || !semester) {
        setSubjectOptions([]);
        setSelectedSubjects([]);
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}/hod/courses/${courseId}/semester/${semester}/subjects`
      );
      const data = response.data || [];
      const normalizedSubjects = normalizeSubjectOptions(data, subjectCatalog);
      setSubjectOptions(normalizedSubjects);
      setSelectedSubjects([]);
    } catch (err) {
      console.error("Error fetching course subjects:", err);
      setSubjectOptions([]);
      setSelectedSubjects([]);
      setError("Failed to load subjects: " + (err.response?.data?.message || err.message));
    }
  };

  // Handle course selection
  const handleCourseChange = (courseId) => {
    setSelectedCourse(courseId);
    setSelectedSemester("");
    setSelectedSubjects([]);
    setAssignments([]);

    const course = departmentCourses.find(
      (c) => c.courseId?.toString() === courseId
    );
    
    if (course && course.semesters) {
      const semesterList = course.semesters.map((sem) =>
        sem.semesterNumber?.toString() || sem.semester?.toString()
      );
      setSemesters(semesterList);
      setSubjectOptions([]);
    } else {
      setSemesters([]);
      setSubjectOptions([]);
    }
  };

  // Handle semester selection
  const handleSemesterChange = async (semester) => {
    setSelectedSemester(semester);
    setSelectedSubjects([]);

    if (selectedCourse && semester) {
      await fetchCourseSubjects(selectedCourse, semester);
      await fetchAssignments(selectedCourse, semester);
    } else {
      setSubjectOptions([]);
      setAssignments([]);
    }
  };

  // Fetch existing assignments
  const fetchAssignments = async (courseId, semester) => {
    try {
      if (!courseId || !semester) {
        setAssignments([]);
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}/professor-assignments/course/${courseId}/semester/${semester}`
      );
      setAssignments(response.data || []);
    } catch (err) {
      console.error("Error fetching assignments:", err);
      setAssignments([]);
    }
  };

  // Handle assignment dialog
  const handleAssignClick = () => {
    if (subjectOptions.length === 0) {
      setError("No subjects available for this course and semester");
      return;
    }

    const assignableSubjects = subjectOptions.filter((subject) => subject.id !== null && subject.id !== undefined);

    if (assignableSubjects.length === 0) {
      setError("Subjects are available, but none have valid database IDs. Please ensure course subjects are properly linked in the system.");
      return;
    }
    setSelectedProfessor("");
    setSelectedSubjects([]);
    setShowDialog(true);
  };

  // Toggle subject selection
  const handleSubjectToggle = (subjectId) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((s) => s !== subjectId)
        : [...prev, subjectId]
    );
  };

  // Submit assignment
  const handleAssignSubjects = async () => {
    if (!selectedProfessor) {
      setError("Please select a professor");
      return;
    }
    
    if (selectedSubjects.length === 0) {
      setError("Please select at least one subject");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const professor = departmentProfessors.find(
        (p) => resolveProfessorId(p)?.toString() === selectedProfessor
      );
      
      if (!professor) {
        setError("Professor not found");
        setLoading(false);
        return;
      }

      const professorId = resolveProfessorId(professor);
      if (professorId === null || professorId === undefined || String(professorId).trim() === "") {
        setError("Selected professor does not have a valid database ID");
        setLoading(false);
        return;
      }

      const subjectIds = selectedSubjects
        .map((subj) => Number(subj))
        .filter((subj) => !Number.isNaN(subj));

      if (subjectIds.length === 0) {
        setError("Please select subjects that have valid database IDs");
        setLoading(false);
        return;
      }

      const request = {
        professorId,
        courseId: parseInt(selectedCourse, 10),
        semester: selectedSemester,
        subjectIds: subjectIds,
      };

      await axios.post(
        `${API_BASE_URL}/professor-assignments/assign?hodId=${hodId}`,
        request
      );

      setSuccess(`Successfully assigned subjects to ${professor.name}`);
      setShowDialog(false);
      setSelectedSubjects([]);
      await fetchAssignments(selectedCourse, selectedSemester);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error assigning subjects:", err);
      const errorMsg = err.response?.data?.message || err.response?.data || err.message || "Failed to assign subjects";
      setError(typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  // Delete assignment
  const handleDeleteAssignment = async (assignmentId) => {
    if (window.confirm("Are you sure you want to delete this assignment?")) {
      try {
        await axios.delete(
          `${API_BASE_URL}/professor-assignments/${assignmentId}`
        );
        setSuccess("Assignment deleted successfully");
        await fetchAssignments(selectedCourse, selectedSemester);
        setTimeout(() => setSuccess(""), 3000);
      } catch (err) {
        console.error("Error deleting assignment:", err);
        setError("Failed to delete assignment: " + (err.response?.data?.message || err.message));
      }
    }
  };

  if (fetchingData) {
    return (
      <div className="m-8 flex justify-center items-center min-h-screen">
        <Typography variant="h5" color="blue-gray">
          Loading department data...
        </Typography>
      </div>
    );
  }

  return (
    <div className="m-8">
      <Card className="border border-blue-gray-100 shadow-sm">
        <CardHeader variant="gradient" color="blue" className="mb-6 p-6">
          <Typography variant="h4" color="white">
            Subject Assignment Management
          </Typography>
          <Typography variant="small" color="white" className="opacity-80 mt-2">
            {hodInfo
              ? `Department: ${hodInfo.departmentName}`
              : "Manage subject assignments for professors"}
          </Typography>
        </CardHeader>

        <CardBody className="px-6 py-8">
          {error && (
            <Alert color="red" className="mb-4" onClose={() => setError("")}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert color="green" className="mb-4" onClose={() => setSuccess("")}>
              {success}
            </Alert>
          )}

          {/* Course and Semester Selection */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Select Course
              </label>
              <Select
                value={selectedCourse}
                onChange={(value) => handleCourseChange(value)}
              >
                <Option value="">Choose a course</Option>
                {departmentCourses.map((course) => (
                  <Option key={course.courseId} value={course.courseId?.toString() || ""}>
                    {course.courseName || course.courseCode}
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Select Semester
              </label>
              <Select
                value={selectedSemester}
                onChange={(value) => handleSemesterChange(value)}
                disabled={!selectedCourse || semesters.length === 0}
              >
                <Option value="">Choose a semester</Option>
                {semesters.map((sem) => (
                  <Option key={sem} value={sem}>
                    Semester {sem}
                  </Option>
                ))}

              </Select>
            </div>

            <div className="flex items-end">
              <Button
                color="blue"
                onClick={handleAssignClick}
                disabled={!selectedCourse || !selectedSemester || loading}
                className="w-full"
              >
                + Assign Subjects
              </Button>
            </div>
          </div>

          {/* Subjects Display */}
          {selectedCourse && selectedSemester && subjectOptions.length > 0 && (
            <div className="mb-8">
              <Typography variant="h6" className="mb-4 text-blue-gray-900">
                Available Subjects ({subjectOptions.length})
              </Typography>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {subjectOptions.map((subject) => (
                  <div
                    key={subject.id}
                    className="rounded-lg border border-blue-gray-200 bg-blue-gray-50 p-3"
                  >
                    <Typography variant="small" className="font-medium text-blue-gray-900">
                      {subject.name || subject.code}
                    </Typography>
                    {subject.code && (
                      <Typography variant="tiny" color="gray">
                        Code: {subject.code}
                      </Typography>
                    )}
                    {subject.credits && (
                      <Typography variant="tiny" color="gray">
                        Credits: {subject.credits}
                      </Typography>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Subjects Message */}
          {selectedCourse && selectedSemester && subjectOptions.length === 0 && (
            <div className="mb-8 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <Typography color="blue-gray" className="text-center">
                No subjects found for this course and semester combination
              </Typography>
            </div>
          )}

          {/* Assignments Display */}
          {selectedCourse && selectedSemester && assignments.length > 0 && (
            <div>
              <Typography variant="h6" className="mb-4 text-blue-gray-900">
                Current Assignments for this Semester
              </Typography>
              <div className="grid gap-4">
                {assignments.map((assignment) => (
                  <Card
                    key={assignment.id}
                    className="border border-blue-gray-100 bg-white shadow-sm"
                  >
                    <CardBody className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Typography variant="h6" className="text-blue-gray-900">
                            {assignment.professorName}
                          </Typography>
                          <Typography
                            variant="small"
                            className="text-blue-gray-600 mt-2"
                          >
                            Subjects ({assignment.subjectNames?.length || 0}):
                          </Typography>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {assignment.subjectNames?.map((subject, idx) => (
                              <span
                                key={idx}
                                className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800"
                              >
                                {subject}
                              </span>
                            ))}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          color="red"
                          variant="outlined"
                          onClick={() => handleDeleteAssignment(assignment.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {selectedCourse && selectedSemester && assignments.length === 0 && subjectOptions.length > 0 && (
            <div className="text-center py-8">
              <Typography color="gray" className="mb-4">
                No assignments yet for this semester. Click "Assign Subjects" to get started.
              </Typography>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Assignment Dialog */}
      <Dialog open={showDialog} handler={() => setShowDialog(false)} size="md">
        <DialogHeader>Assign Subjects to Professor</DialogHeader>
        <DialogBody className="px-6 py-8">
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Select Professor
            </label>
            <Select
              value={selectedProfessor}
              onChange={(value) => setSelectedProfessor(value)}
            >
              <Option value="">Choose a professor</Option>
              {departmentProfessors.map((prof) => (
                <Option key={resolveProfessorId(prof)} value={resolveProfessorId(prof)?.toString() || ""}>
                  {prof.name || prof.username || prof.professorId}
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium text-gray-700">
              Select Subjects to Assign ({selectedSubjects.length} selected)
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto border border-blue-gray-200 rounded-lg p-3">
              {subjectOptions.length > 0 ? (
                subjectOptions.map((subject) => (
                  <div key={subject.id ?? subject.code ?? subject.name} className="flex items-center">
                    <Checkbox
                      label={`${subject.name || subject.code}${subject.id === null ? " (not assignable yet)" : ""}`}
                      disabled={subject.id === null}
                      checked={selectedSubjects.includes(subject.id?.toString())}
                      onChange={() => {
                        if (subject.id !== null) {
                          handleSubjectToggle(subject.id?.toString());
                        }
                      }}
                    />
                  </div>
                ))
              ) : (
                <Typography variant="small" color="gray">
                  No subjects available for assignment
                </Typography>
              )}
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={() => setShowDialog(false)}
            className="mr-1"
          >
            Cancel
          </Button>
          <Button
            variant="gradient"
            color="blue"
            onClick={handleAssignSubjects}
            loading={loading}
            disabled={loading || !selectedProfessor || selectedSubjects.length === 0}
          >
            Assign
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default HODDashboard;
