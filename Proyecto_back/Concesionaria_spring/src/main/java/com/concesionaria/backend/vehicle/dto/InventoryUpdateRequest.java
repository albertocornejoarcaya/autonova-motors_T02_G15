package com.concesionaria.backend.vehicle.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record InventoryUpdateRequest(@NotBlank String status, @NotBlank String location, @Min(0) int stock) {
}
