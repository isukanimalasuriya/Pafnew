package com.example.IT23234048.exception;

public class TicketNotFoundException extends RuntimeException {
    public TicketNotFoundException(String ticketId) {
        super("Ticket not found: " + ticketId);
    }
}
