package com.concesionaria.backend.user.service;

import com.concesionaria.backend.user.dto.CreateStaffUserRequest;
import com.concesionaria.backend.user.dto.StaffUserResponse;
import com.concesionaria.backend.user.dto.UpdateStaffUserRequest;
import com.concesionaria.backend.user.entity.StaffUser;
import com.concesionaria.backend.user.repository.StaffUserRepository;
import jakarta.servlet.http.HttpSession;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserServiceImpl implements UserService {
    private final StaffUserRepository users;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(StaffUserRepository users, PasswordEncoder passwordEncoder) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public List<StaffUserResponse> listUsers() {
        return users.findAll().stream().map(StaffUserResponse::from).toList();
    }

    @Override
    public StaffUserResponse createUser(CreateStaffUserRequest request) {
        if (request.roleId() > 3) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role must be 1, 2 or 3");
        }
        if (users.existsByDni(request.dni()) || users.existsByEmailIgnoreCase(request.normalizedEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "DNI or email already registered");
        }
        StaffUser user = new StaffUser(
                request.firstName().trim(),
                request.lastName().trim(),
                request.dni(),
                request.normalizedEmail(),
                passwordEncoder.encode(request.password()),
                request.roleId(),
                request.active());
        return StaffUserResponse.from(users.save(user));
    }

    @Override
    public StaffUserResponse updateUser(Long id, UpdateStaffUserRequest request) {
        if (request.roleId() > 3) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role must be 1, 2 or 3");
        }
        StaffUser user = users.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        boolean removingActiveAdmin = user.getRoleId() == 1 && user.isActive()
                && (request.roleId() != 1 || !request.active());
        if (removingActiveAdmin && users.countByRoleIdAndActiveTrue(1) <= 1) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cannot deactivate or demote the last active administrator");
        }
        user.updateProfile(request.firstName().trim(), request.lastName().trim(), request.roleId(), request.active());
        return StaffUserResponse.from(users.save(user));
    }

    @Override
    public void deleteUser(Long id, HttpSession session) {
        StaffUser user = users.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (user.getId().equals(session.getAttribute("userId"))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot delete the signed-in account");
        }
        if (user.getRoleId() == 1 && user.isActive() && users.countByRoleIdAndActiveTrue(1) <= 1) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cannot delete the last active administrator");
        }
        users.delete(user);
    }
}
