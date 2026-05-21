package com.example.stud_erp.payload;

import java.util.List;

public class ProfessorAttendanceEligibilityDTO {

    private String departmentName;
    private List<String> subjects;
    private List<StudentAttendanceEligibilityRowDTO> students;

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public List<String> getSubjects() {
        return subjects;
    }

    public void setSubjects(List<String> subjects) {
        this.subjects = subjects;
    }

    public List<StudentAttendanceEligibilityRowDTO> getStudents() {
        return students;
    }

    public void setStudents(List<StudentAttendanceEligibilityRowDTO> students) {
        this.students = students;
    }

    public static class StudentAttendanceEligibilityRowDTO {
        private Long studentId;
        private String studentName;

        public Long getStudentId() {
            return studentId;
        }

        public void setStudentId(Long studentId) {
            this.studentId = studentId;
        }

        public String getStudentName() {
            return studentName;
        }

        public void setStudentName(String studentName) {
            this.studentName = studentName;
        }
    }
}

