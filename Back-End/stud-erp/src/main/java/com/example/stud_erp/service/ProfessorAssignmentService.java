package com.example.stud_erp.service;

import com.example.stud_erp.entity.ProfessorAssignment;
import com.example.stud_erp.entity.Professor;
import com.example.stud_erp.entity.Course;
import com.example.stud_erp.entity.Subject;
import com.example.stud_erp.entity.HOD;
import com.example.stud_erp.exception.CustomException;
import com.example.stud_erp.payload.AssignSubjectsRequest;
import com.example.stud_erp.payload.ProfessorAssignmentDTO;
import com.example.stud_erp.repository.ProfessorAssignmentRepository;
import com.example.stud_erp.repository.ProfessorRepository;
import com.example.stud_erp.repository.CourseRepository;
import com.example.stud_erp.repository.SubjectRepository;
import com.example.stud_erp.repository.HODRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Optional;

@Service
@Transactional
public class ProfessorAssignmentService {

    @Autowired
    private ProfessorAssignmentRepository assignmentRepository;

    @Autowired
    private ProfessorRepository professorRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private HODRepository hodRepository;

    public ProfessorAssignmentDTO assignSubjectsToProfessor(AssignSubjectsRequest request, Long hodId) {
        Professor professor = professorRepository.findById(request.getProfessorId())
                .orElseThrow(() -> new CustomException("Professor not found"));

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new CustomException("Course not found"));

        HOD hod = hodRepository.findById(hodId)
                .orElseThrow(() -> new CustomException("HOD not found"));

        if (request.getSubjectIds() == null || request.getSubjectIds().isEmpty()) {
            throw new CustomException("At least one subject must be selected");
        }

        // Defensive: frontend might send null elements inside subjectIds.
        // Otherwise Spring Data throws: "The given id must not be null".
        List<Long> subjectIds = request.getSubjectIds().stream()
                .filter(id -> id != null)
                .distinct()
                .collect(Collectors.toList());

        if (subjectIds.isEmpty()) {
            throw new CustomException("At least one valid subject id must be selected");
        }

        // Validate that all provided subjectIds exist.
        List<Subject> existingSubjects = subjectRepository.findAllById(subjectIds);
        if (existingSubjects.size() != subjectIds.size()) {
            throw new CustomException("Invalid subject id(s) provided");
        }


        // Verify professor belongs to HOD's department.
        // NOTE: Some data models in this project store department on Professor as departmentName
        // and may not populate professor.department (JPA relation).
        // We validate using department ids when available, otherwise fall back to departmentName.
        boolean belongs;
        if (professor.getDepartment() != null && hod.getDepartment() != null) {
            belongs = professor.getDepartment().getId().equals(hod.getDepartment().getId());
        } else {
            String profDeptName = professor.getDepartmentName();
            String hodDeptName = hod.getDepartment() != null ? hod.getDepartment().getName() : null;
            belongs = profDeptName != null && hodDeptName != null && profDeptName.trim().equalsIgnoreCase(hodDeptName.trim());
        }

        if (!belongs) {
            throw new CustomException("Professor does not belong to your department");
        }


        // Delete existing assignment if it exists
        Optional<ProfessorAssignment> existingAssignment = assignmentRepository
                .findByProfessorAndCourseAndSemester(professor, course, request.getSemester());
        if (existingAssignment.isPresent()) {
            assignmentRepository.delete(existingAssignment.get());
        }

        // Create new assignment
        ProfessorAssignment assignment = new ProfessorAssignment();
        assignment.setProfessor(professor);
        assignment.setCourse(course);
        assignment.setSemester(request.getSemester());
        assignment.setSubjectIds(subjectIds);

        assignment.setAssignedBy(hod);

        ProfessorAssignment saved = assignmentRepository.save(assignment);
        return convertToDTO(saved);

    }

    public ProfessorAssignmentDTO getAssignmentByCourseAndSemester(Long courseId, String semester, Long professorId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new CustomException("Course not found"));

        Professor professor = professorRepository.findById(professorId)
                .orElseThrow(() -> new CustomException("Professor not found"));

        ProfessorAssignment assignment = assignmentRepository
                .findByProfessorAndCourseAndSemester(professor, course, semester)
                .orElse(null);

        return assignment != null ? convertToDTO(assignment) : null;
    }

    public List<ProfessorAssignmentDTO> getProfessorAssignments(Long professorId) {
        Professor professor = professorRepository.findById(professorId)
                .orElseThrow(() -> new CustomException("Professor not found"));

        List<ProfessorAssignment> assignments = assignmentRepository.findByProfessor(professor);
        return assignments.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<ProfessorAssignmentDTO> getAssignmentsByCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new CustomException("Course not found"));

        List<ProfessorAssignment> assignments = assignmentRepository.findByCourse(course);
        return assignments.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<ProfessorAssignmentDTO> getAssignmentsByCourseAndSemester(Long courseId, String semester) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new CustomException("Course not found"));

        List<ProfessorAssignment> assignments = assignmentRepository.findByCourseAndSemester(course, semester);
        return assignments.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public void deleteAssignment(Long assignmentId) {
        ProfessorAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new CustomException("Assignment not found"));
        assignmentRepository.delete(assignment);
    }

    public List<Long> getProfessorSubjectsForSemester(Long professorId, Long courseId, String semester) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new CustomException("Course not found"));

        Professor professor = professorRepository.findById(professorId)
                .orElseThrow(() -> new CustomException("Professor not found"));

        Optional<ProfessorAssignment> assignment = assignmentRepository
                .findByProfessorAndCourseAndSemester(professor, course, semester);

        return assignment.map(ProfessorAssignment::getSubjectIds).orElse(List.of());
    }

    private ProfessorAssignmentDTO convertToDTO(ProfessorAssignment assignment) {
        ProfessorAssignmentDTO dto = new ProfessorAssignmentDTO();
        dto.setId(assignment.getId());
        dto.setProfessorId(assignment.getProfessor().getId());
        dto.setProfessorName(assignment.getProfessor().getName());
        dto.setCourseId(assignment.getCourse().getId());
        dto.setCourseName(assignment.getCourse().getName());
        dto.setSemester(assignment.getSemester());
        List<Long> subjectIds = assignment.getSubjectIds() == null
                ? List.of()
                : assignment.getSubjectIds().stream()
                        .filter(id -> id != null)
                        .collect(Collectors.toList());
        dto.setSubjectIds(subjectIds);

        // Fetch subject names
        if (!subjectIds.isEmpty()) {
            List<String> subjectNames = subjectIds.stream()
                    .map(subjectId -> subjectRepository.findById(subjectId)
                            .map(Subject::getName)
                            .orElse("Unknown"))
                    .collect(Collectors.toList());
            dto.setSubjectNames(subjectNames);
        }


        dto.setCreatedAt(assignment.getCreatedAt());
        dto.setUpdatedAt(assignment.getUpdatedAt());
        return dto;
    }

    /**
     * Get assignments filtered by department
     */
    public List<ProfessorAssignmentDTO> getAssignmentsByDepartment(Long departmentId) {
        List<ProfessorAssignment> assignments = assignmentRepository.findAll().stream()
                .filter(a -> a.getCourse().getDepartment() != null &&
                        a.getCourse().getDepartment().getId().equals(departmentId))
                .collect(Collectors.toList());
        return assignments.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    /**
     * Get unassigned professors in a department
     */
    public List<Professor> getUnassignedProfessorsInDepartment(Long departmentId) {
        List<Professor> allProfessors = professorRepository.findByDepartmentId(departmentId);
        return allProfessors.stream()
                .filter(p -> assignmentRepository.findByProfessor(p).isEmpty())
                .collect(Collectors.toList());
    }
}
