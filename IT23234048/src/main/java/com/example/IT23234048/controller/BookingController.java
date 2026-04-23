package com.example.IT23234048.controller;

import com.example.IT23234048.dto.BookingCreateDTO;
import com.example.IT23234048.dto.BookingResponseDTO;
import com.example.IT23234048.dto.BookingUpdateDTO;
import com.example.IT23234048.model.BookingStatus;
import com.example.IT23234048.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    // Student endpoints

    @PostMapping
    public ResponseEntity<?> createBooking(@Valid @RequestBody BookingCreateDTO createDTO) {
        try {
            BookingResponseDTO response = bookingService.createBooking(createDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingResponseDTO>> getMyBookings(@RequestParam String studentId) {
        List<BookingResponseDTO> bookings = bookingService.getBookingsByStudent(studentId);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<?> getBooking(@PathVariable String bookingId) {
        try {
            BookingResponseDTO booking = bookingService.getBookingById(bookingId);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{bookingId}")
    public ResponseEntity<?> updateBooking(
            @PathVariable String bookingId,
            @RequestParam String studentId,
            @Valid @RequestBody BookingUpdateDTO updateDTO) {
        try {
            BookingResponseDTO response = bookingService.updateBooking(bookingId, studentId, updateDTO);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{bookingId}")
    public ResponseEntity<?> deleteBooking(
            @PathVariable String bookingId,
            @RequestParam String studentId) {
        try {
            bookingService.deleteBooking(bookingId, studentId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Admin endpoints

    @GetMapping("/admin/all")
    public ResponseEntity<List<BookingResponseDTO>> getAllBookings() {
        List<BookingResponseDTO> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/admin/status/{status}")
    public ResponseEntity<List<BookingResponseDTO>> getBookingsByStatus(@PathVariable BookingStatus status) {
        List<BookingResponseDTO> bookings = bookingService.getBookingsByStatus(status);
        return ResponseEntity.ok(bookings);
    }

    @PutMapping("/admin/{bookingId}/approve")
    public ResponseEntity<?> approveBooking(@PathVariable String bookingId) {
        try {
            BookingResponseDTO response = bookingService.approveBooking(bookingId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/admin/{bookingId}/reject")
    public ResponseEntity<?> rejectBooking(@PathVariable String bookingId) {
        try {
            BookingResponseDTO response = bookingService.rejectBooking(bookingId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/admin/{bookingId}")
    public ResponseEntity<?> deleteBookingByAdmin(@PathVariable String bookingId) {
        try {
            bookingService.deleteBookingByAdmin(bookingId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
