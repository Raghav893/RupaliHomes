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
import com.raghav.rupaliconstbackend.repository.PropertyLikeRepository;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Root;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class PropertySelectionFlagsTest {
    private final PropertyRepository properties = mock(PropertyRepository.class);
    private final UserRepository users = mock(UserRepository.class);
    private final PropertyLikeRepository likes = mock(PropertyLikeRepository.class);
    private final AdminPropertyServiceImpl admin = new AdminPropertyServiceImpl(properties,
            mock(PurchaseRepository.class), mock(RentalRepository.class), users, likes);
    private final PropertyServiceImpl publicProperties = new PropertyServiceImpl(properties, likes);

    @BeforeEach
    void saveReturnsThePersistedProperty() {
        User user = new User();
        user.setId(1L);
        when(users.findByEmail("admin@example.test")).thenReturn(Optional.of(user));
        when(properties.save(any(Property.class))).thenAnswer(invocation -> {
            Property property = invocation.getArgument(0);
            property.setId(42L);
            return property;
        });
    }

    @Test
    void creatingAndEditingPreservesEveryIndependentFlagCombination() {
        for (boolean featured : new boolean[]{false, true}) {
            for (boolean topProperty : new boolean[]{false, true}) {
                PropertyCreateDTO create = new PropertyCreateDTO();
                create.setTitle("Selection test");
                create.setDescription("Property with independent selections");
                create.setLocation("Gurugram");
                create.setCity("Gurugram");
                create.setLocality("Sector 42");
                create.setPropertyCategory("Plot");
                create.setSqft(900);
                create.setImageUrl("https://example.test/plot.jpg");
                create.setType(PropertyType.SALE);
                create.setPrice(BigDecimal.TEN);
                create.setFeatured(featured);
                create.setTopProperty(topProperty);
                PropertyResponseDTO created = admin.createProperty(create, "admin@example.test");
                assertEquals(featured, created.isFeatured());
                assertEquals(topProperty, created.isTopProperty());

                ArgumentCaptor<Property> saved = ArgumentCaptor.forClass(Property.class);
                verify(properties, atLeastOnce()).save(saved.capture());
                Property persisted = saved.getValue();
                assertEquals(featured, persisted.isFeatured());
                assertEquals(topProperty, persisted.isTopProperty());
                when(properties.findById(42L)).thenReturn(Optional.of(persisted));

                PropertyUpdateDTO update = new PropertyUpdateDTO();
                update.setTitle(create.getTitle());
                update.setDescription(create.getDescription());
                update.setLocation(create.getLocation());
                update.setCity(create.getCity());
                update.setLocality(create.getLocality());
                update.setPropertyCategory(create.getPropertyCategory());
                update.setSqft(create.getSqft());
                update.setImageUrl(create.getImageUrl());
                update.setType(PropertyType.SALE);
                update.setStatus(PropertyStatus.AVAILABLE);
                update.setPrice(BigDecimal.TEN);
                update.setFeatured(!featured);
                update.setTopProperty(!topProperty);
                PropertyResponseDTO updated = admin.updateProperty(42L, update);
                assertEquals(!featured, updated.isFeatured());
                assertEquals(!topProperty, updated.isTopProperty());

                PropertyResponseDTO publicView = publicProperties.getAvailableProperty(42L);
                assertEquals(!featured, publicView.isFeatured());
                assertEquals(!topProperty, publicView.isTopProperty());
            }
        }
    }

    @Test
    void newPropertiesDoNotInheritFeaturedSelectionAsTopProperty() {
        assertFalse(new Property().isTopProperty());
        PropertyCreateDTO create = new PropertyCreateDTO();
        create.setFeatured(true);
        assertFalse(create.isTopProperty());
        PropertyUpdateDTO update = new PropertyUpdateDTO();
        update.setFeatured(true);
        assertFalse(update.isTopProperty());
    }

    @Test
    @SuppressWarnings("unchecked")
    void publicFiltersUseSeparateDatabaseFieldsIncludingFalseValues() {
        when(properties.findAll(any(Specification.class), any(Pageable.class))).thenReturn(Page.empty());
        publicProperties.getAvailableProperties(Pageable.unpaged(), null, null, null, null,
                null, null, null, null, null, null, null, false, true, null);
        ArgumentCaptor<Specification<Property>> specification = ArgumentCaptor.forClass(Specification.class);
        verify(properties).findAll(specification.capture(), any(Pageable.class));
        Root<Property> root = mock(Root.class);
        CriteriaBuilder cb = mock(CriteriaBuilder.class);
        Path<Object> featuredPath = mock(Path.class);
        Path<Object> topPath = mock(Path.class);
        when(root.get("featured")).thenReturn(featuredPath);
        when(root.get("topProperty")).thenReturn(topPath);
        specification.getValue().toPredicate(root, mock(CriteriaQuery.class), cb);
        verify(cb).equal(featuredPath, false);
        verify(cb).equal(topPath, true);
    }
}
