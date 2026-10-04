package com.concesionaria.backend.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record BootstrapAdminRequest(@NotBlank String firstName, @NotBlank String lastName,
                                   @NotBlank @Pattern(regexp = "[0-9]{8}", message = "debe tener exactamente 8 dígitos") String dni,
                                   @NotBlank @Email String email,
                                   @NotBlank @Pattern(regexp = "(?=.*[A-Z])(?=.*[0-9]).{8,}", message = "debe tener mínimo 8 caracteres, una mayúscula y un número") String password) {
}
