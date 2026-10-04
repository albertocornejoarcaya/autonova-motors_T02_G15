package com.concesionaria.backend.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

public record CreateStaffUserRequest(@NotBlank String firstName, @NotBlank String lastName,
                                     @NotBlank @Pattern(regexp = "[0-9]{8}", message = "debe tener exactamente 8 dígitos") String dni,
                                     @NotBlank @Email String email,
                                     @NotBlank @Pattern(regexp = "(?=.*[A-Z])(?=.*[0-9]).{8,}", message = "debe tener mínimo 8 caracteres, una mayúscula y un número") String password,
                                     @Positive int roleId, boolean active) {
    public String normalizedEmail() { return email.trim().toLowerCase(); }
}
