package com.example.stud_erp.repository;

import com.example.stud_erp.entity.ExamSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExamScheduleRepository extends JpaRepository<ExamSchedule, Long> {

    List<ExamSchedule> findByDepartmentId(Long departmentId);

    List<ExamSchedule> findByDepartmentIdOrderByExamDateAsc(Long departmentId);

    List<ExamSchedule> findByHodId(Long hodId);

    List<ExamSchedule> findByExamDateBetween(LocalDate startDate, LocalDate endDate);

    List<ExamSchedule> findByDepartmentIdAndExamDateBetween(Long departmentId, LocalDate startDate, LocalDate endDate);

    List<ExamSchedule> findBySubjectNameContainingIgnoreCase(String subjectName);

    List<ExamSchedule> findByCourseCode(String courseCode);

    List<ExamSchedule> findByDepartmentIdAndCourseCode(Long departmentId, String courseCode);

    @Query("SELECT es FROM ExamSchedule es WHERE es.department.id = :departmentId AND es.examDate >= :currentDate ORDER BY es.examDate ASC")
    List<ExamSchedule> findUpcomingExams(@Param("departmentId") Long departmentId, @Param("currentDate") LocalDate currentDate);

    void deleteByDepartmentIdAndId(Long departmentId, Long examScheduleId);

    @Query("SELECT es FROM ExamSchedule es WHERE es.department.id IN (SELECT d.id FROM Department d WHERE d.name = :departmentName) ORDER BY es.examDate ASC")
    List<ExamSchedule> findByDepartmentName(@Param("departmentName") String departmentName);
}
