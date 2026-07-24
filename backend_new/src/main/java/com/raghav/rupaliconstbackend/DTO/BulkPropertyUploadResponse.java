package com.raghav.rupaliconstbackend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BulkPropertyUploadResponse {
    private int created;
    private int failed;
    private List<String> errors;
}
