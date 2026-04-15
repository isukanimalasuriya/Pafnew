package com.example.IT23234048.controller;

import com.example.IT23234048.dto.TicketRequestDTO;
import com.example.IT23234048.model.Ticket;
import com.example.IT23234048.service.TicketService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api")
public class TicketController {
    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping("/tickets")
    public ResponseEntity<Ticket> createTicket(
            @Valid @RequestBody TicketRequestDTO dto,
            @RequestHeader(value = "X-User-Id", defaultValue = "user@campus.lk") String userId
    ) {
        return new ResponseEntity<>(ticketService.createTicket(dto, userId), HttpStatus.CREATED);
    }

    @GetMapping("/tickets")
    public ResponseEntity<List<Ticket>> getTickets() {
        return ResponseEntity.ok(ticketService.getTickets());
    }

    @GetMapping("/tickets/{ticketId}")
    public ResponseEntity<Ticket> getTicketById(@PathVariable String ticketId) {
        return ResponseEntity.ok(ticketService.getTicketById(ticketId));
    }
}
