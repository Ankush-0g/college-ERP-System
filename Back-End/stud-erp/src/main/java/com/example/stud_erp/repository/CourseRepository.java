package com.example.stud_erp.repository;

import com.example.stud_erp.entity.Course;
import com.example.stud_erp.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course , Long> {
    Optional<Course> findByCode(String code);

    @Query("SELECT c FROM Course c WHERE c.department.id = :departmentId")
    List<Course> findByDepartmentId(@Param("departmentId") Long departmentId);

    @Query("SELECT c FROM Course c WHERE c.department = :department")
    List<Course> findByDepartment(@Param("department") Department department);

    @Query("SELECT c FROM Course c WHERE c.department.id = :departmentId AND c.code = :courseCode")
    Optional<Course> findByDepartmentIdAndCode(@Param("departmentId") Long departmentId, @Param("courseCode") String courseCode);
}
