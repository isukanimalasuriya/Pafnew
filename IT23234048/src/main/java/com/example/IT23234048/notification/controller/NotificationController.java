package com.example.IT23234048.notification.controller;

import com.example.IT23234048.notification.dto.CreateNotificationRequest;
import com.example.IT23234048.notification.dto.NotificationDto;
import com.example.IT23234048.notification.service.NotificationService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<NotificationDto>> getMyNotifications(Authentication authentication) {
        String userId = authentication.getPrincipal().toString();
        return ResponseEntity.ok(notificationService.getNotificationsForUser(userId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<NotificationDto> create(@Valid @RequestBody CreateNotificationRequest req) {
        NotificationDto created = notificationService.createNotification(req.getUserId(), req.getMessage(), req.getType());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationDto> markAsRead(@PathVariable String id, Authentication authentication) {
        String userId = authentication.getPrincipal().toString();
        return ResponseEntity.ok(notificationService.markAsRead(id, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id, Authentication authentication) {
        String userId = authentication.getPrincipal().toString();
        notificationService.delete(id, userId);
        return ResponseEntity.noContent().build();
    }
}

