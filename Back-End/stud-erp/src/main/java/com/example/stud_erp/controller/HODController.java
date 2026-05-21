package com.example.stud_erp.controller;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.stud_erp.entity.Course;
import com.example.stud_erp.entity.Department;
import com.example.stud_erp.entity.Professor;
import com.example.stud_erp.entity.Semester;
import com.example.stud_erp.entity.Subject;
import com.example.stud_erp.payload.NotificationDTO;
import com.example.stud_erp.payload.ProfessorDTO;
import com.example.stud_erp.payload.SemesterDTO;
import com.example.stud_erp.payload.SubjectDTO;
import com.example.stud_erp.payload.CourseDTO;
import com.example.stud_erp.repository.SemesterRepository;
import com.example.stud_erp.repository.SubjectRepository;
import com.example.stud_erp.service.CourseService;
import com.example.stud_erp.service.DepartmentService;
import com.example.stud_erp.service.EmailService;
import com.example.stud_erp.service.NotificationService;
import com.example.stud_erp.service.ProfessorService;
import com.example.stud_erp.service.SubjectService;


@RestController
@RequestMapping("/api/hod")
public class HODController {

    @Autowired
    private DepartmentService departmentService;

    @Autowired
    private CourseService courseService;

    @Autowired
    private SubjectService subjectService;

    @Autowired
    private ProfessorService professorService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private SemesterRepository semesterRepository;


    private final AtomicLong timetableSequence = new AtomicLong(1);
    private final List<HodTimetableEntry> timetableEntries = new ArrayList<>();

    @GetMapping("/departments")
    public ResponseEntity<List<Department>> getDepartments() {
        return ResponseEntity.ok(departmentService.getAllDepartments());
    }

    @PostMapping("/departments")
    public ResponseEntity<Department> createDepartment(@RequestBody Department department) {
        return ResponseEntity.ok(departmentService.saveDepartment(department));
    }

    @GetMapping("/courses")
    public ResponseEntity<List<Course>> getCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @PostMapping("/courses")
    public ResponseEntity<Course> createCourse(@RequestBody Course course) {
        return ResponseEntity.ok(courseService.addCourse(course));
    }

    @DeleteMapping("/courses/{courseId}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long courseId) {
        Course course = courseService.getCourseById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found: " + courseId));

        List<Subject> subjects = subjectRepository.findByCourseId(courseId);
        if (!subjects.isEmpty()) {
            subjects.forEach(subject -> subject.setCourse(null));
            subjectRepository.saveAll(subjects);
        }

        courseService.deleteCourse(courseId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/courses/{courseId}/subjects")
    public ResponseEntity<List<Subject>> mapSubjectsToCourse(
            @PathVariable Long courseId,
            @RequestBody SubjectMapRequest request) {
        Course course = courseService.getCourseById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found: " + courseId));

        List<Subject> subjects = subjectRepository.findAllById(request.subjectIds != null ? request.subjectIds : List.of());
        subjects.forEach(subject -> {
            subject.setCourse(course);
            subjectService.addSubject(subject);
        });

        return ResponseEntity.ok(subjects);
    }

    @GetMapping("/subjects")
    public ResponseEntity<List<SubjectDTO>> getSubjects() {
        List<Subject> subjects = subjectRepository.findAllWithCourseAndAssignedProfessor();
        List<SubjectDTO> dtos = subjects.stream()
                .map(this::mapSubjectToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    private SubjectDTO mapSubjectToDTO(Subject subject) {
        SubjectDTO dto = new SubjectDTO();
        dto.setId(subject.getId());
        dto.setCode(subject.getCode());
        dto.setName(subject.getName());
        dto.setCredits(subject.getCredits());
        dto.setGrade(subject.getGrade());
        dto.setCt1(subject.getCt1());
        dto.setCt2(subject.getCt2());
        dto.setTheory(subject.getTheory());

        if (subject.getSemester() != null) {
            SemesterDTO semDTO = new SemesterDTO();
            semDTO.setId(subject.getSemester().getId());
            semDTO.setSemester(subject.getSemester().getSemester());
            dto.setSemester(semDTO);
        }

        if (subject.getCourse() != null) {
            CourseDTO courseDTO = new CourseDTO();
            courseDTO.setId(subject.getCourse().getId());
            courseDTO.setName(subject.getCourse().getName());
            courseDTO.setCode(subject.getCourse().getCode());
            dto.setCourse(courseDTO);
        }

        if (subject.getAssignedProfessor() != null) {
            ProfessorDTO profDTO = new ProfessorDTO();
            profDTO.setId(subject.getAssignedProfessor().getId());
            profDTO.setName(subject.getAssignedProfessor().getName());
            dto.setAssignedProfessor(profDTO);
        }

        return dto;
    }



    @GetMapping("/courses/{courseId}/semester/{semester}/subjects")
    public ResponseEntity<List<SubjectDTO>> getSubjectsForCourseSemester(
            @PathVariable Long courseId,
            @PathVariable String semester) {

        // Auto-initialize subjects from official SPPU syllabus mapping.
        // Frontend passes semester as String (e.g., "1").
        int semesterNumber;
        try {
            semesterNumber = Integer.parseInt(semester.trim());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(List.of());
        }

        // Resolve course from DB
        Course course = courseService.getCourseById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found: " + courseId));

        // IMPORTANT:
        // Frontend assigns professors using `subjectIds` (Long) -> backend validates they exist.
        // So this endpoint must return real SubjectDTO.id values from DB.

        // Use SPPU syllabus config to get the expected subject names for this course+semester,
        // then map those names to actual Subject rows in DB.
        String courseCode = course.getCode();
        List<String> subjectNames = com.example.stud_erp.config.SPPUSyllabusConfig
                .getSubjectsForCourseSemester(courseCode, semesterNumber);

        // Fetch all subjects in DB for this course+semester and match by name.
        // (Semester is stored as Semester.semesterNumber in DB, while this endpoint receives semester as String.)
        List<Subject> subjectsInDb = subjectRepository.findByCourseSemester(courseId, String.valueOf(semesterNumber));

        // Build DTOs in the same order as syllabus list.
        // AUTO-CREATE missing subjects to ensure all have valid IDs
        List<SubjectDTO> subjectDTOs = subjectNames.stream()
                .map(subjectName -> {
                    Subject matched = subjectsInDb.stream()
                            .filter(s -> s.getName() != null && s.getName().equalsIgnoreCase(subjectName))
                            .findFirst()
                            .orElse(null);

                    // If subject doesn't exist, AUTO-CREATE it with proper mappings
                    if (matched == null) {
                        System.out.println("[HODController] Auto-creating Subject in DB for courseId=" + courseId +
                                " semester=" + semesterNumber + " name='" + subjectName + "'.");

                        Subject newSubject = new Subject();
                        newSubject.setName(subjectName);
                        newSubject.setCode(generateSubjectCode(subjectName));
                        newSubject.setCredits(4);
                        newSubject.setGrade("B");
                        newSubject.setCt1(20);
                        newSubject.setCt2(20);
                        newSubject.setTheory(60);
                        newSubject.setCourse(course);

                        // Try to resolve semester
                        try {
                            Semester semesterObj = semesterRepository.findBySemester(String.valueOf(semesterNumber));
                            if (semesterObj != null) {
                                newSubject.setSemester(semesterObj);
                            }
                        } catch (Exception e) {
                            // Semester might not be found, but that's okay
                            System.out.println("[HODController] Could not resolve semester object for semester number: " + semesterNumber);
                        }

                        // Save the new subject
                        matched = subjectService.addSubject(newSubject);
                    }

                    SubjectDTO dto = new SubjectDTO();
                    dto.setId(matched.getId());
                    dto.setCode(matched.getCode());
                    dto.setName(matched.getName());
                    dto.setCredits(matched.getCredits());
                    dto.setGrade(matched.getGrade());
                    dto.setCt1(matched.getCt1());
                    dto.setCt2(matched.getCt2());
                    dto.setTheory(matched.getTheory());
                    if (matched.getSemester() != null) {
                        SemesterDTO semDTO = new SemesterDTO();
                        semDTO.setId(matched.getSemester().getId());
                        semDTO.setSemester(matched.getSemester().getSemester());
                        dto.setSemester(semDTO);
                    }
                    return dto;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(subjectDTOs);
    }

    private String generateSubjectCode(String subjectName) {
        if (subjectName == null || subjectName.trim().isEmpty()) {
            return "SUB001";
        }
        String[] words = subjectName.trim().split("\\s+");
        StringBuilder code = new StringBuilder();
        for (String word : words) {
            if (code.length() < 6 && word.length() > 0) {
                code.append(Character.toUpperCase(word.charAt(0)));
            }
        }
        return code.toString().isEmpty() ? "SUB001" : code.toString();
    }

    @PostMapping("/subjects")
    public ResponseEntity<Subject> createSubject(@RequestBody com.example.stud_erp.payload.SubjectDTO dto) {
        if (dto == null) {
            return ResponseEntity.badRequest().build();
        }
        if (dto.getGrade() == null || dto.getGrade().isBlank()) {
            return ResponseEntity.badRequest().body(null);
        }

        Subject subject = new Subject();
        subject.setCode(dto.getCode());
        subject.setName(dto.getName());
        subject.setCredits(dto.getCredits());
        subject.setGrade(dto.getGrade());
        subject.setCt1(dto.getCt1());
        subject.setCt2(dto.getCt2());
        subject.setTheory(dto.getTheory());

        // If semester info provided, attach it
        if (dto.getSemester() != null && dto.getSemester().getId() != null) {
            Semester semester = semesterRepository.findById(dto.getSemester().getId())
                    .orElseThrow(() -> new RuntimeException("Semester not found with ID: " + dto.getSemester().getId()));
            subject.setSemester(semester);
        }

        return ResponseEntity.ok(subjectService.addSubject(subject));
    }


    @GetMapping("/professors")
    public ResponseEntity<List<ProfessorDTO>> getProfessors() {
        List<Professor> professors = professorService.getAllProfessors();
        List<ProfessorDTO> dtos = professors.stream()
                .map(p -> new ProfessorDTO(p.getId(), p.getName()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/subjects/{subjectId}/assign-professor")
    public ResponseEntity<Subject> assignProfessorToSubject(
            @PathVariable Long subjectId,
            @RequestBody ProfessorAssignRequest req) {
        if (req == null || req.professorId == null) {
            return ResponseEntity.badRequest().build();
        }

        Subject subject = subjectService.getSubjectById(subjectId)
                .orElseThrow(() -> new RuntimeException("Subject not found: " + subjectId));

        Professor professor = professorService.getProfessorById(req.professorId)
                .orElseThrow(() -> new RuntimeException("Professor not found: " + req.professorId));

        subject.setAssignedProfessor(professor);
        Subject savedSubject = subjectService.addSubject(subject);

        if (professor.getSubjects() == null) {
            professor.setSubjects(new ArrayList<>());
        }
        if (subject.getName() != null && !professor.getSubjects().contains(subject.getName())) {
            professor.getSubjects().add(subject.getName());
            professorService.saveProfessor(professor);
        }

        String departmentOrCourse = "your department";
        if (subject.getCourse() != null && subject.getCourse().getName() != null) {
            departmentOrCourse = subject.getCourse().getName();
        } else if (professor.getDepartmentName() != null && !professor.getDepartmentName().isBlank()) {
            departmentOrCourse = professor.getDepartmentName();
        } else if (professor.getDepartment() != null && professor.getDepartment().getName() != null) {
            departmentOrCourse = professor.getDepartment().getName();
        }

        String hodName = "Head of Department";
        String hodDepartment = departmentOrCourse;
        if (professor.getHod() != null) {
            if (professor.getHod().getName() != null && !professor.getHod().getName().isBlank()) {
                hodName = professor.getHod().getName();
            }
            if (professor.getHod().getDepartment() != null && professor.getHod().getDepartment().getName() != null) {
                hodDepartment = professor.getHod().getDepartment().getName();
            }
        }

        String emailSubject = "Subject Assignment Notification: " + (subject.getName() == null ? "New Subject" : subject.getName());
        String emailBody = "Dear Professor,\n\n"
                + "I hope you are doing well.\n\n"
                + "This is to inform you that you have been assigned to handle the subject "
                + (subject.getName() == null ? "[Subject Name]" : subject.getName())
                + " for the upcoming semester of " + departmentOrCourse + ".\n\n"
                + "Your responsibilities will include conducting lectures, preparing course materials, managing internal assessments, and maintaining academic records related to the subject.\n\n"
                + "Please review the syllabus and course structure before the commencement of classes. Kindly acknowledge this email and confirm your availability for the assignment.\n\n"
                + "We look forward to your valuable contribution to the department.\n\n"
                + "Regards,\n"
                + hodName + "\n"
                + "Head of Department\n"
                + hodDepartment;

        if (professor.getEmail() != null && !professor.getEmail().isBlank()) {
            try {
                emailService.sendEmail(professor.getEmail(), emailSubject, emailBody);
            } catch (Exception ex) {
                // Log but do not fail the request if email delivery fails
                System.err.println("Failed to send assignment email to professor: " + ex.getMessage());
            }
        }

        try {
            NotificationDTO notificationDTO = new NotificationDTO();
            notificationDTO.setTitle("New Subject Assignment");
            notificationDTO.setSubject(emailSubject);
            notificationDTO.setMessage(emailBody);
            notificationDTO.setSender(hodName);
            notificationDTO.setRecipientType("PROFESSOR");
            notificationDTO.setRecipientId(professor.getId());
            notificationService.sendNotification(notificationDTO);
        } catch (Exception ex) {
            System.err.println("Failed to save professor assignment notification: " + ex.getMessage());
        }

        return ResponseEntity.ok(savedSubject);
    }

    @GetMapping("/reports")
    public ResponseEntity<HodReportSummary> getReportSummary() {
        HodReportSummary summary = new HodReportSummary();
        summary.setDepartmentCount(departmentService.getAllDepartments().size());
        summary.setCourseCount(courseService.getAllCourses().size());
        summary.setSubjectCount(subjectService.getAllSubjects().size());
        summary.setProfessorCount(professorService.getAllProfessors().size());
        summary.setDepartmentNames(departmentService.getAllDepartments().stream().map(Department::getName).toList());
        return ResponseEntity.ok(summary);
    }

    @PostMapping("/reports/export")
    public ResponseEntity<byte[]> exportReport(@RequestParam String type) {
        HodReportSummary summary = new HodReportSummary();
        summary.setDepartmentCount(departmentService.getAllDepartments().size());
        summary.setCourseCount(courseService.getAllCourses().size());
        summary.setSubjectCount(subjectService.getAllSubjects().size());
        summary.setProfessorCount(professorService.getAllProfessors().size());
        summary.setDepartmentNames(departmentService.getAllDepartments().stream().map(Department::getName).toList());

        String content = "Metric,Value\n" +
                "Departments," + summary.getDepartmentCount() + "\n" +
                "Courses," + summary.getCourseCount() + "\n" +
                "Subjects," + summary.getSubjectCount() + "\n" +
                "Professors," + summary.getProfessorCount() + "\n";

        if (!summary.getDepartmentNames().isEmpty()) {
            content += "Department Names,\"" + String.join(", ", summary.getDepartmentNames()) + "\"\n";
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv; charset=UTF-8"));
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=department-summary.csv");
        return ResponseEntity.ok().headers(headers).body(content.getBytes(StandardCharsets.UTF_8));
    }

    @GetMapping("/timetables")
    public ResponseEntity<List<HodTimetableEntry>> getHodTimetable() {
        return ResponseEntity.ok(timetableEntries);
    }

    @PostMapping("/timetables")
    public ResponseEntity<HodTimetableEntry> createHodTimetable(@RequestBody HodTimetableEntry request) {
        request.setId(timetableSequence.getAndIncrement());
        timetableEntries.add(request);
        return ResponseEntity.ok(request);
    }

    @PutMapping("/timetables/{id}")
    public ResponseEntity<HodTimetableEntry> updateHodTimetable(@PathVariable Long id, @RequestBody HodTimetableEntry request) {
        for (int i = 0; i < timetableEntries.size(); i++) {
            if (timetableEntries.get(i).getId().equals(id)) {
                request.setId(id);
                timetableEntries.set(i, request);
                return ResponseEntity.ok(request);
            }
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/timetables/{id}")
    public ResponseEntity<Void> deleteHodTimetable(@PathVariable Long id) {
        boolean removed = timetableEntries.removeIf(item -> item.getId().equals(id));
        return removed ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    public static class ProfessorAssignRequest {
        public Long professorId;
    }

    public static class SubjectMapRequest {
        public List<Long> subjectIds;
    }

    public static class HodReportSummary {
        private int departmentCount;
        private int courseCount;
        private int subjectCount;
        private int professorCount;
        private List<String> departmentNames;

        public int getDepartmentCount() {
            return departmentCount;
        }

        public void setDepartmentCount(int departmentCount) {
            this.departmentCount = departmentCount;
        }

        public int getCourseCount() {
            return courseCount;
        }

        public void setCourseCount(int courseCount) {
            this.courseCount = courseCount;
        }

        public int getSubjectCount() {
            return subjectCount;
        }

        public void setSubjectCount(int subjectCount) {
            this.subjectCount = subjectCount;
        }

        public int getProfessorCount() {
            return professorCount;
        }

        public void setProfessorCount(int professorCount) {
            this.professorCount = professorCount;
        }

        public List<String> getDepartmentNames() {
            return departmentNames;
        }

        public void setDepartmentNames(List<String> departmentNames) {
            this.departmentNames = departmentNames;
        }
    }

    public static class HodTimetableEntry {
        private Long id;
        private String day;
        private String time;
        private String subject;
        private String room;
        private String professor;
        private String status;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getDay() {
            return day;
        }

        public void setDay(String day) {
            this.day = day;
        }

        public String getTime() {
            return time;
        }

        public void setTime(String time) {
            this.time = time;
        }

        public String getSubject() {
            return subject;
        }

        public void setSubject(String subject) {
            this.subject = subject;
        }

        public String getRoom() {
            return room;
        }

        public void setRoom(String room) {
            this.room = room;
        }

        public String getProfessor() {
            return professor;
        }

        public void setProfessor(String professor) {
            this.professor = professor;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }
}

