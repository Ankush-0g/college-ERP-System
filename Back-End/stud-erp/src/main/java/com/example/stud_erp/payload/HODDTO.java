package com.example.stud_erp.payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HODDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String imageUrl;
    private Long departmentId;
    private String departmentName;
    private String departmentType; // BCA, BSC, BE, etc.
    private int professorsCount;
    private int studentsCount;
    private int coursesCount;
}
