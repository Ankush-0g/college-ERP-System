package com.example.stud_erp.payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentCoursesDTO {
    private Long departmentId;
    private String departmentName;
    private String departmentType;
    private Long courseId;
    private String courseCode;
    private String courseName;
    private List<SemesterSubjectsDTO> semesters;
}
