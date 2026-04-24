package com.example.IT23234048.service;

import com.example.IT23234048.dto.AssignTicketDTO;
import com.example.IT23234048.dto.CommentCreateDTO;
import com.example.IT23234048.dto.ResolutionDTO;
import com.example.IT23234048.dto.TicketRequestDTO;
import com.example.IT23234048.dto.TicketStatusUpdateDTO;
import com.example.IT23234048.exception.InvalidTicketStateException;
import com.example.IT23234048.exception.TicketNotFoundException;
import com.example.IT23234048.model.Comment;
import com.example.IT23234048.model.Ticket;
import com.example.IT23234048.model.TicketStatus;
import com.example.IT23234048.model.UserRole;
import com.example.IT23234048.notification.model.NotificationType;
import com.example.IT23234048.notification.service.NotificationService;
import com.example.IT23234048.repository.TicketRepository;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TicketService {
    private static final int MAX_IMAGES = 3;

    private final TicketRepository ticketRepository;
    private final NotificationService notificationService;
    private final CommentService commentService;

    public TicketService(TicketRepository ticketRepository, NotificationService notificationService, CommentService commentService) {
        this.ticketRepository = ticketRepository;
        this.notificationService = notificationService; // Using friend's NotificationService from Module D
        this.commentService = commentService;
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'TECHNICIAN')")
    public Ticket createTicket(TicketRequestDTO dto, String createdBy) {
        if (dto.getImageUrls() != null && dto.getImageUrls().size() > MAX_IMAGES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Maximum 3 image URLs allowed");
        }

        Ticket ticket = new Ticket();
        ticket.setResourceId(dto.getResourceId().trim());
        ticket.setResourceName(dto.getResourceName().trim());
        ticket.setCategory(dto.getCategory());
        ticket.setDescription(dto.getDescription().trim());
        ticket.setPriority(dto.getPriority());
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setPreferredContact(dto.getPreferredContact().trim());
        ticket.setImageUrls(dto.getImageUrls() == null ? List.of() : dto.getImageUrls());
        ticket.setCreatedBy(createdBy);
        ticket.setCreatedAt(Instant.now());
        ticket.setDeleted(false);

        Ticket savedTicket = ticketRepository.save(ticket);
        
        // Notify using friend's Notification module
        if (savedTicket.getCreatedBy() != null) {
            notificationService.createNotification(
                savedTicket.getCreatedBy(), 
                "New ticket created: " + savedTicket.getTicketId(), 
                NotificationType.GENERIC
            );
        }
        
        return savedTicket;
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'TECHNICIAN', 'MANAGER')")
    public List<Ticket> getTickets(String userId, String userEmail, UserRole role) {
        if (role == UserRole.ADMIN) {
            return ticketRepository.findByDeletedFalseOrderByCreatedAtDesc();
        } else if (role == UserRole.TECHNICIAN || role == UserRole.MANAGER) {
            return ticketRepository.findByAssignedToAndDeletedFalseOrderByCreatedAtDesc(userEmail);
        } else {
            // UserRole.USER
            return ticketRepository.findByCreatedByAndDeletedFalseOrderByCreatedAtDesc(userId);
        }
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'TECHNICIAN')")
    public Ticket getTicketById(String ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException(ticketId));
        if (ticket.isDeleted()) {
            throw new TicketNotFoundException(ticketId);
        }
        return ticket;
    }

    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public Ticket updateTicketStatus(String ticketId, TicketStatusUpdateDTO dto) {
        Ticket ticket = getTicketById(ticketId);
        TicketStatus oldStatus = ticket.getStatus();
        TicketStatus newStatus = dto.getStatus();

        validateStateTransition(oldStatus, newStatus, dto);

        ticket.setStatus(newStatus);
        
        if (newStatus == TicketStatus.REJECTED) {
            ticket.setRejectedReason(dto.getRejectedReason());
        }
        
        if (newStatus == TicketStatus.RESOLVED) {
            ticket.setResolutionNotes(dto.getResolutionNotes());
            ticket.setResolvedAt(Instant.now());
            if (ticket.getCreatedAt() != null) {
                ticket.setTimeToResolutionMinutes(Duration.between(ticket.getCreatedAt(), ticket.getResolvedAt()).toMinutes());
            }
        }
        
        if (newStatus == TicketStatus.CLOSED) {
            ticket.setClosedAt(Instant.now());
        }

        Ticket updatedTicket = ticketRepository.save(ticket);
        
        if (updatedTicket.getCreatedBy() != null) {
            notificationService.createNotification(
                updatedTicket.getCreatedBy(), 
                "Ticket " + updatedTicket.getTicketId() + " status changed from " + oldStatus + " to " + newStatus, 
                NotificationType.TICKET_STATUS_CHANGED
            );
        }
        
        return updatedTicket;
    }

    private void validateStateTransition(TicketStatus oldStatus, TicketStatus newStatus, TicketStatusUpdateDTO dto) {
        if (oldStatus == TicketStatus.OPEN && newStatus == TicketStatus.IN_PROGRESS) return;
        if (oldStatus == TicketStatus.OPEN && newStatus == TicketStatus.REJECTED) {
            if (dto.getRejectedReason() == null || dto.getRejectedReason().trim().isEmpty()) {
                throw new InvalidTicketStateException("Rejected reason is required");
            }
            return;
        }
        if (oldStatus == TicketStatus.IN_PROGRESS && newStatus == TicketStatus.RESOLVED) {
            if (dto.getResolutionNotes() == null || dto.getResolutionNotes().trim().isEmpty()) {
                throw new InvalidTicketStateException("Resolution notes are required");
            }
            return;
        }
        if (oldStatus == TicketStatus.RESOLVED && newStatus == TicketStatus.CLOSED) return;
        if (oldStatus == TicketStatus.RESOLVED && newStatus == TicketStatus.IN_PROGRESS) return; // Reopen

        throw new InvalidTicketStateException("Invalid status transition from " + oldStatus + " to " + newStatus);
    }

    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public Ticket assignTicket(String ticketId, AssignTicketDTO dto, String currentUserEmail, UserRole role) {
        if (role == UserRole.TECHNICIAN && !dto.getAssignedToEmail().equals(currentUserEmail)) {
            throw new AccessDeniedException("Technicians can only assign tickets to themselves");
        }

        Ticket ticket = getTicketById(ticketId);
        ticket.setAssignedTo(dto.getAssignedToEmail());

        trackFirstResponse(ticket);

        Ticket updatedTicket = ticketRepository.save(ticket);
        
        notificationService.createNotification(
            dto.getAssignedToEmail(), 
            "You have been assigned to ticket " + updatedTicket.getTicketId(), 
            NotificationType.GENERIC
        );
        
        return updatedTicket;
    }

    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public Ticket resolveTicket(String ticketId, ResolutionDTO dto) {
        Ticket ticket = getTicketById(ticketId);
        
        if (ticket.getStatus() != TicketStatus.IN_PROGRESS) {
            throw new InvalidTicketStateException("Ticket must be IN_PROGRESS to resolve");
        }

        ticket.setResolutionNotes(dto.getResolutionNotes());
        ticket.setStatus(TicketStatus.RESOLVED);
        ticket.setResolvedAt(Instant.now());
        
        if (ticket.getCreatedAt() != null) {
            ticket.setTimeToResolutionMinutes(Duration.between(ticket.getCreatedAt(), ticket.getResolvedAt()).toMinutes());
        }

        Ticket updatedTicket = ticketRepository.save(ticket);
        
        if (updatedTicket.getCreatedBy() != null) {
            notificationService.createNotification(
                updatedTicket.getCreatedBy(), 
                "Ticket " + updatedTicket.getTicketId() + " has been resolved", 
                NotificationType.TICKET_STATUS_CHANGED
            );
        }
        
        return updatedTicket;
    }

    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public void deleteTicket(String ticketId, UserRole role) {
        Ticket ticket = getTicketById(ticketId);
        if (role == UserRole.ADMIN) {
            ticketRepository.delete(ticket); // Hard delete
        } else if (role == UserRole.USER) {
            ticket.setDeleted(true);
            ticket.setStatus(TicketStatus.CLOSED);
            ticket.setClosedAt(Instant.now());
            ticketRepository.save(ticket); // Soft delete
        } else {
            throw new AccessDeniedException("Technicians cannot delete tickets");
        }
    }

    @Transactional
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'TECHNICIAN')")
    public Comment addComment(String ticketId, CommentCreateDTO dto, String userId, UserRole role) {
        Ticket ticket = getTicketById(ticketId);
        
        Comment comment = commentService.addComment(ticketId, dto, userId, role);
        
        trackFirstResponse(ticket);
        ticketRepository.save(ticket);
        
        if (ticket.getCreatedBy() != null && !ticket.getCreatedBy().equals(userId)) {
            notificationService.createNotification(
                ticket.getCreatedBy(), 
                "New comment on your ticket " + ticket.getTicketId(), 
                NotificationType.COMMENT_ADDED
            );
        }
        
        return comment;
    }
    
    @Transactional
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'TECHNICIAN')")
    public Ticket addImageUrls(String ticketId, List<String> newUrls) {
        Ticket ticket = getTicketById(ticketId);
        List<String> currentUrls = ticket.getImageUrls() != null ? ticket.getImageUrls() : List.of();
        
        if (currentUrls.size() + newUrls.size() > MAX_IMAGES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Maximum 3 image URLs allowed in total");
        }
        
        currentUrls.addAll(newUrls);
        ticket.setImageUrls(currentUrls);
        return ticketRepository.save(ticket);
    }

    private void trackFirstResponse(Ticket ticket) {
        if (ticket.getFirstRespondedAt() == null && ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setFirstRespondedAt(Instant.now());
            if (ticket.getCreatedAt() != null) {
                ticket.setTimeToFirstResponseMinutes(Duration.between(ticket.getCreatedAt(), ticket.getFirstRespondedAt()).toMinutes());
            }
        }
    }
}
