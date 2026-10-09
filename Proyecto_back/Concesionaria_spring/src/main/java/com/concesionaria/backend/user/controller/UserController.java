package com.concesionaria.backend.user.controller;

import com.concesionaria.backend.user.dto.CreateStaffUserRequest;
import com.concesionaria.backend.user.dto.StaffUserResponse;
import com.concesionaria.backend.user.dto.UpdateStaffUserRequest;
import com.concesionaria.backend.user.service.UserService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<StaffUserResponse> list() {
        return userService.listUsers();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public StaffUserResponse create(@Valid @RequestBody CreateStaffUserRequest request) {
        return userService.createUser(request);
    }

    @PutMapping("/{id}")
    public StaffUserResponse update(@PathVariable Long id, @Valid @RequestBody UpdateStaffUserRequest request) {
        return userService.updateUser(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, HttpSession session) {
        userService.deleteUser(id, session);
    }
}
