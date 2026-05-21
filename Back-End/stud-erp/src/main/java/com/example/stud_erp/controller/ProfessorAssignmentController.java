package com.example.stud_erp.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.stud_erp.exception.CustomException;
import com.example.stud_erp.payload.AssignSubjectsRequest;
import com.example.stud_erp.payload.ProfessorAssignmentDTO;
import com.example.stud_erp.service.ProfessorAssignmentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/professor-assignments")
@CrossOrigin("*")
public class ProfessorAssignmentController {

    @Autowired
    private ProfessorAssignmentService assignmentService;

    @PostMapping("/assign")
    public ResponseEntity<?> assignSubjectsToProfessor(
            @Valid @RequestBody AssignSubjectsRequest request,
            @RequestParam Long hodId) {
        try {
            if (hodId == null || hodId <= 0) {
                return ResponseEntity.badRequest().body(createErrorResponse("Invalid HOD ID"));
            }
            ProfessorAssignmentDTO assignment = assignmentService.assignSubjectsToProfessor(request, hodId);
            return ResponseEntity.status(HttpStatus.CREATED).body(assignment);
        } catch (CustomException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to assign subjects: " + e.getMessage()));
        }
    }

    @GetMapping("/professor/{professorId}")
    public ResponseEntity<?> getProfessorAssignments(
            @PathVariable Long professorId) {
        try {
            if (professorId == null || professorId <= 0) {
                return ResponseEntity.badRequest().body(createErrorResponse("Invalid Professor ID"));
            }
            List<ProfessorAssignmentDTO> assignments = assignmentService.getProfessorAssignments(professorId);
            return ResponseEntity.ok(assignments);
        } catch (CustomException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to fetch professor assignments: " + e.getMessage()));
        }
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<?> getAssignmentsByCourse(
            @PathVariable Long courseId) {
        try {
            if (courseId == null || courseId <= 0) {
                return ResponseEntity.badRequest().body(createErrorResponse("Invalid Course ID"));
            }
            List<ProfessorAssignmentDTO> assignments = assignmentService.getAssignmentsByCourse(courseId);
            return ResponseEntity.ok(assignments);
        } catch (CustomException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to fetch course assignments: " + e.getMessage()));
        }
    }

    @GetMapping("/course/{courseId}/semester/{semester}")
    public ResponseEntity<?> getAssignmentsByCourseAndSemester(
            @PathVariable Long courseId,
            @PathVariable String semester) {
        try {
            if (courseId == null || courseId <= 0) {
                return ResponseEntity.badRequest().body(createErrorResponse("Invalid Course ID"));
            }
            if (semester == null || semester.isBlank()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Invalid Semester"));
            }
            List<ProfessorAssignmentDTO> assignments = assignmentService.getAssignmentsByCourseAndSemester(courseId, semester);
            return ResponseEntity.ok(assignments);
        } catch (CustomException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to fetch course-semester assignments: " + e.getMessage()));
        }
    }

    @GetMapping("/professor/{professorId}/course/{courseId}/semester/{semester}")
    public ResponseEntity<?> getAssignmentByCourseAndSemester(
            @PathVariable Long professorId,
            @PathVariable Long courseId,
            @PathVariable String semester) {
        try {
            if (professorId == null || professorId <= 0) {
                return ResponseEntity.badRequest().body(createErrorResponse("Invalid Professor ID"));
            }
            if (courseId == null || courseId <= 0) {
                return ResponseEntity.badRequest().body(createErrorResponse("Invalid Course ID"));
            }
            if (semester == null || semester.isBlank()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Invalid Semester"));
            }
            ProfessorAssignmentDTO assignment = assignmentService.getAssignmentByCourseAndSemester(courseId, semester, professorId);
            return ResponseEntity.ok(assignment);
        } catch (CustomException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to fetch assignment: " + e.getMessage()));
        }
    }

    @GetMapping("/professor/{professorId}/subjects/{courseId}/{semester}")
    public ResponseEntity<?> getProfessorSubjectsForSemester(
            @PathVariable Long professorId,
            @PathVariable Long courseId,
            @PathVariable String semester) {
        try {
            if (professorId == null || professorId <= 0) {
                return ResponseEntity.badRequest().body(createErrorResponse("Invalid Professor ID"));
            }
            if (courseId == null || courseId <= 0) {
                return ResponseEntity.badRequest().body(createErrorResponse("Invalid Course ID"));
            }
            if (semester == null || semester.isBlank()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Invalid Semester"));
            }
            List<Long> subjectIds = assignmentService.getProfessorSubjectsForSemester(professorId, courseId, semester);
            return ResponseEntity.ok(subjectIds);
        } catch (CustomException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to fetch professor subjects: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{assignmentId}")
    public ResponseEntity<?> deleteAssignment(@PathVariable Long assignmentId) {
        try {
            if (assignmentId == null || assignmentId <= 0) {
                return ResponseEntity.badRequest().body(createErrorResponse("Invalid Assignment ID"));
            }
            assignmentService.deleteAssignment(assignmentId);
            return ResponseEntity.noContent().build();
        } catch (CustomException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to delete assignment: " + e.getMessage()));
        }
    }

    private Map<String, String> createErrorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        return error;
    }
}

