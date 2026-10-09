package com.concesionaria.backend.user.dto;

import com.concesionaria.backend.user.entity.StaffUser;

public record AuthResponse(Long userId, String email, String firstName, String lastName,
                           int roleId, String role, String message) {
    public static AuthResponse from(StaffUser user) {
        return new AuthResponse(user.getId(), user.getEmail(), user.getFirstName(), user.getLastName(),
            user.getRoleId(),
            StaffUserResponse.from(user).roleName(), "Login succeeded");
    }
}
