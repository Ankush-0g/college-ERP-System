package com.example.stud_erp.controller;

import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class AssignmentController {

    private final AtomicLong assignmentSequence = new AtomicLong(1);
    private final AtomicLong submissionSequence = new AtomicLong(1);
    private final List<AssignmentDTO> assignments = new ArrayList<>();
    private final List<StudentSubmissionDTO> submissions = new ArrayList<>();

    @PostMapping("/professor/assignments")
    public ResponseEntity<AssignmentDTO> uploadAssignment(@RequestBody AssignmentDTO assignment) {
        assignment.setId(assignmentSequence.getAndIncrement());
        assignments.add(assignment);
        return ResponseEntity.ok(assignment);
    }

    @GetMapping("/professor/assignments")
    public ResponseEntity<List<AssignmentDTO>> getAssignments() {
        return ResponseEntity.ok(assignments);
    }

    @PostMapping("/students/assignments")
    public ResponseEntity<StudentSubmissionDTO> submitAssignment(@RequestBody StudentSubmissionDTO submission) {
        submission.setId(submissionSequence.getAndIncrement());
        submission.setSubmittedAt(LocalDateTime.now().toString());
        submissions.add(submission);
        return ResponseEntity.ok(submission);
    }

    @GetMapping("/students/assignments")
    public ResponseEntity<List<StudentSubmissionDTO>> getStudentSubmissions(@RequestParam(required = false) Long studentId) {
        if (studentId == null) {
            return ResponseEntity.ok(submissions);
        }
        return ResponseEntity.ok(submissions.stream()
                .filter(s -> s.getStudentId().equals(studentId))
                .collect(Collectors.toList()));
    }

    @Data
    public static class AssignmentDTO {
        private Long id;
        private String title;
        private String course;
        private String deadline;
        private String description;
        private String professorId;
        private String fileName;
    }

    @Data
    public static class StudentSubmissionDTO {
        private Long id;
        private Long studentId;
        private String title;
        private String description;
        private String fileName;
        private String submittedAt;
    }
}
