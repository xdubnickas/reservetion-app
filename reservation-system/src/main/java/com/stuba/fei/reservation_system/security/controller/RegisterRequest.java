package com.stuba.fei.reservation_system.security.controller;


import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;

public class RegisterRequest {
    @NotEmpty(message = "Username is required")
    private String username;

    @NotEmpty(message = "Password is required")
    @Size(min = 5, message = "Password must be at least 5 characters long")
    private String password;

    @NotEmpty(message = "Name is required")
    private String firstName;

    @NotEmpty(message = "lastName is required")
    private String lastName;

    @NotEmpty(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @Enumerated(EnumType.STRING)
    @NotNull(message = "Role is required")
    private UserRole role;

    @Getter
    private String phoneNumber;  // Môže byť null, nie je povinné

    @Getter
    private String companyName;  // Môže byť null, nie je povinné

    public @NotEmpty(message = "Username is required") String getUsername() {
        return username;
    }

    public void setUsername(@NotEmpty(message = "Username is required") String username) {
        this.username = username;
    }

    public @NotEmpty(message = "Password is required") @Size(min = 5, message = "Password must be at least 5 characters long") String getPassword() {
        return password;
    }

    public void setPassword(@NotEmpty(message = "Password is required") @Size(min = 5, message = "Password must be at least 5 characters long") String password) {
        this.password = password;
    }

    public @NotEmpty(message = "Name is required") String getFirstName() {
        return firstName;
    }

    public void setFirstName(@NotEmpty(message = "Name is required") String firstName) {
        this.firstName = firstName;
    }

    public @NotEmpty(message = "lastName is required") String getlastName() {
        return lastName;
    }

    public void setlastName(@NotEmpty(message = "lastName is required") String lastName) {
        this.lastName = lastName;
    }

    public @NotEmpty(message = "Email is required") @Email(message = "Invalid email format") String getEmail() {
        return email;
    }

    public void setEmail(@NotEmpty(message = "Email is required") @Email(message = "Invalid email format") String email) {
        this.email = email;
    }

    public @NotNull(message = "Role is required") UserRole getRole() {
        return role;
    }

    public void setRole(@NotNull(message = "Role is required") UserRole role) {
        this.role = role;
    }

}
