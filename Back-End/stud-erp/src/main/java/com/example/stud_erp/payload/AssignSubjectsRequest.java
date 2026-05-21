package com.example.stud_erp.payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignSubjectsRequest {
    @NotNull(message = "Professor ID cannot be null")
    private Long professorId;
    
    @NotNull(message = "Course ID cannot be null")
    private Long courseId;
    
    @NotBlank(message = "Semester cannot be blank")
    private String semester;
    
    @NotEmpty(message = "At least one subject must be selected")
    private List<Long> subjectIds;
}
