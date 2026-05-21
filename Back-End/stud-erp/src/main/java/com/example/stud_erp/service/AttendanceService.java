package com.example.stud_erp.service;

import com.example.stud_erp.entity.Attendance;
import com.example.stud_erp.entity.ClassSession;
import com.example.stud_erp.entity.Professor;
import com.example.stud_erp.entity.Semester;
import com.example.stud_erp.entity.Student;
import com.example.stud_erp.entity.Subject;
import com.example.stud_erp.payload.ProfessorAttendanceEligibilityDTO;
import com.example.stud_erp.repository.AttendanceRepository;
import com.example.stud_erp.repository.ClassRepository;
import com.example.stud_erp.repository.ProfessorRepository;
import com.example.stud_erp.repository.SemesterRepository;
import com.example.stud_erp.repository.StudentRepository;
import com.example.stud_erp.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    @Autowired
    private ClassRepository classSessionRepository;

    @Autowired
    private AttendanceRepository attendanceRecordRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ProfessorRepository professorRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private SemesterRepository semesterRepository;

    public ClassSession saveAttendance(String lecturer, String subject, LocalDate attendanceDate, LocalTime time, Map<String, String> students) {
        // Current payload uses lecturer as a string (likely professor username). Resolve professor.
        Professor resolvedProfessor = professorRepository.findByUsername(lecturer);
        if (resolvedProfessor == null) {
            // fallback if lecturer is actually professorId
            resolvedProfessor = professorRepository.findByProfessorId(lecturer);
        }
        if (resolvedProfessor == null) {
            throw new IllegalArgumentException("Invalid professor/lecturer: " + lecturer);
        }

        // Authorization (best-effort with current schema): subject must be in professor.subjects.
        List<String> assignedSubjectNames = resolvedProfessor.getSubjects() == null ? List.of() : resolvedProfessor.getSubjects();
        boolean allowedSubject = assignedSubjectNames.stream().anyMatch(s -> s != null && s.equalsIgnoreCase(subject));
        if (!allowedSubject) {
            throw new IllegalArgumentException("Professor is not assigned to subject: " + subject);
        }

        ClassSession classSession = new ClassSession();
        classSession.setLecturer(lecturer);
        classSession.setSubject(subject);
        classSession.setTime(time);

        List<Attendance> attendanceRecords = new ArrayList<>();

        for (Map.Entry<String, String> entry : students.entrySet()) {
            Attendance record = new Attendance();
            record.setStudentName(entry.getKey());
            record.setStatus(entry.getValue());
            record.setAttendanceDate(attendanceDate);
            record.setClassSession(classSession);

            Student stud = studentRepository.findByStudName(entry.getKey());
            if (stud == null) {
                throw new IllegalArgumentException("Student not found: " + entry.getKey());
            }

            // Department restriction proxy
            String dept = resolvedProfessor.getDepartmentName();
            if (dept != null && stud.getMajor() != null && !stud.getMajor().equalsIgnoreCase(dept)) {
                throw new IllegalArgumentException("Student not eligible for this department");
            }

            record.setStudent(stud);
            attendanceRecords.add(record);
        }

        classSession.setAttendance(attendanceRecords);
        return classSessionRepository.save(classSession);
    }



    public Map<LocalDate, List<Attendance>> getAttendanceByLecturerAndSubject(String lecturer, String subject) {
        List<Attendance> records = attendanceRecordRepository.findByClassSessionLecturerAndClassSessionSubject(lecturer, subject);
        return records.stream().collect(Collectors.groupingBy(Attendance::getAttendanceDate));
    }

    /**
     * Returns only:
     * - subjects assigned to this professor (best-effort)
     * - students who are registered in semesters that include those subjects
     * - and also restricted to the professor's department
     *
     * NOTE: This project currently stores assigned subjects in two places:
     * - ProfessorAssignment.subjectIds
     * - Professor.subjects (string names)
     *
     * For correctness and minimal disruption, we keep using Professor.subjects for now,
     * while the next step will harden eligibility and attendance save based on ProfessorAssignment.
     */
    public ProfessorAttendanceEligibilityDTO getProfessorEligibility(String professorId) {
        // Frontend may pass either the custom professor_id (string) or the numeric primary key (id).
        Professor professor = professorRepository.findByProfessorId(professorId);

        if (professor == null) {
            // Fallback to numeric primary key lookup
            try {
                Long pid = Long.valueOf(professorId);
                professor = professorRepository.findById(pid).orElse(null);
            } catch (NumberFormatException ignored) {
                // keep professor as null
            }
        }

        if (professor == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.NOT_FOUND,
                    "Professor not found for id: " + professorId
            );
        }


        String departmentName = professor.getDepartmentName();

        // Subjects are stored as names in professor.subjects
        List<String> assignedSubjectNames = professor.getSubjects() == null ? List.of() : professor.getSubjects();

        // Deduplicate while keeping order
        Set<String> dedupedAssignedSubjects = new LinkedHashSet<>(assignedSubjectNames);

        // Build eligible students from semesters that contain any of the assigned subjects.
        Set<Long> studentIds = new LinkedHashSet<>();
        Map<Long, String> studentIdToName = new LinkedHashMap<>();

        List<Semester> allSemesters = semesterRepository.findAll();

        for (Semester semester : allSemesters) {
            Student semStudent = semester.getStudent();
            if (semStudent == null) continue;

            if (departmentName != null && !departmentName.isBlank()) {
                if (semStudent.getMajor() == null || !semStudent.getMajor().equalsIgnoreCase(departmentName)) {
                    continue;
                }
            }

            Set<Subject> semSubjects = semester.getSubjects();
            if (semSubjects == null || semSubjects.isEmpty()) continue;

            boolean matchesAnyAssignedSubject = semSubjects.stream()
                    .anyMatch(s -> s.getName() != null && dedupedAssignedSubjects.contains(s.getName()));

            if (!matchesAnyAssignedSubject) continue;

            Long sid = semStudent.getId();
            if (sid != null && studentIds.add(sid)) {
                studentIdToName.put(sid, semStudent.getStudName());
            }
        }

        ProfessorAttendanceEligibilityDTO dto = new ProfessorAttendanceEligibilityDTO();
        dto.setDepartmentName(departmentName);
        dto.setSubjects(new ArrayList<>(dedupedAssignedSubjects));

        List<ProfessorAttendanceEligibilityDTO.StudentAttendanceEligibilityRowDTO> rows = new ArrayList<>();
        for (Long sid : studentIds) {
            ProfessorAttendanceEligibilityDTO.StudentAttendanceEligibilityRowDTO row = new ProfessorAttendanceEligibilityDTO.StudentAttendanceEligibilityRowDTO();
            row.setStudentId(sid);
            row.setStudentName(studentIdToName.get(sid));
            rows.add(row);
        }

        dto.setStudents(rows);
        return dto;
    }

    public List<Attendance> markAttendance(Long professorId, Long subjectId, LocalDate attendanceDate,
                                          Map<Long, Boolean> studentAttendance, String remarks) {
        Professor professor = professorRepository.findById(professorId)
                .orElseThrow(() -> new RuntimeException("Professor not found"));

        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        List<Attendance> records = new ArrayList<>();

        for (Map.Entry<Long, Boolean> entry : studentAttendance.entrySet()) {
            Student student = studentRepository.findById(entry.getKey())
                    .orElse(null);

            if (student == null) continue;

            Attendance attendance = new Attendance();
            attendance.setStudent(student);
            attendance.setStudentName(student.getStudName());
            attendance.setProfessor(professor);
            attendance.setSubject(subject);
            attendance.setAttendanceDate(attendanceDate);
            attendance.setIsPresent(entry.getValue());
            attendance.setStatus(entry.getValue() ? "p" : "a");
            attendance.setRemarks(remarks);

            records.add(attendanceRecordRepository.save(attendance));
        }

        return records;
    }

    public List<Attendance> getStudentAttendanceBySubject(Long studentId, Long subjectId) {
        return attendanceRecordRepository.findByStudentIdAndSubjectId(studentId, subjectId);
    }

    public List<Attendance> getStudentSubjectAttendance(Long studentId, Long subjectId) {
        return attendanceRecordRepository.findByStudentIdAndSubjectIdOrderByAttendanceDateDesc(studentId, subjectId);
    }

    public List<Attendance> getStudentAllAttendance(Long studentId) {
        return attendanceRecordRepository.findByStudentIdOrderByAttendanceDateDesc(studentId);
    }

}

