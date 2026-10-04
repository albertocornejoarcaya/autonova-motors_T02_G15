package com.concesionaria.backend.user;

public record StaffUserResponse(Long id, String firstName, String lastName, String dni,
                                String email, int roleId, String roleName, String status) {
    public static StaffUserResponse from(StaffUser user) {
        String roleName = switch (user.getRoleId()) {
            case 1 -> "Administrador";
            case 2 -> "Asesor de Ventas";
            case 3 -> "Jefe de Almacén";
            default -> "Sin rol";
        };
        return new StaffUserResponse(user.getId(), user.getFirstName(), user.getLastName(), user.getDni(),
                user.getEmail(), user.getRoleId(), roleName, user.isActive() ? "Activo" : "Inactivo");
    }
}
