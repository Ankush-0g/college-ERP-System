package com.example.stud_erp.payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExamScheduleDTO {

    private Long id;
    private Long departmentId;
    private String departmentName;
    private String subjectName;
    private String courseCode;
    private LocalDate examDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String hallNumber;
    private Long hodId;
    private String hodName;
    private LocalDate createdDate;
    private LocalDate updatedDate;
    private String remarks;
}
