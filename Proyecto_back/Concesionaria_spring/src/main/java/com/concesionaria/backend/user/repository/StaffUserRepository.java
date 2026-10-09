package com.concesionaria.backend.user.repository;

import com.concesionaria.backend.user.entity.StaffUser;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StaffUserRepository extends JpaRepository<StaffUser, Long> {
    Optional<StaffUser> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByDni(String dni);
    long countByRoleIdAndActiveTrue(int roleId);
}
