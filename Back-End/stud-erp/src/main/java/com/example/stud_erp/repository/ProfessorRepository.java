package com.example.stud_erp.repository;

import com.example.stud_erp.entity.Professor;
import com.example.stud_erp.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ProfessorRepository extends JpaRepository<Professor, Long> {
    Professor findByProfessorId(String professorId);

    Professor findByUsername(String username);

    Professor findByEmail(String email);

    @Query("SELECT p FROM Professor p WHERE p.department.id = :departmentId")
    List<Professor> findByDepartmentId(@Param("departmentId") Long departmentId);

    @Query("SELECT p FROM Professor p WHERE p.department = :department")
    List<Professor> findByDepartment(@Param("department") Department department);

    @Query("SELECT p FROM Professor p WHERE p.hod.id = :hodId")
    List<Professor> findByHodId(@Param("hodId") Long hodId);
}
