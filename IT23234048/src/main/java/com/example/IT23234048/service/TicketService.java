package com.example.IT23234048.service;

import com.example.IT23234048.dto.TicketRequestDTO;
import com.example.IT23234048.exception.TicketNotFoundException;
import com.example.IT23234048.model.Ticket;
import com.example.IT23234048.model.TicketStatus;
import com.example.IT23234048.repository.TicketRepository;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TicketService {
    private static final int MAX_IMAGES = 3;

    private final TicketRepository ticketRepository;

    public TicketService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

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

        return ticketRepository.save(ticket);
    }

    public List<Ticket> getTickets() {
        return ticketRepository.findByDeletedFalseOrderByCreatedAtDesc();
    }

    public Ticket getTicketById(String ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException(ticketId));
        if (ticket.isDeleted()) {
            throw new TicketNotFoundException(ticketId);
        }
        return ticket;
    }
}
