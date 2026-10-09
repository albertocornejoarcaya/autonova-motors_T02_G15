package com.concesionaria.backend.vehicle.dto;

import com.concesionaria.backend.vehicle.entity.Vehicle;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.math.BigDecimal;

public record VehicleRequest(
        @NotBlank @Pattern(regexp = "[A-Za-z0-9]{17}") String vin,
        @NotBlank String makeModel,
        @Min(1886) int year,
        @NotBlank String category,
        String lot,
        @NotBlank String status,
        String fuel,
        String transmission,
        String engine,
        @NotNull @DecimalMin("0.01") BigDecimal price,
        String imageUrl,
        String specifications,
        String location,
        @Min(0) int stock) {
    public Vehicle toEntity(String normalizedVin) {
        return new Vehicle(normalizedVin, makeModel.trim(), year, category.trim(), lot, status.trim(),
                fuel, transmission, engine, price, imageUrl, specifications, location, stock);
    }
}
