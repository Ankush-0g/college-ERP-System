package com.example.stud_erp.controller;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequestMapping("/api")
public class DashboardController {

    private final AtomicLong certificateSequence = new AtomicLong(1);
    private final AtomicLong leaveSequence = new AtomicLong(1);
    private final List<CertificateRequestDTO> certificateRequests = new ArrayList<>();
    private final List<LeaveRequestDTO> leaveRequests = new ArrayList<>();

    @GetMapping("/professors/{professorId}/timetable")
    public ResponseEntity<List<TimetableEntry>> getProfessorTimetable(@PathVariable Long professorId) {
        List<TimetableEntry> timetable = List.of(
                new TimetableEntry("09:00 AM", "Computer Networks", "A-204", "Live"),
                new TimetableEntry("11:00 AM", "Database Systems", "B-110", "Upcoming"),
                new TimetableEntry("02:00 PM", "Software Engineering", "C-301", "Upcoming")
        );
        return ResponseEntity.ok(timetable);
    }

    @GetMapping("/students/{studentId}/timetable")
    public ResponseEntity<List<TimetableEntry>> getStudentTimetable(@PathVariable Long studentId) {
        List<TimetableEntry> timetable = List.of(
                new TimetableEntry("09:00 AM", "Computer Networks", "A-101", "Ongoing"),
                new TimetableEntry("11:00 AM", "Data Structures", "B-203", "Upcoming"),
                new TimetableEntry("02:00 PM", "Database Systems", "C-110", "Upcoming")
        );
        return ResponseEntity.ok(timetable);
    }

    @GetMapping("/students/{studentId}/exams")
    public ResponseEntity<List<ExamScheduleDTO>> getStudentExamSchedule(@PathVariable Long studentId) {
        List<ExamScheduleDTO> exams = List.of(
                new ExamScheduleDTO("Algorithms", "May 20, 2026", "10:00 AM", "Exam Hall 1"),
                new ExamScheduleDTO("Databases", "May 23, 2026", "02:00 PM", "Exam Hall 3")
        );
        return ResponseEntity.ok(exams);
    }

    @GetMapping("/students/{studentId}/hall-ticket")
    public ResponseEntity<HallTicketDTO> getStudentHallTicket(@PathVariable Long studentId) {
        HallTicketDTO ticket = new HallTicketDTO(
                studentId,
                "Ankur Sharma",
                "May 2026 Semester Exams",
                LocalDateTime.now().toString(),
                "https://example.com/hall-ticket/" + studentId
        );
        return ResponseEntity.ok(ticket);
    }

    @PostMapping("/students/{studentId}/certificate-request")
    public ResponseEntity<CertificateRequestDTO> requestCertificate(
            @PathVariable Long studentId,
            @RequestBody CertificateRequestDTO request
    ) {
        request.setId(certificateSequence.getAndIncrement());
        request.setStudentId(studentId);
        request.setStatus("Submitted");
        request.setSubmittedAt(LocalDateTime.now().toString());
        certificateRequests.add(request);
        return ResponseEntity.ok(request);
    }

    @PostMapping("/students/{studentId}/leave-request")
    public ResponseEntity<LeaveRequestDTO> submitStudentLeave(
            @PathVariable Long studentId,
            @RequestBody LeaveRequestDTO request
    ) {
        request.setId(leaveSequence.getAndIncrement());
        request.setUserId(studentId);
        request.setRole("student");
        request.setStatus("Pending");
        request.setSubmittedAt(LocalDateTime.now().toString());
        leaveRequests.add(request);
        return ResponseEntity.ok(request);
    }

    @PostMapping("/professors/{professorId}/leave-request")
    public ResponseEntity<LeaveRequestDTO> submitProfessorLeave(
            @PathVariable Long professorId,
            @RequestBody LeaveRequestDTO request
    ) {
        request.setId(leaveSequence.getAndIncrement());
        request.setUserId(professorId);
        request.setRole("professor");
        request.setStatus("Pending");
        request.setSubmittedAt(LocalDateTime.now().toString());
        leaveRequests.add(request);
        return ResponseEntity.ok(request);
    }

    @GetMapping("/hod/leaves")
    public ResponseEntity<List<LeaveRequestDTO>> getHodLeaves() {
        return ResponseEntity.ok(leaveRequests);
    }

    @GetMapping("/students/{studentId}/leaves")
    public ResponseEntity<List<LeaveRequestDTO>> getStudentLeaves(@PathVariable Long studentId) {
        List<LeaveRequestDTO> studentLeaves = new ArrayList<>();
        for (LeaveRequestDTO lr : leaveRequests) {
            if ("student".equals(lr.getRole()) && studentId.equals(lr.getUserId())) {
                studentLeaves.add(lr);
            }
        }
        return ResponseEntity.ok(studentLeaves);
    }

    @GetMapping("/professors/{professorId}/leaves")
    public ResponseEntity<List<LeaveRequestDTO>> getProfessorLeaves(@PathVariable Long professorId) {
        List<LeaveRequestDTO> professorLeaves = new ArrayList<>();
        for (LeaveRequestDTO lr : leaveRequests) {
            if ("professor".equals(lr.getRole()) && professorId.equals(lr.getUserId())) {
                professorLeaves.add(lr);
            }
        }
        return ResponseEntity.ok(professorLeaves);
    }

    @PostMapping("/hod/leaves/{id}/decision")
    public ResponseEntity<LeaveRequestDTO> decideLeave(
            @PathVariable Long id,
            @RequestBody DecisionRequest decision
    ) {
        // Defensive coding: avoid NPEs when payload/fields are missing
        if (id == null || decision == null) {
            return ResponseEntity.badRequest().build();
        }

        boolean approve;
        try {
            approve = decision.isApprove();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }

        for (LeaveRequestDTO lr : leaveRequests) {
            if (lr == null || lr.getId() == null) {
                continue;
            }
            if (lr.getId().equals(id)) {
                lr.setStatus(approve ? "Approved" : "Rejected");
                return ResponseEntity.ok(lr);
            }
        }

        return ResponseEntity.notFound().build();
    }

    @Data
    public static class TimetableEntry {
        private final String time;
        private final String subject;
        private final String room;
        private final String status;
    }

    @Data
    public static class ExamScheduleDTO {
        private final String subject;
        private final String date;
        private final String time;
        private final String hall;
    }

    @Data
    public static class HallTicketDTO {
        private final Long studentId;
        private final String studentName;
        private final String examSession;
        private final String issueDate;
        private final String downloadUrl;
    }

    @Data
    public static class CertificateRequestDTO {
        private Long id;
        private Long studentId;
        private String certificateType;
        private String purpose;
        private String status;
        private String submittedAt;
    }

    @Data
    public static class LeaveRequestDTO {
        private Long id;
        private Long userId;
        private String role;
        @JsonAlias({"from", "fromDate"})
        private String fromDate;
        @JsonAlias({"to", "toDate"})
        private String toDate;
        private String reason;
        private String status;
        private String submittedAt;
    }

    public static class DecisionRequest {
        private boolean approve;

        public boolean isApprove() {
            return approve;
        }

        public void setApprove(boolean approve) {
            this.approve = approve;
        }
    }
}
