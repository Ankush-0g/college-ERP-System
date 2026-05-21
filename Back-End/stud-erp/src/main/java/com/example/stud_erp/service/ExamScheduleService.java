package com.example.stud_erp.service;

import com.example.stud_erp.entity.ExamSchedule;
import com.example.stud_erp.entity.Department;
import com.example.stud_erp.entity.HOD;
import com.example.stud_erp.repository.ExamScheduleRepository;
import com.example.stud_erp.repository.DepartmentRepository;
import com.example.stud_erp.repository.HODRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ExamScheduleService {

    @Autowired
    private ExamScheduleRepository examScheduleRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private HODRepository hodRepository;

    /**
     * Create a new exam schedule
     */
    public ExamSchedule createExamSchedule(ExamSchedule examSchedule) {
        if (examSchedule.getStartTime().isAfter(examSchedule.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }
        return examScheduleRepository.save(examSchedule);
    }

    /**
     * Get exam schedule by ID
     */
    public Optional<ExamSchedule> getExamScheduleById(Long id) {
        return examScheduleRepository.findById(id);
    }

    /**
     * Get all exam schedules for a department
     */
    public List<ExamSchedule> getExamSchedulesByDepartment(Long departmentId) {
        return examScheduleRepository.findByDepartmentIdOrderByExamDateAsc(departmentId);
    }

    /**
     * Get all exam schedules created by an HOD
     */
    public List<ExamSchedule> getExamSchedulesByHOD(Long hodId) {
        return examScheduleRepository.findByHodId(hodId);
    }

    /**
     * Get upcoming exams for a department
     */
    public List<ExamSchedule> getUpcomingExams(Long departmentId) {
        return examScheduleRepository.findUpcomingExams(departmentId, LocalDate.now());
    }

    /**
     * Get exam schedules for a specific date range
     */
    public List<ExamSchedule> getExamSchedulesByDateRange(LocalDate startDate, LocalDate endDate) {
        return examScheduleRepository.findByExamDateBetween(startDate, endDate);
    }

    /**
     * Get exam schedules for a department within date range
     */
    public List<ExamSchedule> getExamSchedulesByDepartmentAndDateRange(Long departmentId, LocalDate startDate, LocalDate endDate) {
        return examScheduleRepository.findByDepartmentIdAndExamDateBetween(departmentId, startDate, endDate);
    }

    /**
     * Get exam schedules by subject name
     */
    public List<ExamSchedule> searchBySubject(String subjectName) {
        return examScheduleRepository.findBySubjectNameContainingIgnoreCase(subjectName);
    }

    /**
     * Get exam schedules by course code
     */
    public List<ExamSchedule> getExamSchedulesByCourseCode(String courseCode) {
        return examScheduleRepository.findByCourseCode(courseCode);
    }

    /**
     * Get exam schedules for a specific course in a department
     */
    public List<ExamSchedule> getExamSchedulesByDepartmentAndCourse(Long departmentId, String courseCode) {
        return examScheduleRepository.findByDepartmentIdAndCourseCode(departmentId, courseCode);
    }

    /**
     * Update exam schedule
     */
    public ExamSchedule updateExamSchedule(Long id, ExamSchedule updatedSchedule) {
        Optional<ExamSchedule> existing = examScheduleRepository.findById(id);
        if (existing.isPresent()) {
            ExamSchedule schedule = existing.get();
            schedule.setSubjectName(updatedSchedule.getSubjectName());
            schedule.setCourseCode(updatedSchedule.getCourseCode());
            schedule.setExamDate(updatedSchedule.getExamDate());
            schedule.setStartTime(updatedSchedule.getStartTime());
            schedule.setEndTime(updatedSchedule.getEndTime());
            schedule.setHallNumber(updatedSchedule.getHallNumber());
            schedule.setRemarks(updatedSchedule.getRemarks());

            if (schedule.getStartTime().isAfter(schedule.getEndTime())) {
                throw new IllegalArgumentException("Start time must be before end time");
            }

            return examScheduleRepository.save(schedule);
        }
        throw new IllegalArgumentException("Exam schedule not found with id: " + id);
    }

    /**
     * Delete exam schedule
     */
    public void deleteExamSchedule(Long id) {
        examScheduleRepository.deleteById(id);
    }

    /**
     * Delete exam schedule by department and ID (security check)
     */
    public void deleteExamScheduleByDepartmentAndId(Long departmentId, Long examScheduleId) {
        examScheduleRepository.deleteByDepartmentIdAndId(departmentId, examScheduleId);
    }

    /**
     * Get all exam schedules
     */
    public List<ExamSchedule> getAllExamSchedules() {
        return examScheduleRepository.findAll();
    }

    /**
     * Get exam schedules by department name
     */
    public List<ExamSchedule> getExamSchedulesByDepartmentName(String departmentName) {
        return examScheduleRepository.findByDepartmentName(departmentName);
    }

    /**
     * Validate exam schedule creation
     */
    public boolean validateExamSchedule(ExamSchedule schedule) {
        // Check if department exists
        Optional<Department> department = departmentRepository.findById(schedule.getDepartment().getId());
        if (department.isEmpty()) {
            return false;
        }

        // Check if HOD exists
        Optional<HOD> hod = hodRepository.findById(schedule.getHod().getId());
        if (hod.isEmpty()) {
            return false;
        }

        // Validate times
        if (schedule.getStartTime().isAfter(schedule.getEndTime())) {
            return false;
        }

        // Validate date is in future
        if (schedule.getExamDate().isBefore(LocalDate.now())) {
            return false;
        }

        return true;
    }
}
