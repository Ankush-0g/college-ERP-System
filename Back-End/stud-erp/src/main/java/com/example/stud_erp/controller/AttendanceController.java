package com.example.stud_erp.controller;
import com.example.stud_erp.entity.Attendance;
import com.example.stud_erp.entity.ClassSession;
import com.example.stud_erp.entity.Student;
import com.example.stud_erp.entity.Subject;
import com.example.stud_erp.payload.*;
import com.example.stud_erp.repository.StudentRepository;
import com.example.stud_erp.repository.SubjectRepository;
import com.example.stud_erp.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/attendance")
@CrossOrigin("*")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @PostMapping("/mark")
    public ResponseEntity<?> markAttendance(@RequestBody AttendanceMarkingRequest request) {
        try {
            if (request.getProfessorId() == null || request.getSubjectId() == null ||
                request.getAttendanceDate() == null || request.getStudentAttendance() == null) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("Missing required fields: professorId, subjectId, attendanceDate, studentAttendance"));
            }

            List<Attendance> records = attendanceService.markAttendance(
                    request.getProfessorId(),
                    request.getSubjectId(),
                    request.getAttendanceDate(),
                    request.getStudentAttendance(),
                    request.getRemarks()
            );

            return ResponseEntity.ok(new SuccessResponse("Attendance marked successfully", records.size()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Error marking attendance: " + e.getMessage()));
        }
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getStudentAttendance(@PathVariable Long studentId) {
        try {
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            List<Attendance> allAttendance = attendanceService.getStudentAllAttendance(studentId);

            Map<String, Object> subjectsMap = new LinkedHashMap<>();
            Map<Long, Subject> subjectCache = new HashMap<>();

            allAttendance.forEach(record -> {
                Subject subject = record.getSubject();
                if (subject != null) {
                    subjectCache.putIfAbsent(subject.getId(), subject);
                    String subjectKey = subject.getId().toString();

                    subjectsMap.putIfAbsent(subjectKey, new LinkedHashMap<String, Object>() {{
                        put("subjectId", subject.getId());
                        put("subjectName", subject.getName());
                        put("professorName", record.getProfessor() != null ? record.getProfessor().getName() : "Unknown");
                        put("records", new ArrayList<>());
                    }});

                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> records = (List<Map<String, Object>>)
                            ((Map<String, Object>) subjectsMap.get(subjectKey)).get("records");

                    records.add(new LinkedHashMap<String, Object>() {{
                        put("date", record.getAttendanceDate());
                        put("present", record.getIsPresent());
                        put("status", record.getStatus());
                    }});
                }
            });

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("studentId", studentId);
            response.put("studentName", student.getStudName() + " " + (student.getStudLastName() != null ? student.getStudLastName() : ""));
            response.put("subjects", new ArrayList<>(subjectsMap.values()));

            subjectsMap.forEach((subjectKey, subjectData) -> {
                @SuppressWarnings("unchecked")
                Map<String, Object> data = (Map<String, Object>) subjectData;
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> records = (List<Map<String, Object>>) data.get("records");

                if (!records.isEmpty()) {
                    int presentCount = (int) records.stream().filter(r -> (Boolean) r.get("present")).count();
                    double percentage = (double) presentCount / records.size() * 100;
                    data.put("totalClasses", records.size());
                    data.put("classesAttended", presentCount);
                    data.put("attendancePercentage", Math.round(percentage * 100.0) / 100.0);
                }
            });

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Error fetching attendance: " + e.getMessage()));
        }
    }

    @GetMapping("/student/{studentId}/subject/{subjectId}")
    public ResponseEntity<?> getStudentSubjectAttendance(@PathVariable Long studentId, @PathVariable Long subjectId) {
        try {
            List<Attendance> records = attendanceService.getStudentSubjectAttendance(studentId, subjectId);

            if (records.isEmpty()) {
                return ResponseEntity.ok(new ErrorResponse("No attendance records found"));
            }

            Subject subject = subjectRepository.findById(subjectId).orElse(null);
            int presentCount = (int) records.stream().filter(Attendance::getIsPresent).count();
            double percentage = (double) presentCount / records.size() * 100;

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("subjectId", subjectId);
            response.put("subjectName", subject != null ? subject.getName() : "Unknown");
            response.put("totalClasses", records.size());
            response.put("classesAttended", presentCount);
            response.put("attendancePercentage", Math.round(percentage * 100.0) / 100.0);
            response.put("records", records.stream().map(r -> new LinkedHashMap<String, Object>() {{
                put("date", r.getAttendanceDate());
                put("present", r.getIsPresent());
                put("markedBy", r.getProfessor() != null ? r.getProfessor().getName() : "Unknown");
            }}).collect(Collectors.toList()));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Error fetching subject attendance: " + e.getMessage()));
        }
    }

    @GetMapping("/professor/eligibility")
    public ResponseEntity<ProfessorAttendanceEligibilityDTO> getProfessorEligibility(
            @RequestParam String professorId) {
        return ResponseEntity.ok(attendanceService.getProfessorEligibility(professorId));
    }

    static class ErrorResponse {
        public String message;
        public ErrorResponse(String message) {
            this.message = message;
        }
    }

    static class SuccessResponse {
        public String message;
        public int count;
        public SuccessResponse(String message, int count) {
            this.message = message;
            this.count = count;
        }
    }
}
