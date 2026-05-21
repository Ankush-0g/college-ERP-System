package com.example.stud_erp.repository;

import com.example.stud_erp.entity.Semester;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SemesterRepository extends JpaRepository<Semester ,Long> {
    @Query("SELECT s FROM Semester s WHERE s.semester = :semesterNumber")
    Semester findBySemesterNumber(@Param("semesterNumber") int semesterNumber);

    Semester findBySemester(String semester);

    @Query("SELECT s FROM Semester s JOIN FETCH s.student st JOIN FETCH s.course c WHERE c.id = :courseId")
    List<Semester> findByCourseIdWithStudent(@Param("courseId") Long courseId);
}

