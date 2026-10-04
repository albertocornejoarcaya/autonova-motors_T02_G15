package com.concesionaria.backend.user;

import jakarta.servlet.http.HttpSession;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final StaffUserRepository users;
    private final PasswordEncoder passwordEncoder;

    public AuthController(StaffUserRepository users, PasswordEncoder passwordEncoder) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/me")
    public AuthResponse currentUser(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        Object userId = session == null ? null : session.getAttribute("userId");
        if (!(userId instanceof Long id)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Debes iniciar sesión");
        }
        StaffUser user = users.findById(id)
                .filter(StaffUser::isActive)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Debes iniciar sesión"));
        return AuthResponse.from(user);
    }

    @PostMapping("/bootstrap-admin")
    public AuthResponse bootstrapAdmin(@Valid @RequestBody BootstrapAdminRequest request, HttpSession session) {
        if (users.count() != 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un usuario configurado; inicia sesión con una cuenta existente");
        }
        StaffUser admin = users.save(new StaffUser(request.firstName().trim(), request.lastName().trim(),
                request.dni(), request.email().trim().toLowerCase(), passwordEncoder.encode(request.password()), 1, true));
        session.setAttribute("userId", admin.getId());
        session.setAttribute("roleId", admin.getRoleId());
        return AuthResponse.from(admin);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request, HttpServletRequest servletRequest) {
        StaffUser user = users.findByEmailIgnoreCase(request.email().trim())
                .filter(StaffUser::isActive)
                .filter(candidate -> passwordEncoder.matches(request.password(), candidate.getPasswordHash()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Correo o contraseña incorrectos, o la cuenta está inactiva"));
        HttpSession session = servletRequest.getSession(true);
        servletRequest.changeSessionId();
        session.setAttribute("userId", user.getId());
        session.setAttribute("roleId", user.getRoleId());
        return AuthResponse.from(user);
    }

    @PostMapping("/logout")
    public void logout(HttpSession session) {
        session.invalidate();
    }
}
