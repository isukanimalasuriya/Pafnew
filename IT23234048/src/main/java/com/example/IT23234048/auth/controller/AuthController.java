package com.example.IT23234048.auth.controller;

import com.example.IT23234048.auth.dto.AuthRequest;
import com.example.IT23234048.auth.dto.AuthResponse;
import com.example.IT23234048.auth.model.User;
import com.example.IT23234048.auth.service.JwtService;
import com.example.IT23234048.auth.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService userService;
    private final JwtService jwtService;

    public AuthController(UserService userService, JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequest request) {
        try {
            User user = userService.registerUser(request.getName(), request.getEmail(), request.getPassword());
            String token = jwtService.generateToken(user);
            return ResponseEntity.ok(new AuthResponse(token, user.getName(), user.getEmail()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        Optional<User> userOpt = userService.login(request.getEmail(), request.getPassword());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (!user.isActive()) {
                return ResponseEntity.status(403).body("Account suspended by an administrator.");
            }
            String token = jwtService.generateToken(user);
            return ResponseEntity.ok(new AuthResponse(token, user.getName(), user.getEmail()));
        }
        return ResponseEntity.status(401).body("Invalid email or password");
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestAttribute("userId") String userId) {
        return userService.findById(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Temporary utility to upgrade your account to ADMIN during testing
    @GetMapping("/make-me-admin")
    public ResponseEntity<?> makeMeAdmin(@RequestParam String email) {
        Optional<User> userOpt = userService.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            userService.updateUserRole(user.getId(), com.example.IT23234048.auth.model.Role.ADMIN);
            return ResponseEntity.ok("Success! " + email + " is now an ADMIN. Please log out and log back in to apply changes.");
        }
        return ResponseEntity.status(404).body("User not found with email: " + email);
    }
}
