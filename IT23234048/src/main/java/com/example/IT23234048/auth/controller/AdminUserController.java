package com.example.IT23234048.auth.controller;

import com.example.IT23234048.auth.dto.AuthRequest;
import com.example.IT23234048.auth.model.Role;
import com.example.IT23234048.auth.model.User;
import com.example.IT23234048.auth.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {
    private final UserService userService;

    public AdminUserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        // Expose all users to the Admin dashboard
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody AuthRequest request) {
        try {
            // Admins can manually register users via the dashboard
            User user = userService.registerUser(request.getName(), request.getEmail(), request.getPassword());
            return ResponseEntity.status(201).body(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<?> updateUserRole(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            @RequestAttribute("userId") String currentUserId) {
        // Prevent admins from demoting themselves and losing access
        if (id.equals(currentUserId)) {
            return ResponseEntity.badRequest().body("You cannot change your own role.");
        }
        try {
            Role role = Role.valueOf(body.get("role"));
            User updated = userService.updateUserRole(id, role);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid role format.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update role.");
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> toggleUserStatus(
            @PathVariable String id,
            @RequestBody Map<String, Boolean> body,
            @RequestAttribute("userId") String currentUserId) {
        // Prevent admins from accidentally banning themselves
        if (id.equals(currentUserId)) {
            return ResponseEntity.badRequest().body("You cannot change your own status.");
        }
        try {
            boolean active = body.getOrDefault("active", true);
            User updated = userService.toggleUserStatus(id, active);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to toggle user status.");
        }
    }
}
