package com.example.stud_erp.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Table(name = "exam_schedules", indexes = {
    @Index(name = "idx_department_id", columnList = "department_id"),
    @Index(name = "idx_exam_date", columnList = "exam_date"),
    @Index(name = "idx_hod_id", columnList = "hod_id")
})
public class ExamSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    @JsonIgnore
    private Department department;

    @Column(nullable = false, length = 100)
    private String subjectName;

    @Column(nullable = false, length = 100)
    private String courseCode;

    @Column(nullable = false)
    private LocalDate examDate;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    @Column(nullable = false, length = 50)
    private String hallNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hod_id", nullable = false)
    @JsonIgnore
    private HOD hod;

    @Column(nullable = false, updatable = false)
    private LocalDate createdDate;

    @Column(nullable = false)
    private LocalDate updatedDate;

    @Column(length = 500)
    private String remarks;

    @PrePersist
    protected void onCreate() {
        createdDate = LocalDate.now();
        updatedDate = LocalDate.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedDate = LocalDate.now();
    }
}
