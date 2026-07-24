package com.raghav.rupaliconstbackend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Table(name = "properties")
public class Property {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "properties_id")
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 2000)
    private String description;

    @Column(precision = 15, scale = 2)
    private BigDecimal price;

    @Column(precision = 15, scale = 2)
    private BigDecimal rentAmount;

    @Column(nullable = false)
    private String location;

    private String size;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PropertyType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PropertyStatus status;

    // ── Media ────────────────────────────────────────
    @Column(length = 1000)
    private String imageUrl;

    @Column(length = 5000)
    private String imageGallery;

    @Column(length = 1000)
    private String brochureUrl;

    // ── Room details ─────────────────────────────────
    private Integer bedrooms;
    private Integer bathrooms;
    private Integer sqft;
    @Column(nullable = false)
    private boolean featured = false;

    // ── Extended real estate fields ──────────────────
    private String buildingType;       // e.g. "Residential", "Commercial"
    private String propertyCategory;   // e.g. "Builder Floor", "Apartment", "Villa", "Plot"
    private String city;               // e.g. "Gurgaon", "Delhi"
    private String microMarket;        // e.g. "Central Gurgaon"
    private String locality;           // e.g. "Sector 23A"
    private String flooring;           // e.g. "Marble", "Tiles", "Wooden"
    private Integer floorNumber;
    private Integer totalFloors;
    private Integer unitNumber;
    private String availableFrom;      // e.g. "Immediately", "2024-04-01"
    @Column(length = 500)
    private String tags;               // comma-separated: "Prime Location,Well Maintained,Spacious"
    @Column(length = 2000)
    private String furnishingDetails;  // e.g. "1 Fan, 1 Geyser, 1 Modular Kitchen, 1 Bed"
    private String furnishingStatus;   // e.g. "Semi-Furnished", "Fully Furnished", "Unfurnished"

    // ── Agent Info ───────────────────────────────────
    private String agentName;           // e.g. "Rahul Sharma"
    @Column(length = 1000)
    private String agentPhotoUrl;       // URL to agent's photo
    @Column(length = 2000)
    private String amenities;           // comma-separated: "Swimming Pool,Gym,Parking,Lift"

    // ── Reactions ────────────────────────────────────
    @Column(columnDefinition = "integer default 0")
    private Integer reactionsCount = 0;

    // ── Relations ────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }
}
