package com.example.stud_erp.payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentSubjectAttendanceDTO {
    private Long subjectId;
    private String subjectName;
    private Long professorId;
    private String professorName;
    private Integer totalClasses;
    private Integer classesAttended;
    private Double attendancePercentage;
    private List<AttendanceRecordDTO> attendanceRecords;
}
