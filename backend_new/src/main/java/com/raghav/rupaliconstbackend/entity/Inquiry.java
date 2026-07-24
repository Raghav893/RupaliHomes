package com.raghav.rupaliconstbackend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Table(name = "inquiries")
public class Inquiry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String phone;

    private String email;

    private String alternatePhone;

    @Column(nullable = false)
    private String type; // e.g. "SELL", "CONTACT", "PROPERTY"

    private String city;

    private String propertyType; // "Apartment", "Villa", etc.

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    // Status to track lead: NEW, CONTACTED, CLOSED
    @Column(nullable = false)
    private String status = "NEW";

    @JsonIgnore
    @Column(name = "normal_user_id")
    private Long normalUserId;
}
