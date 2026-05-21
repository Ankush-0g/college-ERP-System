package com.example.stud_erp.service;

import com.example.stud_erp.config.SPPUSyllabusConfig;
import com.example.stud_erp.entity.*;
import com.example.stud_erp.exception.OTPExpiredException;
import com.example.stud_erp.exception.ResourceNotFoundException;
import com.example.stud_erp.payload.*;
import com.example.stud_erp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@Transactional
public class HODService {

    @Autowired
    private HODRepository hodRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private ProfessorRepository professorRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ProfessorAssignmentRepository assignmentRepository;

    public HOD saveHOD(HOD hod) {
        if (hod.getPassword() != null) {
            // BCrypt hashes can start with $2a$, $2b$, or $2y$
            // Only encode if the value doesn't look like an existing bcrypt hash.
            boolean looksLikeBcrypt = hod.getPassword().startsWith("$2a$")
                    || hod.getPassword().startsWith("$2b$")
                    || hod.getPassword().startsWith("$2y$");
            if (!looksLikeBcrypt) {
                hod.setPassword(passwordEncoder.encode(hod.getPassword()));
            }
        }
        return hodRepository.save(hod);
    }

    public boolean existsByUsernameOrEmail(String username, String email) {
        return hodRepository.existsByUsernameOrEmail(username, email);
    }

    public List<HOD> getAllHODs() {
        return hodRepository.findAll();
    }

    public HOD getHODById(Long id) {
        return hodRepository.findById(id).orElse(null);
    }

    public void deleteHOD(Long id) {
        hodRepository.deleteById(id);
    }

    public HOD updateHOD(Long id, HOD hodDetails) {
        HOD hod = hodRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("HOD not found for this id :: " + id));

        hod.setName(hodDetails.getName());
        hod.setDepartment(hodDetails.getDepartment());
        hod.setUsername(hodDetails.getUsername());

        if (hodDetails.getPassword() != null) {
            String p = hodDetails.getPassword();
            boolean looksLikeBcrypt = p.startsWith("$2a$")
                    || p.startsWith("$2b$")
                    || p.startsWith("$2y$");
            if (!looksLikeBcrypt) {
                p = passwordEncoder.encode(p);
            }
            hod.setPassword(p);
        }

        hod.setEmail(hodDetails.getEmail());
        hod.setPhone(hodDetails.getPhone());
        hod.setSubjects(hodDetails.getSubjects());
        hod.setUpdatedAt(LocalDateTime.now());

        if (hodDetails.getImageUrl() != null) {
            hod.setImageUrl(hodDetails.getImageUrl());
        }

        return hodRepository.save(hod);
    }

    public HOD authenticateUser(LoginRequest loginRequest) {
        HOD user = hodRepository.findByUsername(loginRequest.getUsername());
        if (user == null) {
            throw new RuntimeException("Invalid username or password");
        }
        String stored = user.getPassword();
        boolean passwordMatches = stored != null && (stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$"))
                ? passwordEncoder.matches(loginRequest.getPassword(), stored)
                : loginRequest.getPassword().equals(stored);
        if (!passwordMatches) {
            throw new RuntimeException("Invalid username or password");
        }
        return user;
    }

    public void sendForgotPasswordEmail(String email) {
        HOD user = hodRepository.findByEmail(email);
        if (user == null) {
            throw new OTPExpiredException("User with email " + email + " not found");
        }

        String otp = generateOTP();
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(15));
        hodRepository.save(user);

        emailService.sendOtpEmail(user.getEmail(), otp);
    }

    private String generateOTP() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    public void verifyOTP(String email, String otp) {
        HOD user = hodRepository.findByEmail(email);
        if (user == null) {
            throw new OTPExpiredException("User with email " + email + " not found");
        }

        if (user.getOtpExpiry() != null && user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new OTPExpiredException("OTP has expired");
        }

        if (user.getOtp() == null || !user.getOtp().equals(otp)) {
            throw new OTPExpiredException("Invalid OTP");
        }
    }

    public void resetPassword(ResetPasswordRequest request) {
        HOD hod = hodRepository.findByEmail(request.getEmail());
        if (hod == null) {
            throw new OTPExpiredException("User with email " + request.getEmail() + " not found");
        }

        String newPass = request.getNewPassword();
        if (newPass != null) {
            boolean looksLikeBcrypt = newPass.startsWith("$2a$")
                    || newPass.startsWith("$2b$")
                    || newPass.startsWith("$2y$");
            if (!looksLikeBcrypt) {
                newPass = passwordEncoder.encode(newPass);
            }
        }
        hod.setPassword(newPass);
        hod.setOtp(null);
        hod.setOtpExpiry(null);
        hodRepository.save(hod);
    }

    // ============ Department-scoped methods ============

    public HODDTO getHODDashboardInfo(Long hodId) {
        HOD hod = hodRepository.findById(hodId)
                .orElseThrow(() -> new RuntimeException("HOD not found"));

        Department dept = hod.getDepartment();

        int professorsCount = (int) professorRepository.findAll().stream()
            .filter(professor -> isProfessorInDepartment(professor, dept))
            .count();
        // Student entity stores department as `major` in this schema.
        int studentsCount = (int) studentRepository.findAll().stream()
                .filter(s -> s.getMajor() != null && s.getMajor().equalsIgnoreCase(dept.getName()))
                .count();
        int coursesCount = courseRepository.findByDepartmentId(dept.getId()).size();

        return new HODDTO(
                hod.getId(),
                hod.getName(),
                hod.getEmail(),
                hod.getPhone(),
                hod.getImageUrl(),
                dept.getId(),
                dept.getName(),
                dept.getDepartmentType(),
                professorsCount,
                studentsCount,
                coursesCount
        );
    }

    public List<ProfessorDTO> getDepartmentProfessors(Long hodId) {
        HOD hod = hodRepository.findById(hodId)
                .orElseThrow(() -> new RuntimeException("HOD not found"));

        Department dept = hod.getDepartment();
        List<Professor> professors = professorRepository.findAll().stream()
            .filter(professor -> isProfessorInDepartment(professor, dept))
            .collect(Collectors.toList());

        return professors.stream()
                .map(this::convertToProfessorDTO)
                .collect(Collectors.toList());
    }

    public List<StudentDTO> getDepartmentStudents(Long hodId) {
        HOD hod = hodRepository.findById(hodId)
                .orElseThrow(() -> new RuntimeException("HOD not found"));

        Department dept = hod.getDepartment();
        List<Student> students = studentRepository.findAll().stream()
                .filter(s -> s.getMajor() != null && s.getMajor().equalsIgnoreCase(dept.getName()))
                .collect(Collectors.toList());

        return students.stream()
                .map(this::convertToStudentDTO)
                .collect(Collectors.toList());
    }

    public List<DepartmentCoursesDTO> getDepartmentCourses(Long hodId) {
        HOD hod = hodRepository.findById(hodId)
                .orElseThrow(() -> new RuntimeException("HOD not found"));

        Department dept = hod.getDepartment();
        String courseCode = SPPUSyllabusConfig.DEPARTMENT_TO_COURSE_CODE.get(dept.getName());
        if (courseCode == null) {
            throw new RuntimeException("Invalid department type");
        }

        List<Course> courses = courseRepository.findByDepartmentId(dept.getId());
        List<DepartmentCoursesDTO> result = new ArrayList<>();

        for (Course course : courses) {
            DepartmentCoursesDTO courseDTO = new DepartmentCoursesDTO();
            courseDTO.setDepartmentId(dept.getId());
            courseDTO.setDepartmentName(dept.getName());
            courseDTO.setDepartmentType(dept.getDepartmentType());
            courseDTO.setCourseId(course.getId());
            courseDTO.setCourseCode(course.getCode());
            courseDTO.setCourseName(course.getName());

            List<SemesterSubjectsDTO> semestersList = new ArrayList<>();
            List<Integer> semesters = SPPUSyllabusConfig.getSemestersForCourse(courseCode);

            for (Integer semesterNumber : semesters) {
                // Get subject names from official SPPU mapping
                List<String> subjectNames = SPPUSyllabusConfig.getSubjectsForCourseSemester(courseCode, semesterNumber);

                // CRITICAL FIX: Fetch subjects from database with real IDs
                // Query: match subject names from SPPU config to actual database Subject records
                List<Subject> subjectsInDb = subjectRepository.findByCourseSemester(course.getId(), String.valueOf(semesterNumber));

                // Map subject names to DTOs with real database IDs (matching approach in HODController)
                List<SubjectDTO> subjects = subjectNames.stream()
                        .map(subjectName -> {
                            Subject matched = subjectsInDb.stream()
                                    .filter(s -> s.getName() != null && s.getName().equalsIgnoreCase(subjectName))
                                    .findFirst()
                                    .orElse(null);

                            SubjectDTO dto = new SubjectDTO();
                            if (matched != null) {
                                // Subject found in database - use real ID
                                dto.setId(matched.getId());
                                dto.setCode(matched.getCode());
                                dto.setName(matched.getName());
                                dto.setCredits(matched.getCredits());
                                dto.setGrade(matched.getGrade());
                                dto.setCt1(matched.getCt1());
                                dto.setCt2(matched.getCt2());
                                dto.setTheory(matched.getTheory());
                                if (matched.getSemester() != null) {
                                    SemesterDTO semDTO = new SemesterDTO();
                                    semDTO.setId(matched.getSemester().getId());
                                    semDTO.setSemester(matched.getSemester().getSemester());
                                    dto.setSemester(semDTO);
                                }
                            } else {
                                // Subject not found in database (seeding may be needed)
                                System.err.println("[HODService] Missing Subject row in DB for courseId=" + course.getId() +
                                        " semester=" + semesterNumber + " name='" + subjectName + "'");
                                dto.setId(null);
                                dto.setCode(null);
                                dto.setName(subjectName);
                                dto.setCredits(0);
                                dto.setGrade(null);
                                dto.setCt1(0);
                                dto.setCt2(0);
                                dto.setTheory(0);
                                dto.setSemester(null);
                            }
                            return dto;
                        })
                        .collect(Collectors.toList());

                SemesterSubjectsDTO semesterDTO = new SemesterSubjectsDTO(semesterNumber, subjects);
                semestersList.add(semesterDTO);
            }

            courseDTO.setSemesters(semestersList);
            result.add(courseDTO);
        }

        return result;
    }

    public List<CourseDTO> getDepartmentCoursesSimple(Long hodId) {
        HOD hod = hodRepository.findById(hodId)
                .orElseThrow(() -> new RuntimeException("HOD not found"));

        Department dept = hod.getDepartment();
        List<Course> courses = courseRepository.findByDepartmentId(dept.getId());

        return courses.stream()
                .map(this::convertToCourseDTO)
                .collect(Collectors.toList());
    }

    public List<ProfessorAssignmentDTO> getProfessorAssignments(Long hodId, Long professorId) {
        HOD hod = hodRepository.findById(hodId)
                .orElseThrow(() -> new RuntimeException("HOD not found"));

        Professor professor = professorRepository.findById(professorId)
                .orElseThrow(() -> new RuntimeException("Professor not found"));

        // Verify professor belongs to HOD's department
        if (professor.getDepartment() == null || !professor.getDepartment().getId().equals(hod.getDepartment().getId())) {
            throw new RuntimeException("Professor does not belong to your department");
        }

        List<ProfessorAssignment> assignments = assignmentRepository.findByProfessor(professor);
        return assignments.stream()
                .map(this::convertToAssignmentDTO)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getDepartmentStatistics(Long hodId) {
        HOD hod = hodRepository.findById(hodId)
                .orElseThrow(() -> new RuntimeException("HOD not found"));

        Department dept = hod.getDepartment();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("departmentName", dept.getName());
        stats.put("hodName", hod.getName());

        List<Professor> professors = professorRepository.findAll().stream()
            .filter(professor -> isProfessorInDepartment(professor, dept))
            .collect(Collectors.toList());
        stats.put("totalProfessors", professors.size());

        int totalStudents = (int) studentRepository.findAll().stream()
                .filter(s -> s.getMajor() != null && s.getMajor().equalsIgnoreCase(dept.getName()))
                .count();
        stats.put("totalStudents", totalStudents);

        int totalCourses = courseRepository.findByDepartmentId(dept.getId()).size();
        stats.put("totalCourses", totalCourses);

        long totalAssignments = assignmentRepository.findAll().stream()
                .filter(a -> a.getAssignedBy() != null && a.getAssignedBy().getId().equals(hodId))
                .count();
        stats.put("totalAssignments", totalAssignments);

        long unassignedCount = professors.stream()
                .filter(p -> assignmentRepository.findByProfessor(p).isEmpty())
                .count();
        stats.put("unassignedProfessors", unassignedCount);

        return stats;
    }

    // Helper mappers

    private ProfessorDTO convertToProfessorDTO(Professor professor) {
        // ProfessorDTO in this repo only stores (id, name)
        return new ProfessorDTO(professor.getId(), professor.getName());
    }

    private boolean isProfessorInDepartment(Professor professor, Department department) {
        if (professor == null || department == null) {
            return false;
        }

        if (professor.getDepartment() != null && professor.getDepartment().getId() != null) {
            return professor.getDepartment().getId().equals(department.getId());
        }

        String professorDepartmentName = professor.getDepartmentName();
        String departmentName = department.getName();
        return professorDepartmentName != null && departmentName != null
                && professorDepartmentName.trim().equalsIgnoreCase(departmentName.trim());
    }


    private StudentDTO convertToStudentDTO(Student student) {
        // StudentDTO constructor used across the codebase takes many fields.
        // We populate the ones available in Student entity, leaving the rest null/0.
        return new StudentDTO(
                student.getId(),
                student.getStudentId(),
                student.getUsername(),
                student.getEmail(),
                student.getMajor(),
                student.getYear(),
                student.getStudRollNo(),
                student.getStudName(),
                student.getStudFatherName(),
                student.getStudLastName(),
                student.getStudPhoneNumber()
        );
    }


    private CourseDTO convertToCourseDTO(Course course) {
        return new CourseDTO(
                course.getId(),
                course.getCode(),
                course.getName(),
                course.getCredits(),
                course.getProfessor() == null ? null : new ProfessorDTO(course.getProfessor().getId(), course.getProfessor().getName())
        );
    }

    private ProfessorAssignmentDTO convertToAssignmentDTO(ProfessorAssignment assignment) {
        ProfessorAssignmentDTO dto = new ProfessorAssignmentDTO();
        dto.setId(assignment.getId());
        dto.setProfessorId(assignment.getProfessor().getId());
        dto.setProfessorName(assignment.getProfessor().getName());
        dto.setCourseId(assignment.getCourse().getId());
        dto.setCourseName(assignment.getCourse().getName());
        dto.setSemester(assignment.getSemester());
        dto.setSubjectIds(assignment.getSubjectIds());
        dto.setCreatedAt(assignment.getCreatedAt());
        dto.setUpdatedAt(assignment.getUpdatedAt());

        List<String> subjectNames = assignment.getSubjectIds() == null ? List.of() : assignment.getSubjectIds().stream()
                .map(subId -> subjectRepository.findById(subId)
                        .map(Subject::getName)
                        .orElse("Unknown"))
                .collect(Collectors.toList());
        dto.setSubjectNames(subjectNames);

        return dto;
    }
}

