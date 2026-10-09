package com.concesionaria.backend.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

public record CreateStaffUserRequest(@NotBlank String firstName, @NotBlank String lastName,
                                     @NotBlank @Pattern(regexp = "[0-9]{8}") String dni,
                                     @NotBlank @Email String email,
                                     @NotBlank @Pattern(regexp = "(?=.*[A-Z])(?=.*[0-9]).{8,}") String password,
                                     @Positive int roleId, boolean active) {
    public String normalizedEmail() { return email.trim().toLowerCase(); }
}
