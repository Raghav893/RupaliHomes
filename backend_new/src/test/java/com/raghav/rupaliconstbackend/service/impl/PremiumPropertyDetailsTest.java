package com.raghav.rupaliconstbackend.service.impl;

import com.raghav.rupaliconstbackend.DTO.PropertyCreateDTO;
import com.raghav.rupaliconstbackend.DTO.PropertyResponseDTO;
import com.raghav.rupaliconstbackend.DTO.PropertyUpdateDTO;
import com.raghav.rupaliconstbackend.Repositories.PropertyRepository;
import com.raghav.rupaliconstbackend.Repositories.PurchaseRepository;
import com.raghav.rupaliconstbackend.Repositories.RentalRepository;
import com.raghav.rupaliconstbackend.Repositories.UserRepository;
import com.raghav.rupaliconstbackend.entity.Property;
import com.raghav.rupaliconstbackend.entity.PropertyStatus;
import com.raghav.rupaliconstbackend.entity.PropertyType;
import com.raghav.rupaliconstbackend.entity.User;
import com.raghav.rupaliconstbackend.model.PropertyFloorPlan;
import com.raghav.rupaliconstbackend.model.PropertyGalleryImage;
import com.raghav.rupaliconstbackend.repository.PropertyLikeRepository;
import jakarta.validation.Validation;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.json.JsonMapper;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class PremiumPropertyDetailsTest {
    private final PropertyRepository properties = mock(PropertyRepository.class);
    private final UserRepository users = mock(UserRepository.class);
    private final PropertyLikeRepository likes = mock(PropertyLikeRepository.class);
    private final AdminPropertyServiceImpl admin = new AdminPropertyServiceImpl(properties,
            mock(PurchaseRepository.class), mock(RentalRepository.class), users, likes);
    private final PropertyServiceImpl publicProperties = new PropertyServiceImpl(properties, likes);
    private Property persisted;

    @BeforeEach
    void mockPersistenceWithoutADatabase() {
        User user = new User();
        user.setId(1L);
        when(users.findByEmail("admin@example.test")).thenReturn(Optional.of(user));
        when(properties.save(any(Property.class))).thenAnswer(invocation -> {
            persisted = invocation.getArgument(0);
            persisted.setId(42L);
            when(properties.findById(42L)).thenReturn(Optional.of(persisted));
            return persisted;
        });
    }

    private PropertyCreateDTO legacyCreate() {
        PropertyCreateDTO dto = new PropertyCreateDTO();
        dto.setTitle("Legacy home");
        dto.setDescription("Existing property description");
        dto.setLocation("Gurugram");
        dto.setType(PropertyType.SALE);
        dto.setPrice(BigDecimal.TEN);
        dto.setImageUrl("https://example.test/legacy.jpg");
        dto.setImageGallery("https://example.test/one.jpg,https://example.test/two.jpg");
        dto.setBrochureUrl("https://example.test/legacy.pdf");
        return dto;
    }

    private PropertyUpdateDTO legacyUpdate() {
        PropertyUpdateDTO dto = new PropertyUpdateDTO();
        dto.setTitle("Legacy home, edited");
        dto.setDescription("Existing property description");
        dto.setLocation("Gurugram");
        dto.setType(PropertyType.SALE);
        dto.setStatus(PropertyStatus.AVAILABLE);
        dto.setPrice(BigDecimal.TEN);
        dto.setImageUrl("https://example.test/legacy.jpg");
        dto.setImageGallery("https://example.test/one.jpg,https://example.test/two.jpg");
        dto.setBrochureUrl("https://example.test/legacy.pdf");
        return dto;
    }

    @Test
    void legacyPayloadNeedsNoPremiumFieldsAndKeepsOriginalMedia() {
        PropertyResponseDTO created = admin.createProperty(legacyCreate(), "admin@example.test");
        assertEquals("#C9B458", created.getAccentColor());
        assertEquals("#1c3a32", created.getThemeDark());
        assertEquals("#12261f", created.getThemeDarker());
        assertEquals("#f5f2e9", created.getThemeLight());
        assertNull(created.getThemeName());
        assertNull(created.getCoverImage());
        assertNull(created.getGalleryImages());
        assertNull(created.getFloorPlans());
        assertNull(created.getBrochureFileSize());
        assertEquals("https://example.test/legacy.jpg", created.getImageUrl());
        assertEquals("https://example.test/one.jpg,https://example.test/two.jpg", created.getImageGallery());
        assertEquals("https://example.test/legacy.pdf", created.getBrochureUrl());
        PropertyResponseDTO edited = admin.updateProperty(42L, legacyUpdate());
        assertEquals(created.getAccentColor(), edited.getAccentColor());
        assertNull(edited.getFloorPlans());
        assertEquals(created.getImageGallery(), edited.getImageGallery());
    }

    @Test
    void premiumDataSurvivesCreateAndBothAdminAndPublicResponsesInListOrder() {
        PropertyCreateDTO dto = legacyCreate();
        dto.setCoverImage("https://example.test/cover.jpg");
        dto.setTagline("Room to live well");
        dto.setEyebrow("A new address");
        dto.setDeveloperName("Example developer");
        dto.setDeveloperLogo("https://example.test/developer.svg");
        dto.setProjectStatus("Ready to move");
        dto.setAccentColor("#112233");
        dto.setThemeDark("#223344");
        dto.setThemeDarker("#112244");
        dto.setThemeLight("#fefefe");
        dto.setThemeName("Custom estate theme");
        dto.setGalleryImages(List.of(new PropertyGalleryImage("https://example.test/b.jpg", "Living room", 2),
                new PropertyGalleryImage("https://example.test/a.jpg", "Entrance", 1)));
        dto.setFloorPlans(List.of(new PropertyFloorPlan("3 BHK", "https://example.test/plan.png",
                new BigDecimal("1800.5"), new BigDecimal("1500"), 3, 2, 0)));
        dto.setBrochureFileSize(123456L);
        dto.setBrochureSourceUrl("https://example.test/source.pdf");
        dto.setBrochurePreviewImage("https://example.test/preview.jpg");
        dto.setReraNumber("EXAMPLE-RERA");
        dto.setRegistrationsText("Registration details supplied by the developer.");
        PropertyResponseDTO response = admin.createProperty(dto, "admin@example.test");
        assertEquals(dto.getCoverImage(), response.getCoverImage());
        assertEquals(dto.getTagline(), response.getTagline());
        assertEquals(dto.getEyebrow(), response.getEyebrow());
        assertEquals(dto.getDeveloperName(), response.getDeveloperName());
        assertEquals(dto.getDeveloperLogo(), response.getDeveloperLogo());
        assertEquals(dto.getProjectStatus(), response.getProjectStatus());
        assertEquals(dto.getAccentColor(), response.getAccentColor());
        assertEquals(dto.getThemeDark(), response.getThemeDark());
        assertEquals(dto.getThemeDarker(), response.getThemeDarker());
        assertEquals(dto.getThemeLight(), response.getThemeLight());
        assertEquals(dto.getThemeName(), response.getThemeName());
        assertEquals(dto.getGalleryImages(), response.getGalleryImages());
        assertEquals(dto.getFloorPlans(), response.getFloorPlans());
        assertEquals(dto.getBrochureFileSize(), response.getBrochureFileSize());
        assertEquals(dto.getBrochureSourceUrl(), response.getBrochureSourceUrl());
        assertEquals(dto.getBrochurePreviewImage(), response.getBrochurePreviewImage());
        assertEquals(dto.getReraNumber(), response.getReraNumber());
        assertEquals(dto.getRegistrationsText(), response.getRegistrationsText());
        PropertyResponseDTO publicView = publicProperties.getAvailableProperty(42L);
        assertEquals(response, publicView);
        assertEquals("Living room", publicView.getGalleryImages().get(0).getCaption());
        assertEquals(new BigDecimal("1800.5"), persisted.getFloorPlans().get(0).getTotalArea());
    }

    @Test
    void legacyUpdatePreservesPremiumDetailsAndExplicitEmptyValuesClearThem() {
        PropertyCreateDTO create = legacyCreate();
        create.setCoverImage("https://example.test/cover.jpg");
        create.setTagline("Original tagline");
        create.setThemeDark("#223344");
        create.setThemeDarker("#112244");
        create.setThemeLight("#fefefe");
        create.setThemeName("Preserved theme");
        create.setGalleryImages(List.of(new PropertyGalleryImage("https://example.test/photo.jpg", null, 0)));
        create.setFloorPlans(List.of(new PropertyFloorPlan("2 BHK", "https://example.test/plan.jpg", null, null, 2, 2, 0)));
        admin.createProperty(create, "admin@example.test");
        PropertyResponseDTO unchanged = admin.updateProperty(42L, legacyUpdate());
        assertEquals(create.getCoverImage(), unchanged.getCoverImage());
        assertEquals(create.getTagline(), unchanged.getTagline());
        assertEquals(create.getThemeDark(), unchanged.getThemeDark());
        assertEquals(create.getThemeDarker(), unchanged.getThemeDarker());
        assertEquals(create.getThemeLight(), unchanged.getThemeLight());
        assertEquals(create.getThemeName(), unchanged.getThemeName());
        assertEquals(create.getGalleryImages(), unchanged.getGalleryImages());
        assertEquals(create.getFloorPlans(), unchanged.getFloorPlans());
        PropertyUpdateDTO clear = legacyUpdate();
        clear.setCoverImage("");
        clear.setTagline("");
        clear.setThemeDark("#556677");
        clear.setThemeDarker("#334455");
        clear.setThemeLight("#eeeeee");
        clear.setThemeName("");
        clear.setGalleryImages(List.of());
        clear.setFloorPlans(List.of());
        PropertyResponseDTO cleared = admin.updateProperty(42L, clear);
        assertEquals("", cleared.getCoverImage());
        assertEquals("", cleared.getTagline());
        assertEquals("#556677", cleared.getThemeDark());
        assertEquals("#334455", cleared.getThemeDarker());
        assertEquals("#eeeeee", cleared.getThemeLight());
        assertEquals("", cleared.getThemeName());
        assertTrue(cleared.getGalleryImages().isEmpty());
        assertTrue(cleared.getFloorPlans().isEmpty());
        assertEquals("https://example.test/legacy.pdf", cleared.getBrochureUrl());
    }

    @Test
    void jsonAcceptsLegacyPayloadAndBindsTypedGalleryAndFloorPlanObjects() {
        JsonMapper mapper = JsonMapper.builder().build();
        PropertyCreateDTO legacy = mapper.readValue("{\"title\":\"Legacy\"}", PropertyCreateDTO.class);
        assertEquals("#C9B458", legacy.getAccentColor());
        assertEquals("#1c3a32", legacy.getThemeDark());
        assertEquals("#12261f", legacy.getThemeDarker());
        assertEquals("#f5f2e9", legacy.getThemeLight());
        assertNull(legacy.getGalleryImages());
        PropertyCreateDTO premium = mapper.readValue("""
                {"galleryImages":[{"url":"https://example.test/one.jpg","caption":"One","order":2},
                  {"url":"https://example.test/two.jpg","order":1}],
                 "floorPlans":[{"title":"3 BHK","imageUrl":"https://example.test/plan.jpg",
                   "totalArea":1800.5,"carpetArea":1500,"bedrooms":3,"bathrooms":2,"order":0}],
                 "brochureFileSize":123456}
                """, PropertyCreateDTO.class);
        assertEquals(2, premium.getGalleryImages().get(0).getOrder());
        assertEquals(new BigDecimal("1800.5"), premium.getFloorPlans().get(0).getTotalArea());
        assertEquals(123456L, premium.getBrochureFileSize());
        PropertyCreateDTO roundTrip = mapper.readValue(mapper.writeValueAsString(premium), PropertyCreateDTO.class);
        assertEquals(premium, roundTrip);
    }

    @Test
    void validatesOnlyProvidedPremiumFieldsAndRejectsInvalidNestedData() {
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            var validator = factory.getValidator();
            PropertyCreateDTO create = legacyCreate();
            assertTrue(validator.validate(create).isEmpty());
            create.setAccentColor("red; color:blue");
            create.setThemeDark("#fff");
            create.setThemeDarker("url(bad)");
            create.setThemeLight("white");
            create.setGalleryImages(List.of(new PropertyGalleryImage("", "Photo", -1)));
            create.setFloorPlans(List.of(new PropertyFloorPlan("", "", new BigDecimal("-1"), null, -2, 0, 0)));
            create.setBrochureFileSize(-1L);
            var violations = validator.validate(create);
            assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("accentColor")));
            assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("themeDark")));
            assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("themeDarker")));
            assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("themeLight")));
            assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("galleryImages[0].url")));
            assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("floorPlans[0].totalArea")));
            assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("brochureFileSize")));
        }
    }
}
