package com.concesionaria.backend.user.service;

import com.concesionaria.backend.user.dto.CreateStaffUserRequest;
import com.concesionaria.backend.user.dto.StaffUserResponse;
import com.concesionaria.backend.user.dto.UpdateStaffUserRequest;
import jakarta.servlet.http.HttpSession;
import java.util.List;

public interface UserService {
    List<StaffUserResponse> listUsers();
    StaffUserResponse createUser(CreateStaffUserRequest request);
    StaffUserResponse updateUser(Long id, UpdateStaffUserRequest request);
    void deleteUser(Long id, HttpSession session);
}
