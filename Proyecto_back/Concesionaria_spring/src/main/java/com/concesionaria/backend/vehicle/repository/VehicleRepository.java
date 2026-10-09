package com.concesionaria.backend.vehicle.repository;

import com.concesionaria.backend.vehicle.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VehicleRepository extends JpaRepository<Vehicle, String> {
	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("select vehicle from Vehicle vehicle where vehicle.vin = :vin")
	java.util.Optional<Vehicle> findByVinForUpdate(@Param("vin") String vin);
}
