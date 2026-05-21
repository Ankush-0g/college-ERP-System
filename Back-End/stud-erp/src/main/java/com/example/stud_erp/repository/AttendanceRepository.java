package com.example.stud_erp.repository;


import com.example.stud_erp.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    @Query("SELECT ar FROM Attendance ar WHERE ar.classSession.lecturer = :lecturer AND ar.classSession.subject = :subject ORDER BY ar.attendanceDate ASC")
    List<Attendance> findByClassSessionLecturerAndClassSessionSubject(String lecturer, String subject);

    List<Attendance> findByStudentIdAndSubjectId(Long studentId, Long subjectId);

    @Query("SELECT a FROM Attendance a WHERE a.student.id = :studentId AND a.subject.id = :subjectId ORDER BY a.attendanceDate DESC")
    List<Attendance> findByStudentIdAndSubjectIdOrderByAttendanceDateDesc(@Param("studentId") Long studentId, @Param("subjectId") Long subjectId);

    @Query("SELECT a FROM Attendance a WHERE a.student.id = :studentId ORDER BY a.attendanceDate DESC")
    List<Attendance> findByStudentIdOrderByAttendanceDateDesc(@Param("studentId") Long studentId);

    @Query("SELECT a FROM Attendance a WHERE a.professor.id = :professorId AND a.subject.id = :subjectId AND a.attendanceDate = :date")
    List<Attendance> findByProfessorAndSubjectAndDate(@Param("professorId") Long professorId, @Param("subjectId") Long subjectId, @Param("date") LocalDate date);

}
