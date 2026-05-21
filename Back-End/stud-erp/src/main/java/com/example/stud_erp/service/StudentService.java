package com.example.stud_erp.service;

import com.example.stud_erp.entity.Student;
import com.example.stud_erp.exception.CustomException;
import com.example.stud_erp.exception.OTPExpiredException;
import com.example.stud_erp.payload.LoginRequest;
import com.example.stud_erp.payload.ResetPasswordRequest;
import com.example.stud_erp.payload.StudentDTO;
import com.example.stud_erp.repository.SemesterRepository;
import com.example.stud_erp.repository.StudentRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.LinkedHashMap;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;


@Service
@Transactional
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private SemesterRepository semesterRepository;

    @Autowired
    private com.example.stud_erp.repository.CourseRepository courseRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    @Cacheable("students")
    public List<StudentDTO> findAll() {
        List<Student> students = studentRepository.findAll();
        return students.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private StudentDTO convertToDTO(Student student) {
        StudentDTO dto = new StudentDTO();
        dto.setId(student.getId());
        dto.setStudentId(student.getStudentId());
        dto.setUsername(student.getUsername());
        dto.setEmail(student.getEmail());
        dto.setMajor(student.getMajor());
        dto.setYear(student.getYear());
        dto.setStudRollNo(student.getStudRollNo());
        dto.setStudName(student.getStudName());
        dto.setStudFatherName(student.getStudFatherName());
        dto.setStudLastName(student.getStudLastName());
        dto.setStudPhoneNumber(student.getStudPhoneNumber());
        dto.setStudentDob(student.getStudentDob());
        dto.setStudCategory(student.getStudCategory());
        dto.setStudCaste(student.getStudCaste());
        dto.setStudentAge(student.getStudentAge());
        dto.setImageUrl(student.getImageUrl());
        dto.setCourse(student.getCourse());
        dto.setSemester(student.getSemester());
        dto.setSubjects(student.getSubjects());
        return dto;
    }


    public Optional<Student> getStudentById(String id) {
        return Optional.ofNullable(studentRepository.findByStudentId(id));
    }

    public boolean existsByUniqueFields(String studentId, String username, String email, Long rollNo) {
        // Use a single query to check for existence by multiple fields
        return studentRepository.existsByStudentIdOrUsernameOrEmailOrStudRollNo(studentId, username, email, rollNo);
    }

    public Student addStudent(Student student) {
        try {
            if (student.getPassword() != null && !student.getPassword().startsWith("$2a$")) {
                student.setPassword(passwordEncoder.encode(student.getPassword()));
            }
            return studentRepository.save(student);
        } catch (DataIntegrityViolationException ex) {
            throw new CustomException("Student with the same ID, Roll Number, Username, or Email already exists.");
        }
    }

    public void deleteStudent(Long id) {
        studentRepository.deleteById(id);
    }

    public Student findByUsernameAndPassword(String username, String password) {
        return studentRepository.findByUsernameAndPassword(username, password);
    }

    public Student updateStudent(Long id, Student updatedStudent) {
        return studentRepository.findById(id).map(student -> {
            student.setUsername(updatedStudent.getUsername());
            if (updatedStudent.getPassword() != null) {
                String p = updatedStudent.getPassword();
                if (!p.startsWith("$2a$")) {
                    p = passwordEncoder.encode(p);
                }
                student.setPassword(p);
            }
            student.setEmail(updatedStudent.getEmail());
            student.setStudName(updatedStudent.getStudName());
            student.setStudFatherName(updatedStudent.getStudFatherName());
            student.setStudLastName(updatedStudent.getStudLastName());
            student.setStudPhoneNumber(updatedStudent.getStudPhoneNumber());
            student.setStudentDob(updatedStudent.getStudentDob());
            student.setMajor(updatedStudent.getMajor());
            student.setYear(updatedStudent.getYear());
            student.setStudCategory(updatedStudent.getStudCategory());
            student.setStudCaste(updatedStudent.getStudCaste());
            student.setStudentAge(updatedStudent.getStudentAge());
            student.setImageUrl(updatedStudent.getImageUrl());
            return studentRepository.save(student);
        }).orElseThrow(() -> new CustomException("Student not found with id " + id));
    }


    public Student authenticateUser(LoginRequest loginRequest) {
        Student user = studentRepository.findByUsername(loginRequest.getUsername());
        if (user == null) {
            throw new RuntimeException("Invalid username or password");
        }
        String stored = user.getPassword();
        boolean passwordMatches = false;
        if (stored != null && stored.startsWith("$2a$")) {
            passwordMatches = passwordEncoder.matches(loginRequest.getPassword(), stored);
        } else {
            passwordMatches = loginRequest.getPassword().equals(stored);
        }
        if (!passwordMatches) {
            throw new RuntimeException("Invalid username or password");
        }
        return user;
    }


    public void sendForgotPasswordEmail(String email) {
        Student user = studentRepository.findByEmail(email);
        if (user == null) {
            throw new OTPExpiredException("User with email " + email + " not found");
        }

        String otp = generateOTP();
        user.setOtp(otp);
        user.setOtpExpiry(java.time.LocalDateTime.now().plusMinutes(15));
        studentRepository.save(user);

        emailService.sendOtpEmail(user.getEmail(), otp);
    }

    private String generateOTP() {
        // Generate a random 6-digit OTP
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    public void verifyOTP(String email, String otp) {
        Student user = studentRepository.findByEmail(email);
        if (user == null) {
            throw new OTPExpiredException("User with email " + email + " not found");
        }

        if (user.getOtpExpiry() != null && user.getOtpExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new OTPExpiredException("OTP has expired");
        }

        if (user.getOtp() == null || !user.getOtp().equals(otp)) {
            throw new OTPExpiredException("Invalid OTP");
        }
    }

    public void resetPassword(ResetPasswordRequest request) {
        Student user = studentRepository.findByEmail(request.getEmail());
        if (user == null) {
            throw new OTPExpiredException("User with email " + request.getEmail() + " not found");
        }

        // Set the new password (not encrypted)
        String newPass = request.getNewPassword();
        if (newPass != null && !newPass.startsWith("$2a$")) {
            newPass = passwordEncoder.encode(newPass);
        }
        user.setPassword(newPass);
        studentRepository.save(user);
    }

    public List<StudentDTO> getStudentsByCourseAndSemester(String courseName, String semester) {
        List<Student> students = studentRepository.findByCourseAndSemester(courseName, semester);
        return students.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<StudentDTO> getStudentsByCourseIdAndSemester(Long courseId, String semester) {
        if (courseId == null || semester == null || semester.isBlank()) {
            return List.of();
        }

        String normalizedTargetSemester = normalizeSemester(semester);

        LinkedHashMap<Long, StudentDTO> uniqueStudents = new LinkedHashMap<>();
        semesterRepository.findByCourseIdWithStudent(courseId).stream()
                .filter(sem -> normalizeSemester(sem.getSemester()).equals(normalizedTargetSemester))
                .map(sem -> sem.getStudent())
                .filter(student -> student != null && student.getId() != null)
                .forEach(student -> uniqueStudents.putIfAbsent(student.getId(), convertToDTO(student)));

        // If no Semester rows are present (many students may be stored with course/semester on Student entity),
        // fallback to legacy studentRepository search using course name.
        if (uniqueStudents.isEmpty()) {
            try {
                var courseOpt = courseRepository.findById(courseId);
                if (courseOpt.isPresent()) {
                    var course = courseOpt.get();
                    String courseName = course.getName();
                    List<Student> students = studentRepository.findByCourseAndSemester(courseName, semester);
                    if (students.isEmpty() && course.getCode() != null && !course.getCode().isBlank()) {
                        students = studentRepository.findByCourseAndSemester(course.getCode(), semester);
                    }
                    students.stream().filter(s -> s != null && s.getId() != null)
                            .forEach(s -> uniqueStudents.putIfAbsent(s.getId(), convertToDTO(s)));
                }
            } catch (Exception ignored) {
            }
        }

        return List.copyOf(uniqueStudents.values());
    }

    private String normalizeSemester(String semesterValue) {
        if (semesterValue == null) {
            return "";
        }
        String trimmed = semesterValue.trim();
        String digits = trimmed.replaceAll("[^0-9]", "");
        return digits.isEmpty() ? trimmed.toLowerCase() : digits;
    }
}
