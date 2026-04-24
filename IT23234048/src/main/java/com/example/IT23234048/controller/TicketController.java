package com.example.IT23234048.controller;

import com.example.IT23234048.dto.AssignTicketDTO;
import com.example.IT23234048.dto.CommentCreateDTO;
import com.example.IT23234048.dto.ResolutionDTO;
import com.example.IT23234048.dto.TicketRequestDTO;
import com.example.IT23234048.dto.TicketStatusUpdateDTO;
import com.example.IT23234048.model.Comment;
import com.example.IT23234048.model.Ticket;
import com.example.IT23234048.model.UserRole;
import com.example.IT23234048.service.ImageUploadService;
import com.example.IT23234048.service.TicketService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.io.IOException;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/tickets")
public class TicketController {
    
    private final TicketService ticketService;
    private final ImageUploadService imageUploadService;
    private final com.example.IT23234048.auth.repository.UserRepository userRepository;

    public TicketController(TicketService ticketService, ImageUploadService imageUploadService, com.example.IT23234048.auth.repository.UserRepository userRepository) {
        this.ticketService = ticketService;
        this.imageUploadService = imageUploadService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<Ticket> createTicket(
            @Valid @RequestBody TicketRequestDTO dto,
            HttpServletRequest request
    ) {
        String userId = (String) request.getAttribute("userId");
        if (userId == null) userId = "user@campus.lk"; // Fallback for tests
        return new ResponseEntity<>(ticketService.createTicket(dto, userId), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Ticket>> getTickets(HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        String userEmail = null;
        if (userId != null) {
            userEmail = userRepository.findById(userId)
                .map(com.example.IT23234048.auth.model.User::getEmail)
                .orElse(null);
        }
        UserRole role = getCurrentUserRole();
        return ResponseEntity.ok(ticketService.getTickets(userId, userEmail, role));
    }

    @GetMapping("/{ticketId}")
    public ResponseEntity<Ticket> getTicketById(@PathVariable String ticketId) {
        return ResponseEntity.ok(ticketService.getTicketById(ticketId));
    }

    @PutMapping("/{ticketId}/status")
    public ResponseEntity<Ticket> updateTicketStatus(
            @PathVariable String ticketId,
            @Valid @RequestBody TicketStatusUpdateDTO dto
    ) {
        return ResponseEntity.ok(ticketService.updateTicketStatus(ticketId, dto));
    }

    @PatchMapping("/{ticketId}/assign")
    public ResponseEntity<Ticket> assignTicket(
            @PathVariable String ticketId,
            @Valid @RequestBody AssignTicketDTO dto,
            HttpServletRequest request
    ) {
        String userId = (String) request.getAttribute("userId");
        String userEmail = null;
        if (userId != null) {
            userEmail = userRepository.findById(userId)
                .map(com.example.IT23234048.auth.model.User::getEmail)
                .orElse(null);
        }
        if (userEmail == null) userEmail = "tech@example.com";
        UserRole role = getCurrentUserRole();
        return ResponseEntity.ok(ticketService.assignTicket(ticketId, dto, userEmail, role));
    }

    @PutMapping("/{ticketId}/resolution")
    public ResponseEntity<Ticket> resolveTicket(
            @PathVariable String ticketId,
            @Valid @RequestBody ResolutionDTO dto
    ) {
        return ResponseEntity.ok(ticketService.resolveTicket(ticketId, dto));
    }

    @DeleteMapping("/{ticketId}")
    public ResponseEntity<Void> deleteTicket(@PathVariable String ticketId) {
        UserRole role = getCurrentUserRole();
        ticketService.deleteTicket(ticketId, role);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{ticketId}/comments")
    public ResponseEntity<Comment> addComment(
            @PathVariable String ticketId,
            @Valid @RequestBody CommentCreateDTO dto,
            HttpServletRequest request
    ) {
        String userId = (String) request.getAttribute("userId");
        if (userId == null) userId = "user@example.com";
        UserRole role = getCurrentUserRole();
        return new ResponseEntity<>(ticketService.addComment(ticketId, dto, userId, role), HttpStatus.CREATED);
    }

    @PostMapping("/{ticketId}/images")
    public ResponseEntity<List<String>> uploadImages(
            @PathVariable String ticketId,
            @RequestParam("files") List<MultipartFile> files
    ) throws IOException {
        if (files.size() > 3) {
            return ResponseEntity.badRequest().build();
        }
        List<String> uploadedUrls = imageUploadService.uploadImages(files);
        ticketService.addImageUrls(ticketId, uploadedUrls);
        return ResponseEntity.ok(uploadedUrls);
    }

    private UserRole getCurrentUserRole() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getAuthorities() != null) {
            for (org.springframework.security.core.GrantedAuthority authority : auth.getAuthorities()) {
                String roleStr = authority.getAuthority().replace("ROLE_", "");
                try {
                    return UserRole.valueOf(roleStr);
                } catch (IllegalArgumentException e) {
                    // Ignore
                }
            }
        }
        return UserRole.USER;
    }
}
