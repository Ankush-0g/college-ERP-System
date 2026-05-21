package com.example.stud_erp.service;

import com.example.stud_erp.entity.*;
import com.example.stud_erp.payload.NotificationDTO;
import com.example.stud_erp.repository.NotificationRepository;
import com.example.stud_erp.repository.ProfessorRepository;
import com.example.stud_erp.repository.StudentRepository;
import com.example.stud_erp.repository.HODRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private HODRepository hodRepository;

    @Autowired
    private ProfessorRepository professorRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Transactional
    public Object sendNotification(NotificationDTO notificationDTO) {
        String recipientType = normalizeRecipientType(notificationDTO.getRecipientType());
        if (recipientType == null) {
            throw new IllegalArgumentException("recipientType must be provided");
        }

        Notification notification = new Notification(notificationDTO);
        notification.setSentAt(LocalDateTime.now());

        try {
            switch (recipientType) {
                case "STUDENT":
                    if (notificationDTO.getRecipientId() == null) {
                        throw new IllegalArgumentException("recipientId is required for STUDENT notifications");
                    }
                    notification.setStudent(studentRepository.findById(notificationDTO.getRecipientId())
                            .orElseThrow(() -> new IllegalArgumentException("Student not found for id " + notificationDTO.getRecipientId())));
                    break;
                case "PROFESSOR":
                    if (notificationDTO.getRecipientId() == null) {
                        throw new IllegalArgumentException("recipientId is required for PROFESSOR notifications");
                    }
                    notification.setProfessor(professorRepository.findById(notificationDTO.getRecipientId())
                            .orElseThrow(() -> new IllegalArgumentException("Professor not found for id " + notificationDTO.getRecipientId())));
                    break;
                case "ALL_STUDENTS":
                    return sendToAllStudents(notificationDTO);
                case "ALL_PROFESSORS":
                    return sendToAllProfessors(notificationDTO);
                case "ALL_STUDENTS_AND_PROFESSORS":
                case "BOTH":
                case "ALL":
                    return sendToAllStudentsAndProfessors(notificationDTO);
                default:
                    throw new IllegalArgumentException("Unsupported recipientType: " + recipientType);
            }

            // Ensure fields fit existing DB column sizes (avoid DataIntegrityViolation)
            notification.setTitle(safeTrim(notification.getTitle(), 255));
            notification.setSubject(safeTrim(notification.getSubject(), 255));
            notification.setMessage(safeTrim(notification.getMessage(), 255));

            Notification saved = notificationRepository.save(notification);
            logger.info("Saved notification id={} recipientType={} recipientId={}", saved.getId(), saved.getRecipientType(), notificationDTO.getRecipientId());
            return saved;
        } catch (Exception ex) {
            logger.error("Failed to send/save notification: {}", ex.getMessage(), ex);
            throw ex;
        }
    }

    private List<Notification> sendToAllStudents(NotificationDTO notificationDTO) {
        List<Notification> notifications = new ArrayList<>();
        studentRepository.findAll().forEach(student -> {
            Notification newNotification = new Notification(notificationDTO);
            newNotification.setStudent(student);
            newNotification.setSentAt(LocalDateTime.now());
            notifications.add(notificationRepository.save(newNotification));
        });
        return notifications;
    }

    private List<Notification> sendToAllProfessors(NotificationDTO notificationDTO) {
        List<Notification> notifications = new ArrayList<>();
        professorRepository.findAll().forEach(professor -> {
            Notification newNotification = new Notification(notificationDTO);
            newNotification.setProfessor(professor);
            newNotification.setSentAt(LocalDateTime.now());
            notifications.add(notificationRepository.save(newNotification));
        });
        return notifications;
    }

    private List<Notification> sendToAllStudentsAndProfessors(NotificationDTO notificationDTO) {
        List<Notification> notifications = new ArrayList<>();
        studentRepository.findAll().forEach(student -> {
            Notification newNotification = new Notification(notificationDTO);
            newNotification.setStudent(student);
            newNotification.setSentAt(LocalDateTime.now());
            notifications.add(notificationRepository.save(newNotification));
        });
        professorRepository.findAll().forEach(professor -> {
            Notification newNotification = new Notification(notificationDTO);
            newNotification.setProfessor(professor);
            newNotification.setSentAt(LocalDateTime.now());
            notifications.add(notificationRepository.save(newNotification));
        });
        return notifications;
    }

    private String normalizeRecipientType(String recipientType) {
        return recipientType == null ? null : recipientType.trim().toUpperCase();
    }

    // Helper to trim strings safely for DB columns
    private String safeTrim(String s, int max) {
        if (s == null) return null;
        return s.length() <= max ? s : s.substring(0, max);
    }

    public List<Notification> getNotificationsForStudent(Long studentId) {
        return notificationRepository.findByStudentId(studentId);
    }

    public List<Notification> getNotificationsForProfessor(Long professorId) {
        return notificationRepository.findByProfessorId(professorId);
    }
}
