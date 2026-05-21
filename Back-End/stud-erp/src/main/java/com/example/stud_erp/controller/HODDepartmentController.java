package com.example.stud_erp.controller;

import com.example.stud_erp.payload.*;
import com.example.stud_erp.service.HODService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * HOD Department Management Controller
 * Provides endpoints for HOD to manage their department, professors, students, and assignments
 */
@RestController
@RequestMapping("/api/hod/department")
@CrossOrigin("*")
public class HODDepartmentController {

    @Autowired
    private HODService hodService;

    /**
     * Get HOD dashboard information with department statistics
     */
    @GetMapping("/info/{hodId}")
    public ResponseEntity<HODDTO> getHODInfo(@PathVariable Long hodId) {
        try {
            HODDTO hodInfo = hodService.getHODDashboardInfo(hodId);
            return ResponseEntity.ok(hodInfo);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Get all professors in HOD's department
     */
    @GetMapping("/professors/{hodId}")
    public ResponseEntity<List<ProfessorDTO>> getDepartmentProfessors(@PathVariable Long hodId) {
        try {
            List<ProfessorDTO> professors = hodService.getDepartmentProfessors(hodId);
            return ResponseEntity.ok(professors);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Get all students in HOD's department
     */
    @GetMapping("/students/{hodId}")
    public ResponseEntity<List<StudentDTO>> getDepartmentStudents(@PathVariable Long hodId) {
        try {
            List<StudentDTO> students = hodService.getDepartmentStudents(hodId);
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Get courses with SPPU syllabus for HOD's department
     */
    @GetMapping("/courses/{hodId}")
    public ResponseEntity<List<DepartmentCoursesDTO>> getDepartmentCourses(@PathVariable Long hodId) {
        try {
            List<DepartmentCoursesDTO> courses = hodService.getDepartmentCourses(hodId);
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Get simple course list for HOD's department (without SPPU details)
     */
    @GetMapping("/courses-simple/{hodId}")
    public ResponseEntity<List<CourseDTO>> getDepartmentCoursesSimple(@PathVariable Long hodId) {
        try {
            List<CourseDTO> courses = hodService.getDepartmentCoursesSimple(hodId);
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Get professor assignments for verification
     */
    @GetMapping("/professor-assignments/{hodId}/{professorId}")
    public ResponseEntity<List<ProfessorAssignmentDTO>> getProfessorAssignments(
            @PathVariable Long hodId,
            @PathVariable Long professorId) {
        try {
            List<ProfessorAssignmentDTO> assignments = hodService.getProfessorAssignments(hodId, professorId);
            return ResponseEntity.ok(assignments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Get department statistics and analytics
     */
    @GetMapping("/statistics/{hodId}")
    public ResponseEntity<Map<String, Object>> getDepartmentStatistics(@PathVariable Long hodId) {
        try {
            Map<String, Object> stats = hodService.getDepartmentStatistics(hodId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}
