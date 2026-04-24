package com.example.IT23234048.repository;

import com.example.IT23234048.model.Ticket;
import com.example.IT23234048.model.TicketStatus;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TicketRepository extends MongoRepository<Ticket, String> {
    List<Ticket> findByDeletedFalseOrderByCreatedAtDesc();

    List<Ticket> findByCreatedByAndDeletedFalseOrderByCreatedAtDesc(String createdBy);

    List<Ticket> findByAssignedToAndDeletedFalseOrderByCreatedAtDesc(String assignedTo);

    List<Ticket> findByStatusAndDeletedFalse(TicketStatus status);
}
