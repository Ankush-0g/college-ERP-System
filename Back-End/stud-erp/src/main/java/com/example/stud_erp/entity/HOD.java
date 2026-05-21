package com.example.stud_erp.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonProperty.Access;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "hods", uniqueConstraints = {
        @UniqueConstraint(columnNames = "username"),
        @UniqueConstraint(columnNames = "email")
})
public class HOD {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @Column(nullable = false)
 private String name;

 @Column(length = 255)
 private String imageUrl;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id", referencedColumnName = "id", nullable = false)
    private Department department;

    @JsonIgnore
    @Column(name = "department", nullable = false)
    private String departmentName;

    public void setDepartment(Department department) {
        this.department = department;
        this.departmentName = department != null ? department.getName() : null;
    }

    @Column(unique = true, nullable = false)
    private String username;

 @JsonProperty(access = Access.WRITE_ONLY)
 @Column(nullable = false)
 private String password;

 @Column(unique = true, nullable = false)
 private String email;

 @Column(nullable = false)
 private String phone;

 @ElementCollection
 @CollectionTable(name = "hod_subjects", joinColumns = @JoinColumn(name = "hod_id"))
 @Column(name = "subject")
 private List<String> subjects;

 @JsonProperty(access = Access.WRITE_ONLY)
 @Column
 private String otp;

 @JsonIgnore
 @Column
 private LocalDateTime otpExpiry;

 @Column(nullable = false, updatable = false)
 private LocalDateTime createdAt;

 @Column
 private LocalDateTime updatedAt;

 @PrePersist
 protected void onCreate() {
  createdAt = LocalDateTime.now();
 }

 @PreUpdate
 protected void onUpdate() {
  updatedAt = LocalDateTime.now();
 }
}
