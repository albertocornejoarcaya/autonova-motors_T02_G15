package com.concesionaria.backend.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public record UpdateStaffUserRequest(@NotBlank String firstName, @NotBlank String lastName,
                                     @Positive int roleId, boolean active) {
}