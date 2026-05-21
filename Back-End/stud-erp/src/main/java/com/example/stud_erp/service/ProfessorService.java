package com.example.stud_erp.service;

import java.util.List;
import java.util.Optional;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.stud_erp.entity.Professor;
import com.example.stud_erp.exception.OTPExpiredException;
import com.example.stud_erp.payload.LoginRequest;
import com.example.stud_erp.payload.ResetPasswordRequest;
import com.example.stud_erp.repository.ProfessorRepository;

@Service
public class ProfessorService {

    @Autowired
    private ProfessorRepository professorRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Professor saveProfessor(Professor professor) {
        if (professor.getPassword() != null && !professor.getPassword().startsWith("$2a$")) {
            professor.setPassword(passwordEncoder.encode(professor.getPassword()));
        }
        return professorRepository.save(professor);
    }

    public List<Professor> getAllProfessors() {
        return professorRepository.findAll();
    }

    public Professor getProfessorById(String id) {
        return professorRepository.findByProfessorId(id);
    }

    public Optional<Professor> getProfessorById(Long id) {
        return professorRepository.findById(id);
    }


    public void deleteProfessor(Long id) {
        professorRepository.deleteById(id);
    }

    public Professor authenticateUser(LoginRequest loginRequest) {
        Professor user = professorRepository.findByUsername(loginRequest.getUsername());
        if (user == null || !passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }
        return user;
    }


    public void sendForgotPasswordEmail(String email) {
        Professor user = professorRepository.findByEmail(email);
        if (user == null) {
            throw new OTPExpiredException("User with email " + email + " not found");
        }

        String otp = generateOTP();
        user.setOtp(otp);
        user.setOtpExpiry(java.time.LocalDateTime.now().plusMinutes(15));
        professorRepository.save(user);

        emailService.sendOtpEmail(user.getEmail(), otp);
    }

    private String generateOTP() {
        // Generate a random 6-digit OTP
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    public void verifyOTP(String email, String otp) {
        Professor user = professorRepository.findByEmail(email);
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
        Professor user = professorRepository.findByEmail(request.getEmail());
        if (user == null) {
            throw new OTPExpiredException("User with email " + request.getEmail() + " not found");
        }

        // Set the new password (not encrypted)
        String newPass = request.getNewPassword();
        if (newPass != null && !newPass.startsWith("$2a$")) {
            newPass = passwordEncoder.encode(newPass);
        }
        user.setPassword(newPass);
        professorRepository.save(user);
    }
}
