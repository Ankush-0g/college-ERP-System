package com.example.stud_erp.controller;

import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class MarksController {

    private final AtomicLong marksSequence = new AtomicLong(1);
    private final List<MarkEntry> marks = new ArrayList<>();

    @PostMapping("/professor/marks")
    public ResponseEntity<List<MarkEntry>> saveMarks(@RequestBody MarksPayload payload) {
        payload.getMarks().forEach(mark -> {
            if (mark.getId() == null) {
                mark.setId(marksSequence.getAndIncrement());
            }
            marks.add(mark);
        });
        return ResponseEntity.ok(payload.getMarks());
    }

    @GetMapping("/students/marks/{studentId}")
    public ResponseEntity<List<MarkEntry>> getStudentMarks(@PathVariable Long studentId) {
        return ResponseEntity.ok(marks.stream()
                .filter(mark -> mark.getStudentId().equals(studentId))
                .collect(Collectors.toList()));
    }

    @Data
    public static class MarksPayload {
        private Long professorId;
        private List<MarkEntry> marks;
    }

    @Data
    public static class MarkEntry {
        private Long id;
        private Long studentId;
        private String studentName;
        private Integer internal;
        private Integer external;
        private Integer total;
    }
}
