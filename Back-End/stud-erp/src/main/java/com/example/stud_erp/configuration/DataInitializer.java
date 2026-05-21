package com.example.stud_erp.configuration;

import java.time.LocalDate;
import java.util.List;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.example.stud_erp.entity.Course;
import com.example.stud_erp.entity.Department;
import com.example.stud_erp.entity.HOD;
import com.example.stud_erp.entity.Professor;
import com.example.stud_erp.entity.Role;
import com.example.stud_erp.entity.Student;
import com.example.stud_erp.repository.CourseRepository;
import com.example.stud_erp.repository.DepartmentRepository;
import com.example.stud_erp.repository.HODRepository;
import com.example.stud_erp.repository.ProfessorRepository;
import com.example.stud_erp.repository.RoleRepository;
import com.example.stud_erp.repository.StudentRepository;

@Component
@Transactional
public class DataInitializer implements ApplicationRunner {

    private final RoleRepository roleRepository;
    private final HODRepository hodRepository;
    private final StudentRepository studentRepository;
    private final ProfessorRepository professorRepository;
    private final DepartmentRepository departmentRepository;
    private final CourseRepository courseRepository;

    public DataInitializer(RoleRepository roleRepository,
                           HODRepository hodRepository,
                           StudentRepository studentRepository,
                           ProfessorRepository professorRepository,
                           DepartmentRepository departmentRepository,
                           CourseRepository courseRepository) {
        this.roleRepository = roleRepository;
        this.hodRepository = hodRepository;
        this.studentRepository = studentRepository;
        this.professorRepository = professorRepository;
        this.departmentRepository = departmentRepository;
        this.courseRepository = courseRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!hasAnyCoreData()) {
            seedRoles();
            seedDepartments();
            seedHodAccount();
            seedStudentAccount();
            seedProfessorAccount();
        }
        seedCoursesAndSubjects();
    }

    private boolean hasAnyCoreData() {
        return roleRepository.count() > 0
                || departmentRepository.count() > 0
                || hodRepository.count() > 0
                || studentRepository.count() > 0
                || professorRepository.count() > 0;
    }

    private void seedRoles() {
        createRoleIfMissing("ROLE_HOD");
        createRoleIfMissing("ROLE_STUDENT");
        createRoleIfMissing("ROLE_PROFESSOR");
    }

    private void seedDepartments() {
        createDepartmentIfMissing("Computer Science");
        createDepartmentIfMissing("Information Technology");
        createDepartmentIfMissing("Mechanical Engineering");
        createDepartmentIfMissing("Electrical Engineering");
    }

    private void createDepartmentIfMissing(String name) {
        if (departmentRepository.findAll().stream().noneMatch(d -> d.getName().equals(name))) {
            Department department = new Department();
            department.setName(name);
            departmentRepository.save(department);
        }
    }

    private Department findOrCreateDepartment(String name) {
        return departmentRepository.findByName(name)
                .orElseGet(() -> {
                    Department department = new Department();
                    department.setName(name);
                    return departmentRepository.save(department);
                });
    }

    private void createRoleIfMissing(String roleName) {
        if (roleRepository.findByRole(roleName) == null) {
            Role role = new Role();
            role.setName(roleName.replace("ROLE_", ""));
            role.setRole(roleName);
            roleRepository.save(role);
        }
    }

    private void seedHodAccount() {
        if (hodRepository.findByUsername("ankush") == null) {
            HOD hod = new HOD();
            hod.setName("Ankush HOD");
            hod.setUsername("ankush");
            hod.setPassword("tan123");
            hod.setEmail("ankush.hod@example.com");
            hod.setPhone("9876543210");
            hod.setDepartment(findOrCreateDepartment("Computer Science"));
            hod.setImageUrl("");
            hod.setSubjects(List.of("Mathematics"));
            hodRepository.save(hod);
        }
    }

    private void seedStudentAccount() {
        if (studentRepository.findByUsername("ankush") == null) {
            Student student = new Student();
            student.setStudentId("STU-ANKUSH");
            student.setUsername("ankush");
            student.setPassword("tan123");
            student.setEmail("ankush.student@example.com");
            student.setMajor("Computer Science");
            student.setYear(2);
            student.setStudRollNo(1001L);
            student.setStudName("Ankush");
            student.setStudFatherName("Arvind");
            student.setStudLastName("Sharma");
            student.setStudPhoneNumber("9876543211");
            student.setStudentDob(LocalDate.of(2004, 1, 1));
            student.setStudCategory("General");
            student.setStudCaste("None");
            student.setStudentAge(20);
            student.setImageUrl("");
            studentRepository.save(student);
        }
    }

    private void seedProfessorAccount() {
        if (professorRepository.findByUsername("ankush") == null) {
            Professor professor = new Professor();
            professor.setProfessorId("PROF-ANKUSH");
            professor.setName("Ankush Professor");
            professor.setUsername("ankush");
            professor.setPassword("tan123");
            professor.setEmail("ankush.professor@example.com");
            professor.setSubject("Computer Science");
            professor.setDepartmentName("Computer Science");
            professor.setImageUrl("");
            professor.setSubjects(List.of("Algorithms", "Data Structures"));
            professorRepository.save(professor);
        }
    }

    private void seedCoursesAndSubjects() {
        Department csDept = findOrCreateDepartment("Computer Science");

        if (courseRepository.findByCode("BCA").isEmpty()) {
            Course course = new Course();
            course.setCode("BCA");
            course.setName("Bachelor of Computer Applications");
            course.setCredits(120);
            course.setDescription("3-Year Bachelor of Computer Applications Program");
            course.setDepartment(csDept);
            courseRepository.save(course);
        }
    }
}
