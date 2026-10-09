package com.concesionaria.backend.vehicle.dto;

import com.concesionaria.backend.vehicle.entity.Vehicle;
import java.math.BigDecimal;

public record VehicleResponse(String vin, String makeModel, int year, String category, String lot,
                              String status, String fuel, String transmission, String engine,
                              BigDecimal price, String imageUrl, String specifications, String location, int stock) {
    public static VehicleResponse from(Vehicle vehicle) {
        return new VehicleResponse(vehicle.getVin(), vehicle.getMakeModel(), vehicle.getYear(),
                vehicle.getCategory(), vehicle.getLot(), vehicle.getStatus(), vehicle.getFuel(),
                vehicle.getTransmission(), vehicle.getEngine(), vehicle.getPrice(), vehicle.getImageUrl(),
                vehicle.getSpecifications(), vehicle.getLocation(), vehicle.getStock());
    }
}
