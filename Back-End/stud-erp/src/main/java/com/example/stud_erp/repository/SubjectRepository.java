package com.example.stud_erp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.stud_erp.entity.Subject;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {

    @EntityGraph(attributePaths = {"course", "assignedProfessor"})
    @Query("select s from Subject s")
    List<Subject> findAllWithCourseAndAssignedProfessor();

    List<Subject> findByCourseId(Long courseId);

    @Override
    List<Subject> findAll();

    @Query("SELECT s FROM Subject s WHERE s.course.id = :courseId AND s.semester.semester = :semester")
    List<Subject> findByCourseSemester(@Param("courseId") Long courseId, @Param("semester") String semester);


    @Query("SELECT s FROM Subject s WHERE s.course.department.id = :departmentId")
    List<Subject> findByDepartmentId(@Param("departmentId") Long departmentId);

    @Query("SELECT s FROM Subject s WHERE s.course.department.id = :departmentId AND s.course.id = :courseId")
    List<Subject> findByDepartmentAndCourse(@Param("departmentId") Long departmentId, @Param("courseId") Long courseId);

}

