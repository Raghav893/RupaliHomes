package com.raghav.rupaliconstbackend.service.impl;

import com.raghav.rupaliconstbackend.DTO.PropertyCreateDTO;
import com.raghav.rupaliconstbackend.DTO.PropertyResponseDTO;
import com.raghav.rupaliconstbackend.DTO.BulkPropertyUploadResponse;
import com.raghav.rupaliconstbackend.DTO.PropertyUpdateDTO;
import com.raghav.rupaliconstbackend.DTO.PurchaseRequestDTO;
import com.raghav.rupaliconstbackend.DTO.PurchaseResponseDTO;
import com.raghav.rupaliconstbackend.DTO.RentalRequestDTO;
import com.raghav.rupaliconstbackend.DTO.RentalResponseDTO;
import com.raghav.rupaliconstbackend.Repositories.PropertyRepository;
import com.raghav.rupaliconstbackend.Repositories.PurchaseRepository;
import com.raghav.rupaliconstbackend.Repositories.RentalRepository;
import com.raghav.rupaliconstbackend.Repositories.UserRepository;
import com.raghav.rupaliconstbackend.entity.Property;
import com.raghav.rupaliconstbackend.entity.PropertyStatus;
import com.raghav.rupaliconstbackend.entity.PropertyType;
import com.raghav.rupaliconstbackend.entity.Purchase;
import com.raghav.rupaliconstbackend.entity.Rental;
import com.raghav.rupaliconstbackend.entity.Role;
import com.raghav.rupaliconstbackend.entity.User;
import com.raghav.rupaliconstbackend.exception.BadRequestException;
import com.raghav.rupaliconstbackend.exception.ResourceNotFoundException;
import com.raghav.rupaliconstbackend.repository.PropertyLikeRepository;
import com.raghav.rupaliconstbackend.service.AdminPropertyService;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminPropertyServiceImpl implements AdminPropertyService {
    private final PropertyRepository propertyRepository;
    private final PurchaseRepository purchaseRepository;
    private final RentalRepository rentalRepository;
    private final UserRepository userRepository;
    private final PropertyLikeRepository propertyLikeRepository;

    @Override
    public PropertyResponseDTO createProperty(PropertyCreateDTO dto, String adminEmail) {
        User admin = getAdmin(adminEmail);
        validateTypeAmounts(dto.getType(), dto.getPrice(), dto.getRentAmount());

        Property property = new Property();
        property.setTitle(dto.getTitle());
        property.setDescription(dto.getDescription());
        property.setPrice(dto.getPrice());
        property.setRentAmount(dto.getRentAmount());
        property.setLocation(dto.getLocation());
        property.setSize(dto.getSize());
        property.setType(dto.getType());
        property.setStatus(PropertyStatus.AVAILABLE);
        property.setCreatedBy(admin);
        // Media
        property.setImageUrl(dto.getImageUrl());
        property.setImageGallery(dto.getImageGallery());
        property.setBrochureUrl(dto.getBrochureUrl());
        // Room details
        property.setBedrooms(dto.getBedrooms());
        property.setBathrooms(dto.getBathrooms());
        property.setSqft(dto.getSqft());
        property.setFeatured(dto.isFeatured());
        // Extended fields
        property.setBuildingType(dto.getBuildingType());
        property.setPropertyCategory(dto.getPropertyCategory());
        property.setCity(dto.getCity());
        property.setMicroMarket(dto.getMicroMarket());
        property.setLocality(dto.getLocality());
        property.setFlooring(dto.getFlooring());
        property.setFloorNumber(dto.getFloorNumber());
        property.setTotalFloors(dto.getTotalFloors());
        property.setUnitNumber(dto.getUnitNumber());
        property.setAvailableFrom(dto.getAvailableFrom());
        property.setTags(dto.getTags());
        property.setFurnishingDetails(dto.getFurnishingDetails());
        property.setFurnishingStatus(dto.getFurnishingStatus());
        property.setAgentName(dto.getAgentName());
        property.setAgentPhotoUrl(dto.getAgentPhotoUrl());
        property.setAmenities(dto.getAmenities());

        return toDto(propertyRepository.save(property));
    }

    @Override
    public BulkPropertyUploadResponse bulkUploadProperties(MultipartFile file, String adminEmail) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Please select a non-empty .xlsx file");
        }
        String filename = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase(Locale.ROOT);
        if (!filename.endsWith(".xlsx")) {
            throw new BadRequestException("Only .xlsx Excel files are supported");
        }

        int created = 0;
        int failed = 0;
        List<String> errors = new ArrayList<>();
        DataFormatter formatter = new DataFormatter();

        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            if (workbook.getNumberOfSheets() == 0) {
                throw new BadRequestException("The workbook does not contain a sheet");
            }
            Sheet sheet = workbook.getSheetAt(0);
            Row headerRow = sheet.getRow(0);
            Map<String, Integer> headers = readHeaders(headerRow, formatter);
            for (String required : List.of("title", "description", "location", "type")) {
                if (!headers.containsKey(required)) {
                    throw new BadRequestException("Missing required column: " + required);
                }
            }

            for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
                Row row = sheet.getRow(rowIndex);
                if (isBlankRow(row, formatter)) continue;
                try {
                    PropertyCreateDTO dto = toPropertyDto(row, headers, formatter, rowIndex + 1);
                    createProperty(dto, adminEmail);
                    created++;
                } catch (Exception ex) {
                    failed++;
                    errors.add("Row " + (rowIndex + 1) + ": " + safeMessage(ex));
                }
            }
        } catch (IOException | RuntimeException ex) {
            if (ex instanceof BadRequestException badRequest) throw badRequest;
            throw new BadRequestException("Could not read the Excel file: " + safeMessage(ex));
        }

        return new BulkPropertyUploadResponse(created, failed, errors);
    }

    private Map<String, Integer> readHeaders(Row row, DataFormatter formatter) {
        if (row == null) throw new BadRequestException("The first row must contain column headers");
        Map<String, Integer> headers = new HashMap<>();
        for (Cell cell : row) {
            String header = formatter.formatCellValue(cell).trim().toLowerCase(Locale.ROOT)
                    .replace(" ", "").replace("_", "");
            if (!header.isBlank()) headers.put(header, cell.getColumnIndex());
        }
        return headers;
    }

    private PropertyCreateDTO toPropertyDto(Row row, Map<String, Integer> headers, DataFormatter formatter, int rowNumber) {
        PropertyCreateDTO dto = new PropertyCreateDTO();
        dto.setTitle(requiredText(row, headers, formatter, "title", rowNumber));
        dto.setDescription(requiredText(row, headers, formatter, "description", rowNumber));
        dto.setLocation(requiredText(row, headers, formatter, "location", rowNumber));
        String type = requiredText(row, headers, formatter, "type", rowNumber).toUpperCase(Locale.ROOT);
        try {
            dto.setType(PropertyType.valueOf(type));
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("type must be SALE or RENT");
        }
        dto.setPrice(decimal(row, headers, formatter, "price"));
        dto.setRentAmount(decimal(row, headers, formatter, "rentamount"));
        dto.setSize(text(row, headers, formatter, "size"));
        dto.setImageUrl(text(row, headers, formatter, "imageurl"));
        dto.setImageGallery(text(row, headers, formatter, "imagegallery"));
        dto.setBrochureUrl(text(row, headers, formatter, "brochureurl"));
        dto.setBedrooms(integer(row, headers, formatter, "bedrooms"));
        dto.setBathrooms(integer(row, headers, formatter, "bathrooms"));
        dto.setSqft(integer(row, headers, formatter, "sqft"));
        dto.setFeatured(booleanValue(row, headers, formatter, "featured"));
        dto.setBuildingType(text(row, headers, formatter, "buildingtype"));
        dto.setPropertyCategory(text(row, headers, formatter, "propertycategory"));
        dto.setCity(text(row, headers, formatter, "city"));
        dto.setMicroMarket(text(row, headers, formatter, "micromarket"));
        dto.setLocality(text(row, headers, formatter, "locality"));
        dto.setFlooring(text(row, headers, formatter, "flooring"));
        dto.setFloorNumber(integer(row, headers, formatter, "floornumber"));
        dto.setTotalFloors(integer(row, headers, formatter, "totalfloors"));
        dto.setUnitNumber(integer(row, headers, formatter, "unitnumber"));
        dto.setAvailableFrom(text(row, headers, formatter, "availablefrom"));
        dto.setTags(text(row, headers, formatter, "tags"));
        dto.setFurnishingDetails(text(row, headers, formatter, "furnishingdetails"));
        dto.setFurnishingStatus(text(row, headers, formatter, "furnishingstatus"));
        dto.setAgentName(text(row, headers, formatter, "agentname"));
        dto.setAgentPhotoUrl(text(row, headers, formatter, "agentphotourl"));
        dto.setAmenities(text(row, headers, formatter, "amenities"));
        return dto;
    }

    private String requiredText(Row row, Map<String, Integer> headers, DataFormatter formatter, String key, int rowNumber) {
        String value = text(row, headers, formatter, key);
        if (value == null || value.isBlank()) throw new BadRequestException(key + " is required");
        return value;
    }

    private String text(Row row, Map<String, Integer> headers, DataFormatter formatter, String key) {
        Integer column = headers.get(key);
        if (column == null) return null;
        Cell cell = row.getCell(column, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        return cell == null ? null : formatter.formatCellValue(cell).trim();
    }

    private BigDecimal decimal(Row row, Map<String, Integer> headers, DataFormatter formatter, String key) {
        String value = text(row, headers, formatter, key);
        if (value == null || value.isBlank()) return null;
        try { return new BigDecimal(value.replace(",", "")); }
        catch (NumberFormatException ex) { throw new BadRequestException(key + " must be a number"); }
    }

    private Integer integer(Row row, Map<String, Integer> headers, DataFormatter formatter, String key) {
        String value = text(row, headers, formatter, key);
        if (value == null || value.isBlank()) return null;
        try { return new BigDecimal(value.replace(",", "")).intValueExact(); }
        catch (ArithmeticException | NumberFormatException ex) { throw new BadRequestException(key + " must be a whole number"); }
    }

    private boolean booleanValue(Row row, Map<String, Integer> headers, DataFormatter formatter, String key) {
        String value = text(row, headers, formatter, key);
        return value != null && (value.equalsIgnoreCase("true") || value.equalsIgnoreCase("yes") || value.equals("1"));
    }

    private boolean isBlankRow(Row row, DataFormatter formatter) {
        if (row == null) return true;
        for (Cell cell : row) if (!formatter.formatCellValue(cell).trim().isBlank()) return false;
        return true;
    }

    private String safeMessage(Exception ex) {
        return ex.getMessage() == null || ex.getMessage().isBlank() ? ex.getClass().getSimpleName() : ex.getMessage();
    }

    @Override
    public PropertyResponseDTO updateProperty(Long id, PropertyUpdateDTO dto) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));
        validateTypeAmounts(dto.getType(), dto.getPrice(), dto.getRentAmount());
        property.setTitle(dto.getTitle());
        property.setDescription(dto.getDescription());
        property.setPrice(dto.getPrice());
        property.setRentAmount(dto.getRentAmount());
        property.setLocation(dto.getLocation());
        property.setSize(dto.getSize());
        property.setType(dto.getType());
        property.setStatus(dto.getStatus());
        // Media
        property.setImageUrl(dto.getImageUrl());
        property.setImageGallery(dto.getImageGallery());
        property.setBrochureUrl(dto.getBrochureUrl());
        // Room details
        property.setBedrooms(dto.getBedrooms());
        property.setBathrooms(dto.getBathrooms());
        property.setSqft(dto.getSqft());
        property.setFeatured(dto.isFeatured());
        // Extended fields
        property.setBuildingType(dto.getBuildingType());
        property.setPropertyCategory(dto.getPropertyCategory());
        property.setCity(dto.getCity());
        property.setMicroMarket(dto.getMicroMarket());
        property.setLocality(dto.getLocality());
        property.setFlooring(dto.getFlooring());
        property.setFloorNumber(dto.getFloorNumber());
        property.setTotalFloors(dto.getTotalFloors());
        property.setUnitNumber(dto.getUnitNumber());
        property.setAvailableFrom(dto.getAvailableFrom());
        property.setTags(dto.getTags());
        property.setFurnishingDetails(dto.getFurnishingDetails());
        property.setFurnishingStatus(dto.getFurnishingStatus());

        return toDto(propertyRepository.save(property));
    }

    @Override
    public void deleteProperty(Long id, String callerEmail) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));

        User caller = getAdmin(callerEmail);

        // RBAC: ADMIN can only delete properties they created; SUPER_ADMIN can delete any
        if (caller.getRole() == Role.ADMIN && !property.getCreatedBy().getId().equals(caller.getId())) {
            throw new BadRequestException("You can only delete properties you created");
        }

        propertyRepository.deleteById(id);
    }

    @Override
    public PurchaseResponseDTO purchaseProperty(Long id, PurchaseRequestDTO dto, String adminEmail) {
        User admin = getAdmin(adminEmail);
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));
        if (property.getType() != PropertyType.SALE) {
            throw new BadRequestException("Only SALE properties can be purchased");
        }
        if (property.getStatus() != PropertyStatus.AVAILABLE) {
            throw new BadRequestException("Property is not available for sale");
        }
        property.setStatus(PropertyStatus.SOLD);
        propertyRepository.save(property);

        Purchase purchase = new Purchase();
        purchase.setProperty(property);
        purchase.setBuyerName(dto.getBuyerName());
        purchase.setBuyerPhone(dto.getBuyerPhone());
        purchase.setPurchasePrice(dto.getPurchasePrice());
        purchase.setPurchaseDate(LocalDateTime.now());
        purchase.setHandledBy(admin);
        Purchase saved = purchaseRepository.save(purchase);

        return new PurchaseResponseDTO(
                saved.getId(),
                saved.getProperty().getId(),
                saved.getBuyerName(),
                saved.getBuyerPhone(),
                saved.getPurchasePrice(),
                saved.getPurchaseDate()
        );
    }

    @Override
    public RentalResponseDTO rentProperty(Long id, RentalRequestDTO dto, String adminEmail) {
        User admin = getAdmin(adminEmail);
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));
        if (property.getType() != PropertyType.RENT) {
            throw new BadRequestException("Only RENT properties can be rented");
        }
        if (property.getStatus() != PropertyStatus.AVAILABLE) {
            throw new BadRequestException("Property is not available for rent");
        }
        property.setStatus(PropertyStatus.RENTED);
        propertyRepository.save(property);

        Rental rental = new Rental();
        rental.setProperty(property);
        rental.setTenantName(dto.getTenantName());
        rental.setTenantPhone(dto.getTenantPhone());
        rental.setMonthlyRent(dto.getMonthlyRent());
        rental.setStartDate(dto.getStartDate());
        rental.setEndDate(dto.getEndDate());
        rental.setHandledBy(admin);
        Rental saved = rentalRepository.save(rental);

        return new RentalResponseDTO(
                saved.getId(),
                saved.getProperty().getId(),
                saved.getTenantName(),
                saved.getTenantPhone(),
                saved.getMonthlyRent(),
                saved.getStartDate(),
                saved.getEndDate()
        );
    }

    private User getAdmin(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
    }

    private void validateTypeAmounts(PropertyType type, java.math.BigDecimal price, java.math.BigDecimal rentAmount) {
        if (type == PropertyType.SALE && (price == null)) {
            throw new BadRequestException("Price is required for SALE properties");
        }
        if (type == PropertyType.RENT && (rentAmount == null)) {
            throw new BadRequestException("Rent amount is required for RENT properties");
        }
    }

    private PropertyResponseDTO toDto(Property property) {
        PropertyResponseDTO dto = new PropertyResponseDTO();
        dto.setId(property.getId());
        dto.setTitle(property.getTitle());
        dto.setDescription(property.getDescription());
        dto.setPrice(property.getPrice());
        dto.setRentAmount(property.getRentAmount());
        dto.setLocation(property.getLocation());
        dto.setSize(property.getSize());
        dto.setType(property.getType());
        dto.setStatus(property.getStatus());
        dto.setCreatedBy(property.getCreatedBy().getId());
        dto.setCreatedAt(property.getCreatedAt());
        dto.setImageUrl(property.getImageUrl());
        dto.setImageGallery(property.getImageGallery());
        dto.setBrochureUrl(property.getBrochureUrl());
        dto.setBedrooms(property.getBedrooms());
        dto.setBathrooms(property.getBathrooms());
        dto.setSqft(property.getSqft());
        dto.setFeatured(property.isFeatured());
        dto.setBuildingType(property.getBuildingType());
        dto.setPropertyCategory(property.getPropertyCategory());
        dto.setCity(property.getCity());
        dto.setMicroMarket(property.getMicroMarket());
        dto.setLocality(property.getLocality());
        dto.setFlooring(property.getFlooring());
        dto.setFloorNumber(property.getFloorNumber());
        dto.setTotalFloors(property.getTotalFloors());
        dto.setUnitNumber(property.getUnitNumber());
        dto.setAvailableFrom(property.getAvailableFrom());
        dto.setTags(property.getTags());
        dto.setFurnishingDetails(property.getFurnishingDetails());
        dto.setFurnishingStatus(property.getFurnishingStatus());
        dto.setAgentName(property.getAgentName());
        dto.setAgentPhotoUrl(property.getAgentPhotoUrl());
        dto.setAmenities(property.getAmenities());
        // Use real count from property_likes table for accuracy (#16)
        long realCount = propertyLikeRepository.countByPropertyId(property.getId());
        dto.setReactionsCount((int) realCount);
        return dto;
    }

    @Override
    public org.springframework.data.domain.Page<PropertyResponseDTO> getAllProperties(org.springframework.data.domain.Pageable pageable) {
        return propertyRepository.findAll(pageable).map(this::toDto);
    }

    @Override
    public PropertyResponseDTO getPropertyById(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));
        return toDto(property);
    }
}
