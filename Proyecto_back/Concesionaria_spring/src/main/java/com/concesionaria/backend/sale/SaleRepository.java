package com.concesionaria.backend.sale;

import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SaleRepository extends JpaRepository<Sale, Long> {
    @EntityGraph(attributePaths = {"reservation", "reservation.vehicle"})
    List<Sale> findAll();
}