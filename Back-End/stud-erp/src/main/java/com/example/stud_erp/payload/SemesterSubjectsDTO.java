package com.example.stud_erp.payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SemesterSubjectsDTO {
    private Integer semesterNumber;
    private List<SubjectDTO> subjects;
}
