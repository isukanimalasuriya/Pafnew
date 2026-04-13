package com.example.IT23234048.notification.service;

import com.example.IT23234048.notification.dto.NotificationDto;
import com.example.IT23234048.notification.model.Notification;
import com.example.IT23234048.notification.model.NotificationType;
import com.example.IT23234048.notification.repository.NotificationRepository;
import java.util.List;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.messaging.simp.SimpMessagingTemplate;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(NotificationRepository notificationRepository, SimpMessagingTemplate messagingTemplate) {
        this.notificationRepository = notificationRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public List<NotificationDto> getNotificationsForUser(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(NotificationService::toDto)
                .toList();
    }

    public NotificationDto createNotification(String userId, String message, NotificationType type) {
        Notification saved = notificationRepository.save(new Notification(userId, message, type));
        NotificationDto dto = toDto(saved);
        messagingTemplate.convertAndSend("/topic/users/" + userId + "/notifications", dto);
        return dto;
    }

    public NotificationDto markAsRead(String id, String currentUserId) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));

        if (!n.getUserId().equals(currentUserId)) {
            throw new AccessDeniedException("Not allowed");
        }

        if (!n.isRead()) {
            n.setRead(true);
            n = notificationRepository.save(n);
        }

        return toDto(n);
    }

    public void delete(String id, String currentUserId) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));

        if (!n.getUserId().equals(currentUserId)) {
            throw new AccessDeniedException("Not allowed");
        }

        notificationRepository.deleteById(id);
    }

    private static NotificationDto toDto(Notification n) {
        return new NotificationDto(
                n.getId(),
                n.getUserId(),
                n.getMessage(),
                n.getType(),
                n.isRead(),
                n.getCreatedAt()
        );
    }
}

