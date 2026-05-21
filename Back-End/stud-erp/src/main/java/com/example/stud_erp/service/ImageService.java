package com.example.stud_erp.service;

import com.example.stud_erp.entity.HOD;
import com.example.stud_erp.entity.Professor;
import com.example.stud_erp.entity.Student;
import com.example.stud_erp.repository.HODRepository;
import com.example.stud_erp.repository.ProfessorRepository;
import com.example.stud_erp.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class ImageService {
    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ProfessorRepository professorRepository;

    @Autowired
    private HODRepository hodRepository;

    public void saveStudent(Student student) {
        studentRepository.save(student);
    }

    public void saveProfessor(Professor professor) {
        professorRepository.save(professor);
    }

    public void saveHod(HOD hod){
        hodRepository.save(hod);
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }


    private String uploadFile(File file, String fileName) throws IOException {
        File uploadDir = new File("uploads");
        if (!uploadDir.exists() && !uploadDir.mkdirs()) {
            throw new IOException("Could not create uploads directory");
        }

        Path destination = uploadDir.toPath().resolve(fileName);
        Files.copy(file.toPath(), destination, StandardCopyOption.REPLACE_EXISTING);
        return destination.toAbsolutePath().toString();
    }

    private File convertToFile(MultipartFile multipartFile, String fileName) throws IOException {
        File tempFile = new File(fileName);
        try (FileOutputStream fos = new FileOutputStream(tempFile)) {
            fos.write(multipartFile.getBytes());
        }
        return tempFile;
    }

    private String getExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return ".jpg";
        }
        return fileName.substring(fileName.lastIndexOf('.'));
    }

    public String upload(MultipartFile multipartFile) {
        try {
            if (multipartFile == null || multipartFile.isEmpty()) {
                throw new IllegalArgumentException("Multipart file is empty or missing");
            }
            String originalFilename = multipartFile.getOriginalFilename();
            String fileName = UUID.randomUUID().toString().concat(this.getExtension(originalFilename));
            File file = this.convertToFile(multipartFile, fileName);

            try {
                return this.uploadFile(file, fileName);
            } finally {
                file.delete(); // Delete temp file in finally block to ensure cleanup
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Image upload failed", e);
        }
    }

    public String uploadStudentData(MultipartFile multipartFile, Student student) {
        String imageUrl = this.upload(multipartFile);
        student.setImageUrl(imageUrl);
        return imageUrl;
    }

    public String uploadProfData(MultipartFile multipartFile, Professor professor) {
        String imageUrl = this.upload(multipartFile);
        professor.setImageUrl(imageUrl);    
        return imageUrl;
    }

    public String uploadHodData(MultipartFile multipartFile , HOD hod){
        String imageUrl = this.upload(multipartFile);
        hod.setImageUrl(imageUrl);
        return imageUrl;
    }
}
