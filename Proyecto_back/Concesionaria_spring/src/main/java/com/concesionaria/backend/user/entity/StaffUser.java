package com.concesionaria.backend.user.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "staff_users")
public class StaffUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false) private String firstName;
    @Column(nullable = false) private String lastName;
    @Column(nullable = false, unique = true, length = 8) private String dni;
    @Column(nullable = false, unique = true) private String email;
    @Column(nullable = false) private String passwordHash;
    @Column(nullable = false) private int roleId;
    @Column(nullable = false) private boolean active;

    protected StaffUser() { }

    public StaffUser(String firstName, String lastName, String dni, String email,
                     String passwordHash, int roleId, boolean active) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.dni = dni;
        this.email = email;
        this.passwordHash = passwordHash;
        this.roleId = roleId;
        this.active = active;
    }

    public Long getId() { return id; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getDni() { return dni; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public int getRoleId() { return roleId; }
    public boolean isActive() { return active; }

    public void updateProfile(String firstName, String lastName, int roleId, boolean active) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.roleId = roleId;
        this.active = active;
    }
}
