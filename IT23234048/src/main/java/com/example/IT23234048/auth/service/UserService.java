package com.example.IT23234048.auth.service;

import com.example.IT23234048.auth.model.Role;
import com.example.IT23234048.auth.model.User;
import com.example.IT23234048.auth.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> findById(String id) {
        return userRepository.findById(id);
    }

    public User upsertOAuthUser(String name, String email) {
        return userRepository
                .findByEmail(email)
                .map(existing -> {
                    if (name != null && !name.isBlank() && !name.equals(existing.getName())) {
                        existing.setName(name);
                        return userRepository.save(existing);
                    }
                    return existing;
                })
                .orElseGet(() -> userRepository.save(new User(name, email, Role.USER)));
    }

    public User registerUser(String name, String email, String password) {
        if (name == null || name.isBlank()) {
            throw new RuntimeException("Name is required");
        }
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Email is required");
        }
        if (password == null || password.length() < 6) {
            throw new RuntimeException("Password must be at least 6 characters");
        }
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Account already exists with this email");
        }
        String encodedPassword = passwordEncoder.encode(password);
        User user = new User(name, email, encodedPassword, Role.USER);
        return userRepository.save(user);
    }

    public Optional<User> login(String email, String password) {
        return userRepository.findByEmail(email)
                .filter(user -> user.getPassword() != null && passwordEncoder.matches(password, user.getPassword()));
    }

    public java.util.List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User updateUserRole(String id, Role role) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(role);
        return userRepository.save(user);
    }

    public User toggleUserStatus(String id, boolean active) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(active);
        return userRepository.save(user);
    }
}
