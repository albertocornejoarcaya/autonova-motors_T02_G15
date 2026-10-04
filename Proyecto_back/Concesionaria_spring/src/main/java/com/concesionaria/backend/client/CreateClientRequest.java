package com.concesionaria.backend.client;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CreateClientRequest(@NotBlank String firstName, @NotBlank String lastName,
                                  @NotBlank @Pattern(regexp = "[0-9]{8}", message = "debe tener exactamente 8 dígitos") String dni,
                                  @NotBlank String phone, @NotBlank @Email String email,
                                  String address) {
    public Client toEntity() {
        return new Client(firstName.trim(), lastName.trim(), dni, phone.trim(), email.trim().toLowerCase(), address);
    }
}
