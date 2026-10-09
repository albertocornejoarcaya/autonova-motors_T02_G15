package com.concesionaria.backend.vehicle.service;

import com.concesionaria.backend.vehicle.dto.InventoryUpdateRequest;
import com.concesionaria.backend.vehicle.dto.VehicleRequest;
import com.concesionaria.backend.vehicle.dto.VehicleResponse;
import com.concesionaria.backend.vehicle.entity.Vehicle;
import com.concesionaria.backend.vehicle.repository.VehicleRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class VehicleServiceImpl implements VehicleService {
    private final VehicleRepository vehicles;

    public VehicleServiceImpl(VehicleRepository vehicles) {
        this.vehicles = vehicles;
    }

    @Override
    public List<VehicleResponse> listVehicles() {
        return vehicles.findAll().stream().map(VehicleResponse::from).toList();
    }

    @Override
    public VehicleResponse getVehicle(String vin) {
        return vehicles.findById(vin.toUpperCase()).map(VehicleResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehicle not found"));
    }

    @Override
    public VehicleResponse createVehicle(VehicleRequest request) {
        String vin = request.vin().trim().toUpperCase();
        if (vehicles.existsById(vin)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "VIN already exists");
        }
        return VehicleResponse.from(vehicles.save(request.toEntity(vin)));
    }

    @Override
    public VehicleResponse updateInventory(String vin, InventoryUpdateRequest request) {
        Vehicle vehicle = vehicles.findById(vin.toUpperCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehicle not found"));
        vehicle.updateInventory(request.status(), request.location(), request.stock());
        return VehicleResponse.from(vehicles.save(vehicle));
    }
}
