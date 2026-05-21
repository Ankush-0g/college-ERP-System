package com.example.stud_erp.payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfessorAssignmentDTO {
    private Long id;
    private Long professorId;
    private String professorName;
    private Long courseId;
    private String courseName;
    private String semester;
    private List<Long> subjectIds;
    private List<String> subjectNames;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
