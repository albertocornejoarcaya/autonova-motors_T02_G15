package com.concesionaria.backend.vehicle.service;

import com.concesionaria.backend.vehicle.dto.InventoryUpdateRequest;
import com.concesionaria.backend.vehicle.dto.VehicleRequest;
import com.concesionaria.backend.vehicle.dto.VehicleResponse;
import java.util.List;

public interface VehicleService {
    List<VehicleResponse> listVehicles();
    VehicleResponse getVehicle(String vin);
    VehicleResponse createVehicle(VehicleRequest request);
    VehicleResponse updateInventory(String vin, InventoryUpdateRequest request);
}
