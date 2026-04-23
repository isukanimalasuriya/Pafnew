package com.example.IT23234048.service;

import com.example.IT23234048.auth.model.Role;
import com.example.IT23234048.auth.model.User;
import com.example.IT23234048.auth.repository.UserRepository;
import com.example.IT23234048.dto.BookingCreateDTO;
import com.example.IT23234048.dto.BookingResponseDTO;
import com.example.IT23234048.dto.BookingUpdateDTO;
import com.example.IT23234048.model.Booking;
import com.example.IT23234048.model.BookingStatus;
import com.example.IT23234048.model.Resource;
import com.example.IT23234048.model.Student;
import com.example.IT23234048.notification.model.NotificationType;
import com.example.IT23234048.notification.service.NotificationService;
import com.example.IT23234048.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ResourceService resourceService;

    @Autowired
    private StudentService studentService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    public BookingResponseDTO createBooking(BookingCreateDTO createDTO) throws Exception {
        // Validate resource exists
        Resource resource;
        try {
            resource = resourceService.getById(createDTO.getResourceId());
        } catch (Exception e) {
            throw new Exception("Resource not found");
        }

        // Validate student exists
        Student student;
        try {
            student = studentService.getStudentByStudentId(createDTO.getUserId());
        } catch (Exception e) {
            throw new Exception("Student not found");
        }

        // Validate time range
        if (createDTO.getStartTime().isAfter(createDTO.getEndTime())) {
            throw new Exception("Start time must be before end time");
        }

        // Check for conflicts
        List<Booking> conflicts = bookingRepository.findOverlappingBookings(
            createDTO.getResourceId(),
            createDTO.getStartTime(),
            createDTO.getEndTime()
        );

        if (!conflicts.isEmpty()) {
            throw new Exception("Resource is already booked for this time period");
        }

        // Create booking
        Booking booking = new Booking();
        booking.setResource(resource);
        booking.setStudent(student);
        booking.setStartTime(createDTO.getStartTime());
        booking.setEndTime(createDTO.getEndTime());
        booking.setPurpose(createDTO.getPurpose());
        booking.setExpectedAttendees(createDTO.getExpectedAttendees());
        booking.setStatus(BookingStatus.PENDING);

        Booking savedBooking = bookingRepository.save(booking);

        // Notify admins
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        for (User admin : admins) {
            notificationService.createNotification(
                    admin.getId(),
                    "New booking request for " + resource.getName() + " by " + student.getUsername(),
                    NotificationType.BOOKING_CREATED
            );
        }

        return new BookingResponseDTO(savedBooking);
    }

    public List<BookingResponseDTO> getBookingsByStudent(String studentId) {
        List<Booking> bookings = bookingRepository.findByStudentId(studentId);
        return bookings.stream()
                .map(BookingResponseDTO::new)
                .collect(Collectors.toList());
    }

    public BookingResponseDTO getBookingById(String bookingId) throws Exception {
        Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
        if (bookingOpt.isEmpty()) {
            throw new Exception("Booking not found");
        }
        return new BookingResponseDTO(bookingOpt.get());
    }

    public BookingResponseDTO updateBooking(String bookingId, String studentId, BookingUpdateDTO updateDTO) throws Exception {
        Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
        if (bookingOpt.isEmpty()) {
            throw new Exception("Booking not found");
        }

        Booking booking = bookingOpt.get();

        // Check if student owns the booking
        if (!booking.getStudent().getId().equals(studentId)) {
            throw new Exception("You can only update your own bookings");
        }

        // Check if booking is still pending
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new Exception("Only pending bookings can be updated");
        }

        // Validate time range
        if (updateDTO.getStartTime().isAfter(updateDTO.getEndTime())) {
            throw new Exception("Start time must be before end time");
        }

        // Check for conflicts (excluding current booking)
        List<Booking> conflicts = bookingRepository.findOverlappingBookingsExcludingCurrent(
            booking.getResource().getId(),
            updateDTO.getStartTime(),
            updateDTO.getEndTime(),
            bookingId
        );

        if (!conflicts.isEmpty()) {
            throw new Exception("Resource is already booked for this time period");
        }

        // Update booking
        booking.setStartTime(updateDTO.getStartTime());
        booking.setEndTime(updateDTO.getEndTime());
        booking.setPurpose(updateDTO.getPurpose());
        booking.setExpectedAttendees(updateDTO.getExpectedAttendees());

        Booking savedBooking = bookingRepository.save(booking);
        return new BookingResponseDTO(savedBooking);
    }

    public void deleteBooking(String bookingId, String studentId) throws Exception {
        Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
        if (bookingOpt.isEmpty()) {
            throw new Exception("Booking not found");
        }

        Booking booking = bookingOpt.get();

        // Check if student owns the booking
        if (!booking.getStudent().getId().equals(studentId)) {
            throw new Exception("You can only delete your own bookings");
        }

        bookingRepository.deleteById(bookingId);
    }

    // Admin methods
    public List<BookingResponseDTO> getAllBookings() {
        List<Booking> bookings = bookingRepository.findAll();
        return bookings.stream()
                .map(BookingResponseDTO::new)
                .collect(Collectors.toList());
    }

    public List<BookingResponseDTO> getBookingsByStatus(BookingStatus status) {
        List<Booking> bookings = bookingRepository.findByStatus(status);
        return bookings.stream()
                .map(BookingResponseDTO::new)
                .collect(Collectors.toList());
    }

    public BookingResponseDTO approveBooking(String bookingId) throws Exception {
        return updateBookingStatus(bookingId, BookingStatus.APPROVED);
    }

    public BookingResponseDTO rejectBooking(String bookingId) throws Exception {
        return updateBookingStatus(bookingId, BookingStatus.REJECTED);
    }

    private BookingResponseDTO updateBookingStatus(String bookingId, BookingStatus newStatus) throws Exception {
        Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
        if (bookingOpt.isEmpty()) {
            throw new Exception("Booking not found");
        }

        Booking booking = bookingOpt.get();

        // Only allow status changes from PENDING
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new Exception("Only pending bookings can be approved or rejected");
        }

        booking.setStatus(newStatus);
        Booking savedBooking = bookingRepository.save(booking);

        // Notify student
        if (booking.getStudent() != null) {
            String message = "Your booking for " + booking.getResource().getName() + " has been " + newStatus.name().toLowerCase() + ".";
            NotificationType type = newStatus == BookingStatus.APPROVED ? NotificationType.BOOKING_APPROVED : NotificationType.BOOKING_REJECTED;
            
            // Find user id by student email. Wait, the notification service takes 'userId'. Let's find the user.
            Optional<User> userOpt = userRepository.findByEmail(booking.getStudent().getEmail());
            if (userOpt.isPresent()) {
                notificationService.createNotification(userOpt.get().getId(), message, type);
            }
        }

        return new BookingResponseDTO(savedBooking);
    }

    public void deleteBookingByAdmin(String bookingId) throws Exception {
        if (!bookingRepository.existsById(bookingId)) {
            throw new Exception("Booking not found");
        }
        bookingRepository.deleteById(bookingId);
    }
}