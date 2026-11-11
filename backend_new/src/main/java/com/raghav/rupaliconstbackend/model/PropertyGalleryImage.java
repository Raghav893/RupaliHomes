package com.raghav.rupaliconstbackend.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** A gallery item stored inside the property's JSONB gallery. List order is preserved. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PropertyGalleryImage {
    @NotBlank
    @Size(max = 1000)
    private String url;
    @Size(max = 500)
    private String caption;
    @PositiveOrZero
    private Integer order;
}
