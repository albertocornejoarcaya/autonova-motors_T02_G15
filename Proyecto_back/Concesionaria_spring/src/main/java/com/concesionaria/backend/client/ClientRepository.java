package com.concesionaria.backend.client;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ClientRepository extends JpaRepository<Client, Long> {
    boolean existsByDni(String dni);
    boolean existsByEmailIgnoreCase(String email);
}
