package com.example.stud_erp.controller;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.stud_erp.entity.Student;
import com.example.stud_erp.exception.CustomException;
import com.example.stud_erp.exception.OTPExpiredException;
import com.example.stud_erp.payload.ForgotPasswordRequest;
import com.example.stud_erp.payload.LoginRequest;
import com.example.stud_erp.payload.ResetPasswordRequest;
import com.example.stud_erp.payload.StudentDTO;
import com.example.stud_erp.repository.StudentRepository;
import com.example.stud_erp.service.ImageService;
import com.example.stud_erp.service.StudentService;
import java.util.List;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    @Autowired
    private StudentRepository studentRepository;


    @Autowired
    private StudentService studentService;

    @Autowired
    private ImageService imageService;

    @PostMapping("/add-student")
    public ResponseEntity<String> upload(@RequestParam("file") MultipartFile multipartFile,
                                         @RequestParam("studentId") String studentId,
                                         @RequestParam("username") String username,
                                         @RequestParam("password") String password,
                                         @RequestParam("email") String email,
                                         @RequestParam("name") String name,
                                         @RequestParam("fatherName") String fatherName,
                                         @RequestParam("lastName") String lastName,
                                         @RequestParam(value = "age", required = false) String age,
                                         @RequestParam(value = "dob", required = false) String dob,
                                         @RequestParam("caste") String caste,
                                         @RequestParam("category") String category,
                                         @RequestParam("major") String major,
                                         @RequestParam(value = "course", required = false) String course,
                                         @RequestParam(value = "semester", required = false) String semester,
                                         @RequestParam(value = "subjects", required = false) List<String> subjects,
                                         @RequestParam(value = "roll-no", required = false) String rollNoStr,
                                         @RequestParam(value = "year", required = false) String yearStr,
                                         @RequestParam("phone-number") String number) {
        try {
            // parse roll-no early for existence check
            Long rollNo = null;
            if (rollNoStr != null && !rollNoStr.isBlank()) {
                try {
                    rollNo = Long.parseLong(rollNoStr);
                } catch (NumberFormatException nfe) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid roll-no format");
                }
            }
            // Combined existence checks into a single method call
            boolean exists = studentService.existsByUniqueFields(studentId, username, email, rollNo);
            if (exists) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("A student with the same ID, Roll Number, Username, or Email already exists.");
            }

            // Create the Student object
            Student student = new Student();
            student.setStudentId(studentId);
            student.setUsername(username);
            student.setPassword(password);
            student.setEmail(email);
            student.setStudName(name);
            student.setStudFatherName(fatherName);
            student.setStudLastName(lastName);
            if (age != null && !age.isBlank()) {
                try {
                    student.setStudentAge(Integer.parseInt(age));
                } catch (NumberFormatException nfe) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid age format");
                }
            }
            if (dob != null && !dob.isBlank()) {
                try {
                    student.setStudentDob(parseStudentDob(dob));
                } catch (Exception ex) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid dob format, expected DD-MM-YY, DD-MM-YYYY, or YYYY-MM-DD");
                }
            }
            student.setMajor(major);
            student.setStudCaste(caste);
            student.setStudCategory(category);
            student.setCourse(course);
            student.setSemester(semester);

            if (subjects != null && !subjects.isEmpty()) {
                student.setSubjects(subjects);
            }

            // parse roll number and year defensively
            if (rollNoStr != null && !rollNoStr.isBlank()) {
                try {
                    student.setStudRollNo(Long.parseLong(rollNoStr));
                } catch (NumberFormatException nfe) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid roll-no format");
                }
            }
            student.setStudPhoneNumber(number);
            if (yearStr != null && !yearStr.isBlank()) {
                String trimmedYear = yearStr.trim();
                if (!trimmedYear.matches("\\d+")) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid year format, please enter numeric year only.");
                }
                try {
                    student.setYear(Integer.parseInt(trimmedYear));
                } catch (NumberFormatException nfe) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid year format, please enter numeric year only.");
                }
            }

            // Handle the image upload and save the student
            String imageUrl = imageService.uploadStudentData(multipartFile, student);
            student.setImageUrl(imageUrl);

            // Save the student object after uploading the image
            studentService.addStudent(student);

            return ResponseEntity.ok("Student data successfully uploaded");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error uploading student data");
        }
    }


    @GetMapping
    public List<StudentDTO> getAllStudents() {
        return studentService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable String id) {
        Optional<Student> student = studentService.getStudentById(id);
        return student.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(@PathVariable Long id, @RequestBody Student updatedStudent) {
        try {
            Student student = studentService.updateStudent(id, updatedStudent);
            return ResponseEntity.ok(student);
        } catch (CustomException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }



    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        if (studentRepository.existsById(id)) {
            studentRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }


    private LocalDate parseStudentDob(String dob) {
        DateTimeFormatter[] formatters = new DateTimeFormatter[] {
                DateTimeFormatter.ofPattern("dd-MM-yy"),
                DateTimeFormatter.ofPattern("dd-MM-yyyy"),
                DateTimeFormatter.ISO_LOCAL_DATE
        };

        for (DateTimeFormatter formatter : formatters) {
            try {
                return LocalDate.parse(dob, formatter);
            } catch (DateTimeParseException ignored) {
            }
        }
        throw new IllegalArgumentException("Unsupported date format");
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@Valid @RequestBody LoginRequest loginRequest , HttpServletResponse response) {
        try {
            Student authenticatedUser = studentService.authenticateUser(loginRequest);

//            if (authenticatedUser != null) {
//                Cookie cookie= new Cookie("userSession" ,authenticatedUser.getId().toString());
//                cookie.setHttpOnly(true);
//                cookie.setPath("/");
//                response.addCookie(cookie);
//
//            }
            return ResponseEntity.ok(authenticatedUser);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login failed: " + ex.getMessage());
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            studentService.sendForgotPasswordEmail(request.getEmail());
            return ResponseEntity.ok("OTP sent to your email successfully");
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + ex.getMessage());
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOTP(@RequestParam String email, @RequestParam String otp) {
        try {
            studentService.verifyOTP(email, otp);
            return ResponseEntity.ok("OTP verified successfully");
        } catch (OTPExpiredException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("OTP verification failed: " + ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + ex.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            studentService.resetPassword(request);
            return ResponseEntity.ok("Password reset successfully");
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + ex.getMessage());
        }
    }

    @GetMapping("/by-course-semester")
    public ResponseEntity<?> getStudentsByCourseAndSemester(
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) String courseName,
            @RequestParam String semester) {
        try {
            List<StudentDTO> students;
            if (courseId != null) {
                students = studentService.getStudentsByCourseIdAndSemester(courseId, semester);
            } else {
                if (courseName == null || courseName.isBlank()) {
                    return ResponseEntity.badRequest().body("courseId or courseName is required");
                }
                students = studentService.getStudentsByCourseAndSemester(courseName, semester);
            }
            return ResponseEntity.ok(students);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred: " + ex.getMessage());
        }
    }
}