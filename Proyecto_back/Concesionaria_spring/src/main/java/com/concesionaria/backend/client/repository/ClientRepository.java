package com.concesionaria.backend.client.repository;

import com.concesionaria.backend.client.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClientRepository extends JpaRepository<Client, Long> {
    boolean existsByDni(String dni);
    boolean existsByEmailIgnoreCase(String email);
}
