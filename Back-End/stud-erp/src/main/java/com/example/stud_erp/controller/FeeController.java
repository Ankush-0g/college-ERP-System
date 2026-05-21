package com.example.stud_erp.controller;

import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class FeeController {

    private final AtomicLong paymentSequence = new AtomicLong(1);
    private final List<FeePaymentDTO> payments = new ArrayList<>();

    @PostMapping("/students/fees")
    public ResponseEntity<FeePaymentDTO> payFees(@RequestBody FeePaymentDTO feePayment) {
        feePayment.setId(paymentSequence.getAndIncrement());
        feePayment.setPaymentDate(LocalDateTime.now().toString());
        payments.add(feePayment);
        return ResponseEntity.ok(feePayment);
    }

    @GetMapping("/students/fees/{studentId}")
    public ResponseEntity<List<FeePaymentDTO>> getPayments(@PathVariable Long studentId) {
        return ResponseEntity.ok(payments.stream()
                .filter(payment -> payment.getStudentId().equals(studentId))
                .collect(Collectors.toList()));
    }

    @Data
    public static class FeePaymentDTO {
        private Long id;
        private Long studentId;
        private Double amount;
        private String paymentMethod;
        private String transactionId;
        private String paymentDate;
    }
}
