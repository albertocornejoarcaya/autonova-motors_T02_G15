package com.concesionaria.backend.user;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final StaffUserRepository users;
    private final PasswordEncoder passwordEncoder;

    public UserController(StaffUserRepository users, PasswordEncoder passwordEncoder) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public List<StaffUserResponse> list() {
        return users.findAll().stream().map(StaffUserResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public StaffUserResponse create(@Valid @RequestBody CreateStaffUserRequest request) {
        if (request.roleId() > 3) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El rol debe ser 1 (Administrador), 2 (Asesor de Ventas) o 3 (Jefe de Almacén)");
        }
        if (users.existsByDni(request.dni()) || users.existsByEmailIgnoreCase(request.normalizedEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El DNI o el correo ya están registrados");
        }
        StaffUser user = new StaffUser(request.firstName().trim(), request.lastName().trim(), request.dni(),
                request.normalizedEmail(), passwordEncoder.encode(request.password()), request.roleId(), request.active());
        return StaffUserResponse.from(users.save(user));
    }

    @PutMapping("/{id}")
    public StaffUserResponse update(@PathVariable Long id, @Valid @RequestBody UpdateStaffUserRequest request) {
        if (request.roleId() > 3) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El rol debe ser 1 (Administrador), 2 (Asesor de Ventas) o 3 (Jefe de Almacén)");
        }
        StaffUser user = users.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        boolean removingActiveAdmin = user.getRoleId() == 1 && user.isActive()
                && (request.roleId() != 1 || !request.active());
        if (removingActiveAdmin && users.countByRoleIdAndActiveTrue(1) <= 1) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "No se puede desactivar ni cambiar el rol del último administrador activo");
        }
        user.updateProfile(request.firstName().trim(), request.lastName().trim(), request.roleId(), request.active());
        return StaffUserResponse.from(users.save(user));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, jakarta.servlet.http.HttpSession session) {
        StaffUser user = users.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        if (user.getId().equals(session.getAttribute("userId"))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "No puedes eliminar la cuenta con la que iniciaste sesión");
        }
        if (user.getRoleId() == 1 && user.isActive() && users.countByRoleIdAndActiveTrue(1) <= 1) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "No se puede eliminar el último administrador activo");
        }
        users.delete(user);
    }
}
