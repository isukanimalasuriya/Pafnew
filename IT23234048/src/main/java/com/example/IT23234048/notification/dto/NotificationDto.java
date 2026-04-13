package com.example.IT23234048.notification.dto;

import com.example.IT23234048.notification.model.NotificationType;
import java.time.Instant;

public record NotificationDto(
        String id,
        String userId,
        String message,
        NotificationType type,
        boolean isRead,
        Instant createdAt
) {}

