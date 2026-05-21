package com.example.stud_erp.repository;

import java.util.Optional;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.stud_erp.entity.HOD;
import com.example.stud_erp.entity.Department;

@Repository
public interface HODRepository extends JpaRepository<HOD, Long> {
    Optional<HOD> findById(Long id);

    HOD findByUsername(String username);

    HOD findByEmail(String email);

    Optional<HOD> findByDepartment(Department department);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsernameOrEmail(String username, String email);

    @Query("SELECT h FROM HOD h WHERE h.department.id = :departmentId")
    Optional<HOD> findByDepartmentId(@Param("departmentId") Long departmentId);
}