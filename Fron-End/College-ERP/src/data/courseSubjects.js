export const courseSubjectMap = {
  BCA: {
    1: [
      "Applied Mathematics",
      "C Programming",
      "English",
      "Principles of Management",
      "Environmental Studies",
    ],
    2: [
      "Computer Networks",
      "C++ Programming",
      "Database Management System",
      "Discrete Mathematics",
      "Soft Skills",
    ],
    3: [
      "Data Structures",
      "Operating Systems",
      "Object Oriented Programming with Java",
      "Business Economics",
      "Advanced Mathematics",
    ],
    4: [
      "Software Engineering",
      "Web Technology",
      "Computer Graphics",
      "Microprocessor and Interfacing",
      "Accounting and Finance",
    ],
    5: [
      "Artificial Intelligence",
      "Computer Networks II",
      "Database Management Systems II",
      "Mobile Computing",
      "Principles of Software Testing",
    ],
    6: [
      "Cloud Computing",
      "Data Analytics",
      "Cyber Security",
      "Project Work",
      "Elective: Multimedia Applications",
    ],
  },
  BSc: {
    1: [
      "Mathematics I",
      "Physics I",
      "Chemistry I",
      "English",
      "Environmental Science",
    ],
    2: [
      "Mathematics II",
      "Physics II",
      "Chemistry II",
      "Computer Fundamentals",
      "Communication Skills",
    ],
    3: [
      "Microbiology",
      "Biochemistry",
      "Statistics",
      "Modern Physics",
      "Scientific Writing",
    ],
    4: [
      "Genetics",
      "Analytical Chemistry",
      "Mathematical Methods",
      "Elective: Electronics",
      "Research Methodology",
    ],
    5: [
      "Biotechnology",
      "Environmental Biology",
      "Advanced Statistics",
      "Elective: Astronomy",
      "Project Work",
    ],
    6: [
      "Molecular Biology",
      "Computational Biology",
      "Biostatistics",
      "Elective: Nanotechnology",
      "Seminar and Presentation",
    ],
  },
  BCom: {
    1: [
      "Financial Accounting",
      "Business Economics",
      "Business Communication",
      "Principles of Management",
      "Business Law",
    ],
    2: [
      "Corporate Accounting",
      "Business Statistics",
      "Taxation I",
      "Marketing Management",
      "Business Ethics",
    ],
    3: [
      "Cost Accounting",
      "Company Law",
      "Taxation II",
      "Management Accounting",
      "Human Resource Management",
    ],
    4: [
      "Corporate Finance",
      "Auditing",
      "Financial Markets",
      "Consumer Protection",
      "Insurance and Risk Management",
    ],
    5: [
      "International Business",
      "Strategic Management",
      "E-Commerce",
      "Entrepreneurship",
      "Advanced Taxation",
    ],
    6: [
      "Investment Management",
      "Business Research",
      "Project Work",
      "Elective: Banking",
      "Seminar",
    ],
  },
  MBA: {
    1: [
      "Management Concepts",
      "Organizational Behavior",
      "Accounting for Managers",
      "Marketing Management",
      "Quantitative Techniques",
    ],
    2: [
      "Financial Management",
      "Human Resource Management",
      "Operations Management",
      "Business Research Methods",
      "Information Systems",
    ],
    3: [
      "Strategic Management",
      "International Business",
      "Project Management",
      "Elective: Digital Marketing",
      "Elective: Supply Chain Management",
    ],
    4: [
      "Entrepreneurship",
      "Business Analytics",
      "Leadership and Ethics",
      "Project Work",
      "Seminar",
    ],
  },
};

export const getSubjectsForCourseSemester = (course, semester) => {
  if (!course || !semester) return [];
  return courseSubjectMap[course]?.[semester] || [];
};
