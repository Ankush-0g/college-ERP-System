package com.example.stud_erp.controller;

import com.example.stud_erp.entity.ExamSchedule;
import com.example.stud_erp.entity.Department;
import com.example.stud_erp.entity.HOD;
import com.example.stud_erp.payload.ExamScheduleDTO;
import com.example.stud_erp.repository.DepartmentRepository;
import com.example.stud_erp.repository.HODRepository;
import com.example.stud_erp.service.ExamScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/exam-schedules")
@CrossOrigin(origins = "http://localhost:5173")
public class ExamScheduleController {

    @Autowired
    private ExamScheduleService examScheduleService;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private HODRepository hodRepository;

    /**
     * Create a new exam schedule
     */
    @PostMapping("/create")
    public ResponseEntity<?> createExamSchedule(@RequestBody ExamScheduleDTO dto) {
        try {
            Optional<Department> department = departmentRepository.findById(dto.getDepartmentId());
            Optional<HOD> hod = hodRepository.findById(dto.getHodId());

            if (department.isEmpty() || hod.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Department or HOD not found");
            }

            ExamSchedule schedule = new ExamSchedule();
            schedule.setDepartment(department.get());
            schedule.setSubjectName(dto.getSubjectName());
            schedule.setCourseCode(dto.getCourseCode());
            schedule.setExamDate(dto.getExamDate());
            schedule.setStartTime(dto.getStartTime());
            schedule.setEndTime(dto.getEndTime());
            schedule.setHallNumber(dto.getHallNumber());
            schedule.setHod(hod.get());
            schedule.setRemarks(dto.getRemarks());

            if (!examScheduleService.validateExamSchedule(schedule)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid exam schedule data");
            }

            ExamSchedule savedSchedule = examScheduleService.createExamSchedule(schedule);
            return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(savedSchedule));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error creating exam schedule: " + e.getMessage());
        }
    }

    /**
     * Get all exam schedules
     */
    @GetMapping("/all")
    public ResponseEntity<?> getAllExamSchedules() {
        try {
            List<ExamSchedule> schedules = examScheduleService.getAllExamSchedules();
            List<ExamScheduleDTO> dtos = schedules.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error fetching exam schedules: " + e.getMessage());
        }
    }

    /**
     * Get exam schedule by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getExamScheduleById(@PathVariable Long id) {
        try {
            Optional<ExamSchedule> schedule = examScheduleService.getExamScheduleById(id);
            if (schedule.isPresent()) {
                return ResponseEntity.ok(convertToDTO(schedule.get()));
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Exam schedule not found");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error fetching exam schedule: " + e.getMessage());
        }
    }

    /**
     * Get exam schedules by department
     */
    @GetMapping("/department/{departmentId}")
    public ResponseEntity<?> getExamSchedulesByDepartment(@PathVariable Long departmentId) {
        try {
            List<ExamSchedule> schedules = examScheduleService.getExamSchedulesByDepartment(departmentId);
            List<ExamScheduleDTO> dtos = schedules.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error fetching exam schedules: " + e.getMessage());
        }
    }

    /**
     * Get exam schedules by HOD
     */
    @GetMapping("/hod/{hodId}")
    public ResponseEntity<?> getExamSchedulesByHOD(@PathVariable Long hodId) {
        try {
            List<ExamSchedule> schedules = examScheduleService.getExamSchedulesByHOD(hodId);
            List<ExamScheduleDTO> dtos = schedules.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error fetching exam schedules: " + e.getMessage());
        }
    }

    /**
     * Get upcoming exams for a department
     */
    @GetMapping("/upcoming/department/{departmentId}")
    public ResponseEntity<?> getUpcomingExams(@PathVariable Long departmentId) {
        try {
            List<ExamSchedule> schedules = examScheduleService.getUpcomingExams(departmentId);
            List<ExamScheduleDTO> dtos = schedules.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error fetching upcoming exams: " + e.getMessage());
        }
    }

    /**
     * Get exam schedules by date range
     */
    @GetMapping("/date-range")
    public ResponseEntity<?> getExamSchedulesByDateRange(
        @RequestParam LocalDate startDate,
        @RequestParam LocalDate endDate) {
        try {
            List<ExamSchedule> schedules = examScheduleService.getExamSchedulesByDateRange(startDate, endDate);
            List<ExamScheduleDTO> dtos = schedules.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error fetching exam schedules: " + e.getMessage());
        }
    }

    /**
     * Get exam schedules for department within date range
     */
    @GetMapping("/department/{departmentId}/date-range")
    public ResponseEntity<?> getExamSchedulesByDepartmentAndDateRange(
        @PathVariable Long departmentId,
        @RequestParam LocalDate startDate,
        @RequestParam LocalDate endDate) {
        try {
            List<ExamSchedule> schedules = examScheduleService
                .getExamSchedulesByDepartmentAndDateRange(departmentId, startDate, endDate);
            List<ExamScheduleDTO> dtos = schedules.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error fetching exam schedules: " + e.getMessage());
        }
    }

    /**
     * Search exam schedules by subject name
     */
    @GetMapping("/search/subject")
    public ResponseEntity<?> searchBySubject(@RequestParam String subjectName) {
        try {
            List<ExamSchedule> schedules = examScheduleService.searchBySubject(subjectName);
            List<ExamScheduleDTO> dtos = schedules.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error searching exam schedules: " + e.getMessage());
        }
    }

    /**
     * Get exam schedules by course code
     */
    @GetMapping("/course/{courseCode}")
    public ResponseEntity<?> getExamSchedulesByCourseCode(@PathVariable String courseCode) {
        try {
            List<ExamSchedule> schedules = examScheduleService.getExamSchedulesByCourseCode(courseCode);
            List<ExamScheduleDTO> dtos = schedules.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error fetching exam schedules: " + e.getMessage());
        }
    }

    /**
     * Update exam schedule
     */
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateExamSchedule(
        @PathVariable Long id,
        @RequestBody ExamScheduleDTO dto) {
        try {
            ExamSchedule schedule = new ExamSchedule();
            schedule.setSubjectName(dto.getSubjectName());
            schedule.setCourseCode(dto.getCourseCode());
            schedule.setExamDate(dto.getExamDate());
            schedule.setStartTime(dto.getStartTime());
            schedule.setEndTime(dto.getEndTime());
            schedule.setHallNumber(dto.getHallNumber());
            schedule.setRemarks(dto.getRemarks());

            ExamSchedule updatedSchedule = examScheduleService.updateExamSchedule(id, schedule);
            return ResponseEntity.ok(convertToDTO(updatedSchedule));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error updating exam schedule: " + e.getMessage());
        }
    }

    /**
     * Delete exam schedule
     */
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteExamSchedule(@PathVariable Long id) {
        try {
            examScheduleService.deleteExamSchedule(id);
            return ResponseEntity.ok("Exam schedule deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error deleting exam schedule: " + e.getMessage());
        }
    }

    /**
     * Delete exam schedule by department (for HOD access control)
     */
    @DeleteMapping("/delete/{departmentId}/{examScheduleId}")
    public ResponseEntity<?> deleteExamScheduleByDepartment(
        @PathVariable Long departmentId,
        @PathVariable Long examScheduleId) {
        try {
            examScheduleService.deleteExamScheduleByDepartmentAndId(departmentId, examScheduleId);
            return ResponseEntity.ok("Exam schedule deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error deleting exam schedule: " + e.getMessage());
        }
    }

    /**
     * Get exam schedules by department name
     */
    @GetMapping("/department-name/{departmentName}")
    public ResponseEntity<?> getExamSchedulesByDepartmentName(@PathVariable String departmentName) {
        try {
            List<ExamSchedule> schedules = examScheduleService.getExamSchedulesByDepartmentName(departmentName);
            List<ExamScheduleDTO> dtos = schedules.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error fetching exam schedules: " + e.getMessage());
        }
    }

    /**
     * Convert ExamSchedule entity to DTO
     */
    private ExamScheduleDTO convertToDTO(ExamSchedule schedule) {
        ExamScheduleDTO dto = new ExamScheduleDTO();
        dto.setId(schedule.getId());
        dto.setDepartmentId(schedule.getDepartment().getId());
        dto.setDepartmentName(schedule.getDepartment().getName());
        dto.setSubjectName(schedule.getSubjectName());
        dto.setCourseCode(schedule.getCourseCode());
        dto.setExamDate(schedule.getExamDate());
        dto.setStartTime(schedule.getStartTime());
        dto.setEndTime(schedule.getEndTime());
        dto.setHallNumber(schedule.getHallNumber());
        dto.setHodId(schedule.getHod().getId());
        dto.setHodName(schedule.getHod().getName());
        dto.setCreatedDate(schedule.getCreatedDate());
        dto.setUpdatedDate(schedule.getUpdatedDate());
        dto.setRemarks(schedule.getRemarks());
        return dto;
    }
}
