package com.example.stud_erp.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "attendance", indexes = {
        @Index(columnList = "student_id"),
        @Index(columnList = "subject_id"),
        @Index(columnList = "professor_id"),
        @Index(columnList = "attendance_date")
})
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_name")
    private String studentName;

    @Column(name = "status")
    private String status;

    @Column(name = "attendance_date")
    private LocalDate attendanceDate;

    @ManyToOne
    @JoinColumn(name = "class_session_id")
    @JsonBackReference
    private ClassSession classSession;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne
    @JoinColumn(name = "subject_id")
    private Subject subject;

    @ManyToOne
    @JoinColumn(name = "professor_id")
    private Professor professor;

    @Column(name = "is_present")
    private Boolean isPresent;

    @Column(name = "remarks", length = 500)
    private String remarks;
}
