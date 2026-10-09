package com.concesionaria.backend.vehicle.controller;

import com.concesionaria.backend.vehicle.dto.InventoryUpdateRequest;
import com.concesionaria.backend.vehicle.dto.VehicleRequest;
import com.concesionaria.backend.vehicle.dto.VehicleResponse;
import com.concesionaria.backend.vehicle.service.VehicleService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {
    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @GetMapping
    public List<VehicleResponse> list() {
        return vehicleService.listVehicles();
    }

    @GetMapping("/{vin}")
    public VehicleResponse get(@PathVariable String vin) {
        return vehicleService.getVehicle(vin);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VehicleResponse create(@Valid @RequestBody VehicleRequest request) {
        return vehicleService.createVehicle(request);
    }

    @PutMapping("/{vin}/inventory")
    public VehicleResponse updateInventory(@PathVariable String vin, @Valid @RequestBody InventoryUpdateRequest request) {
        return vehicleService.updateInventory(vin, request);
    }
}
