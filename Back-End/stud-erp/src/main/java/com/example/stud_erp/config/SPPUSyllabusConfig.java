package com.example.stud_erp.config;

import java.util.*;

/**
 * SPPU (Savitribai Phule Pune University) Syllabus Configuration
 * Contains predefined courses and subjects for different departments
 */
public class SPPUSyllabusConfig {

    // BCA (Bachelor of Computer Applications)
    public static final Map<Integer, List<String>> BCA_SUBJECTS = new LinkedHashMap<>();
    static {
        BCA_SUBJECTS.put(1, Arrays.asList(
            "Applied Mathematics I",
            "C Programming",
            "English Communication",
            "Digital Fundamentals",
            "Business Communication"
        ));
        BCA_SUBJECTS.put(2, Arrays.asList(
            "Applied Mathematics II",
            "Data Structures",
            "Database Management System",
            "Web Programming",
            "Software Engineering"
        ));
        BCA_SUBJECTS.put(3, Arrays.asList(
            "Operating Systems",
            "Computer Networks",
            "Advanced Database Management",
            "Java Programming",
            "Web Development Technologies"
        ));
        BCA_SUBJECTS.put(4, Arrays.asList(
            "Artificial Intelligence",
            "Cloud Computing",
            "Project Management",
            "Mobile Application Development",
            "Information Security"
        ));
        BCA_SUBJECTS.put(5, Arrays.asList(
            "Cybersecurity",
            "IoT and Embedded Systems",
            "Big Data Analytics",
            "Capstone Project I",
            "Elective I"
        ));
        BCA_SUBJECTS.put(6, Arrays.asList(
            "Machine Learning",
            "Advanced Computer Networks",
            "Business Intelligence",
            "Capstone Project II",
            "Elective II"
        ));
    }

    // BSC (Bachelor of Science)
    public static final Map<Integer, List<String>> BSC_SUBJECTS = new LinkedHashMap<>();
    static {
        BSC_SUBJECTS.put(1, Arrays.asList(
            "Physics I",
            "Chemistry I",
            "Mathematics I",
            "English",
            "Basic Biology"
        ));
        BSC_SUBJECTS.put(2, Arrays.asList(
            "Physics II",
            "Chemistry II",
            "Mathematics II",
            "Botany",
            "Environmental Science Basics"
        ));
        BSC_SUBJECTS.put(3, Arrays.asList(
            "Zoology",
            "Biochemistry",
            "Mathematics III",
            "Microbiology",
            "Genetics"
        ));
        BSC_SUBJECTS.put(4, Arrays.asList(
            "Cell Biology",
            "Ecology",
            "Molecular Biology",
            "Plant Physiology",
            "Animal Physiology"
        ));
        BSC_SUBJECTS.put(5, Arrays.asList(
            "Environmental Science",
            "Biotechnology",
            "Research Methods",
            "Specialization I",
            "Project Work"
        ));
        BSC_SUBJECTS.put(6, Arrays.asList(
            "Advanced Biotechnology",
            "Seminar",
            "Specialization II",
            "Practical Training",
            "Thesis Work"
        ));
    }

    // BE (Bachelor of Engineering)
    public static final Map<Integer, List<String>> BE_SUBJECTS = new LinkedHashMap<>();
    static {
        BE_SUBJECTS.put(1, Arrays.asList(
            "Engineering Mathematics I",
            "Physics",
            "Chemistry",
            "English",
            "Basic Engineering Drawing"
        ));
        BE_SUBJECTS.put(2, Arrays.asList(
            "Engineering Mathematics II",
            "Mechanics",
            "Thermodynamics",
            "Basic Electronics",
            "Computer Programming"
        ));
        BE_SUBJECTS.put(3, Arrays.asList(
            "Digital Electronics",
            "Electrical Machines",
            "Control Systems",
            "Signals and Systems",
            "Electromagnetic Theory"
        ));
        BE_SUBJECTS.put(4, Arrays.asList(
            "Power Systems",
            "Microprocessors",
            "Communication Systems",
            "Power Electronics",
            "Industrial Engineering"
        ));
        BE_SUBJECTS.put(5, Arrays.asList(
            "Power Generation",
            "Protection and Switchgear",
            "High Voltage Direct Current",
            "Elective I",
            "Project Work I"
        ));
        BE_SUBJECTS.put(6, Arrays.asList(
            "Power Distribution",
            "Project Work II",
            "Internship",
            "Elective II",
            "Technical Seminar"
        ));
    }

    // Predefined Departments
    public static final List<String> DEPARTMENTS = Arrays.asList(
        "Computer Science",
        "Science",
        "Engineering"
    );

    // Department to Course Code Mapping
    public static final Map<String, String> DEPARTMENT_TO_COURSE_CODE = Map.of(
        "Computer Science", "BCA",
        "Science", "BSC",
        "Engineering", "BE"
    );

    // Get subjects for a specific course and semester
    // NOTE: courseCode should match Course.code persisted in DB (e.g. BCA/BSC/BE)
    public static List<String> getSubjectsForCourseSemester(String courseCode, int semester) {
        if (courseCode == null) return new ArrayList<>();
        return switch (courseCode.trim().toUpperCase(Locale.ROOT)) {
            case "BCA" -> BCA_SUBJECTS.getOrDefault(semester, new ArrayList<>());
            case "BSC" -> BSC_SUBJECTS.getOrDefault(semester, new ArrayList<>());
            case "BE" -> BE_SUBJECTS.getOrDefault(semester, new ArrayList<>());
            default -> new ArrayList<>();
        };
    }


    // Get all semesters for a course
    public static List<Integer> getSemestersForCourse(String courseCode) {
        return switch (courseCode) {
            case "BCA" -> new ArrayList<>(BCA_SUBJECTS.keySet());
            case "BSC" -> new ArrayList<>(BSC_SUBJECTS.keySet());
            case "BE" -> new ArrayList<>(BE_SUBJECTS.keySet());
            default -> new ArrayList<>();
        };
    }

    // Get course information
    public static Map<String, Object> getCourseInfo(String courseCode) {
        Map<String, Object> info = new HashMap<>();
        switch (courseCode) {
            case "BCA":
                info.put("code", "BCA");
                info.put("name", "Bachelor of Computer Applications");
                info.put("credits", 120);
                info.put("duration", 3);
                info.put("department", "Computer Science");
                break;
            case "BSC":
                info.put("code", "BSC");
                info.put("name", "Bachelor of Science");
                info.put("credits", 120);
                info.put("duration", 3);
                info.put("department", "Science");
                break;
            case "BE":
                info.put("code", "BE");
                info.put("name", "Bachelor of Engineering");
                info.put("credits", 120);
                info.put("duration", 4);
                info.put("department", "Engineering");
                break;
        }
        return info;
    }
}
