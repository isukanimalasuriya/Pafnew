package com.example.IT23234048.auth.service;

import com.example.IT23234048.auth.model.Role;
import com.example.IT23234048.auth.model.User;
import com.example.IT23234048.auth.repository.UserRepository;
import com.example.IT23234048.notification.model.NotificationType;
import com.example.IT23234048.notification.service.EmailService;
import com.example.IT23234048.notification.service.NotificationService;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;
    private final EmailService emailService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       NotificationService notificationService, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.notificationService = notificationService;
        this.emailService = emailService;
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
                .orElseGet(() -> {
                    User newUser = new User(name, email, Role.USER);
                    newUser.setStatus("PENDING");
                    User saved = userRepository.save(newUser);
                    notifyAdminsOfNewSignup(saved);
                    return saved;
                });
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
        user.setStatus("PENDING"); // New users need admin approval
        User saved = userRepository.save(user);
        notifyAdminsOfNewSignup(saved);
        return saved;
    }

    private void notifyAdminsOfNewSignup(User user) {
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        for (User admin : admins) {
            notificationService.createNotification(
                    admin.getId(),
                    "New user signup pending approval: " + user.getName() + " (" + user.getEmail() + ")",
                    NotificationType.USER_APPROVAL_NEEDED
            );
        }
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
        boolean wasInactive = !user.isActive();
        if (active) {
            user.setStatus("ACTIVE");
        } else {
            user.setStatus("BANNED");
        }
        User saved = userRepository.save(user);
        
        if (wasInactive && active) {
            notificationService.createNotification(
                    saved.getId(),
                    "Your account has been approved by an administrator.",
                    NotificationType.USER_APPROVED
            );
            emailService.sendEmail(
                    saved.getEmail(),
                    "Account Approved",
                    "Hello " + saved.getName() + ",\n\nYour account has been approved by an administrator. You can now log in and use the platform.\n\nThank you!"
            );
        }
        
        return saved;
    }
}
