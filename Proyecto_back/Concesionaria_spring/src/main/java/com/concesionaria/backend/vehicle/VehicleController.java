package com.concesionaria.backend.vehicle;

import java.util.List;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {
    private final VehicleRepository vehicles;

    public VehicleController(VehicleRepository vehicles) {
        this.vehicles = vehicles;
    }

    @GetMapping
    public List<VehicleResponse> list() {
        return vehicles.findAll().stream().map(VehicleResponse::from).toList();
    }

    @GetMapping("/{vin}")
    public VehicleResponse get(@PathVariable String vin) {
        return vehicles.findById(vin.toUpperCase()).map(VehicleResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehículo no encontrado"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VehicleResponse create(@Valid @RequestBody VehicleRequest request) {
        String vin = request.vin().trim().toUpperCase();
        if (vehicles.existsById(vin)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un vehículo con ese VIN");
        }
        return VehicleResponse.from(vehicles.save(request.toEntity(vin)));
    }

    @PutMapping("/{vin}/inventory")
    public VehicleResponse updateInventory(@PathVariable String vin, @Valid @RequestBody InventoryUpdateRequest request) {
        Vehicle vehicle = vehicles.findById(vin.toUpperCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehículo no encontrado"));
        vehicle.updateInventory(request.status(), request.location(), request.stock());
        return VehicleResponse.from(vehicles.save(vehicle));
    }
}
