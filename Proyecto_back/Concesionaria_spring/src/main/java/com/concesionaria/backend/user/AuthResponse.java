package com.concesionaria.backend.user;

public record AuthResponse(Long userId, String email, String firstName, String lastName,
                           int roleId, String role, String message) {
    public static AuthResponse from(StaffUser user) {
        return new AuthResponse(user.getId(), user.getEmail(), user.getFirstName(), user.getLastName(),
            user.getRoleId(),
            StaffUserResponse.from(user).roleName(), "Inicio de sesión correcto");
    }
}
