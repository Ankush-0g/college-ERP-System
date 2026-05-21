package com.example.stud_erp.controller;

import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

import com.example.stud_erp.entity.StudyMaterial;

@RestController
@RequestMapping("/api")
public class StudyMaterialController {

    private final com.example.stud_erp.repository.StudyMaterialRepository studyMaterialRepository;

    public StudyMaterialController(com.example.stud_erp.repository.StudyMaterialRepository studyMaterialRepository) {
        this.studyMaterialRepository = studyMaterialRepository;
    }

    // CRUD
    @PostMapping("/professor/materials")
    public ResponseEntity<StudyMaterialDTO> createMaterial(@RequestBody StudyMaterialDTO material) {
        StudyMaterial entity = new StudyMaterial();
        entity.setTitle(material.getTitle());
        entity.setType(material.getType());
        entity.setCourse(material.getCourse());
        entity.setUploadedAt(LocalDateTime.now());
        entity.setFileName(material.getFileName());

        StudyMaterial saved = studyMaterialRepository.save(entity);
        return ResponseEntity.ok(toDto(saved));
    }

    @GetMapping("/students/materials")
    public ResponseEntity<List<StudyMaterialDTO>> getAllMaterials() {
        return ResponseEntity.ok(studyMaterialRepository.findAll().stream().map(this::toDto).toList());
    }

    @GetMapping("/materials/{id}")
    public ResponseEntity<StudyMaterialDTO> getMaterialById(@PathVariable Long id) {
        return studyMaterialRepository.findById(id)
                .map(this::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/materials/{id}")
    public ResponseEntity<StudyMaterialDTO> updateMaterial(@PathVariable Long id, @RequestBody StudyMaterialDTO material) {
        if (!studyMaterialRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        StudyMaterial entity = studyMaterialRepository.findById(id).orElseThrow();
        entity.setTitle(material.getTitle());
        entity.setType(material.getType());
        entity.setCourse(material.getCourse());
        entity.setUploadedAt(LocalDateTime.now());
        entity.setFileName(material.getFileName());

        StudyMaterial saved = studyMaterialRepository.save(entity);
        return ResponseEntity.ok(toDto(saved));
    }

    @DeleteMapping("/materials/{id}")
    public ResponseEntity<Void> deleteMaterial(@PathVariable Long id) {
        if (!studyMaterialRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        studyMaterialRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private StudyMaterialDTO toDto(StudyMaterial material) {
        StudyMaterialDTO dto = new StudyMaterialDTO();
        dto.setId(material.getId());
        dto.setTitle(material.getTitle());
        dto.setType(material.getType());
        dto.setCourse(material.getCourse());
        dto.setUploadedAt(material.getUploadedAt() != null ? material.getUploadedAt().toString() : null);
        dto.setFileName(material.getFileName());
        return dto;
    }

    @Data
    public static class StudyMaterialDTO {
        private Long id;
        private String title;
        private String type;
        private String course;
        private String uploadedAt;
        private String fileName;
    }
}

