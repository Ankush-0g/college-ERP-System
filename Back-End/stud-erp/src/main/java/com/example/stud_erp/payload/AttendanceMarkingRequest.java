package com.example.stud_erp.payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceMarkingRequest {
    private Long professorId;
    private Long subjectId;
    private Long courseId;
    private String semester;
    private LocalDate attendanceDate;
    private Map<Long, Boolean> studentAttendance; // studentId -> isPresent
    private String remarks;
}
