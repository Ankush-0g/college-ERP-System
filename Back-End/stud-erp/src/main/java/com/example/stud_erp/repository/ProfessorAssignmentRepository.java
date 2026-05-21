package com.example.stud_erp.repository;

import com.example.stud_erp.entity.ProfessorAssignment;
import com.example.stud_erp.entity.Professor;
import com.example.stud_erp.entity.Course;
import com.example.stud_erp.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProfessorAssignmentRepository extends JpaRepository<ProfessorAssignment, Long> {
    List<ProfessorAssignment> findByProfessor(Professor professor);
    List<ProfessorAssignment> findByProfessorAndCourse(Professor professor, Course course);
    List<ProfessorAssignment> findByCourseAndSemester(Course course, String semester);
    Optional<ProfessorAssignment> findByProfessorAndCourseAndSemester(Professor professor, Course course, String semester);
    List<ProfessorAssignment> findByCourse(Course course);
    boolean existsByProfessorAndCourseAndSemester(Professor professor, Course course, String semester);

    @Query("SELECT pa FROM ProfessorAssignment pa WHERE pa.course.department.id = :departmentId")
    List<ProfessorAssignment> findByDepartmentId(@Param("departmentId") Long departmentId);

    @Query("SELECT pa FROM ProfessorAssignment pa WHERE pa.course.department = :department")
    List<ProfessorAssignment> findByDepartment(@Param("department") Department department);

    @Query("SELECT pa FROM ProfessorAssignment pa WHERE pa.professor.id = :professorId AND pa.course.department.id = :departmentId")
    List<ProfessorAssignment> findByProfessorAndDepartment(@Param("professorId") Long professorId, @Param("departmentId") Long departmentId);

    @Query("SELECT pa FROM ProfessorAssignment pa WHERE pa.assignedBy.id = :hodId")
    List<ProfessorAssignment> findByAssignedByHod(@Param("hodId") Long hodId);
}
