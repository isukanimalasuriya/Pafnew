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
import com.example.IT23234048.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;
import java.util.stream.Collectors;
import org.bson.types.ObjectId;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ResourceService resourceService;

    @Autowired
    private StudentRepository studentRepository;

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
        student = resolveStudent(createDTO.getUserId());

        validateBookingPayload(
                createDTO.getStartTime(),
                createDTO.getEndTime(),
                createDTO.getExpectedAttendees(),
                resource.getCapacity()
        );

        // Check for conflicts
        List<Booking> conflicts = bookingRepository.findOverlappingBookings(
            new ObjectId(createDTO.getResourceId()),
            createDTO.getStartTime(),
            createDTO.getEndTime()
        );

        if (!conflicts.isEmpty()) {
            throw new Exception("resource is not available");
        }

        // Check for student conflicts
        List<Booking> studentConflicts = bookingRepository.findOverlappingBookingsForStudent(
            new ObjectId(student.getId()),
            createDTO.getStartTime(),
            createDTO.getEndTime()
        );

        if (!studentConflicts.isEmpty()) {
            throw new Exception("You already have a booking during this time period");
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
        Student student = resolveStudent(studentId);
        List<Booking> bookings = bookingRepository.findByStudentId(student.getId());
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
        Student currentStudent = resolveStudent(studentId);

        // Check if student owns the booking
        if (!booking.getStudent().getId().equals(currentStudent.getId())) {
            throw new Exception("You can only update your own bookings");
        }

        // Check if booking is still pending
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new Exception("Only pending bookings can be updated");
        }

        validateBookingPayload(
                updateDTO.getStartTime(),
                updateDTO.getEndTime(),
                updateDTO.getExpectedAttendees(),
                booking.getResource() != null ? booking.getResource().getCapacity() : null
        );

        // Check for conflicts (excluding current booking)
        List<Booking> conflicts = bookingRepository.findOverlappingBookingsExcludingCurrent(
            new ObjectId(booking.getResource().getId()),
            updateDTO.getStartTime(),
            updateDTO.getEndTime(),
            bookingId
        );

        if (!conflicts.isEmpty()) {
            throw new Exception("resource is not available");
        }

        // Check for student conflicts (excluding current booking)
        List<Booking> studentConflicts = bookingRepository.findOverlappingBookingsForStudentExcludingCurrent(
            new ObjectId(currentStudent.getId()),
            updateDTO.getStartTime(),
            updateDTO.getEndTime(),
            bookingId
        );

        if (!studentConflicts.isEmpty()) {
            throw new Exception("You already have another booking during this time period");
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
        Student currentStudent = resolveStudent(studentId);

        // Check if student owns the booking
        if (!booking.getStudent().getId().equals(currentStudent.getId())) {
            throw new Exception("You can only delete your own bookings");
        }

        if (booking.getStatus() != BookingStatus.CANCELLED) {
            throw new Exception("Only cancelled bookings can be deleted");
        }

        bookingRepository.deleteById(bookingId);
    }

    public BookingResponseDTO cancelBooking(String bookingId, String studentId) throws Exception {
        Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
        if (bookingOpt.isEmpty()) {
            throw new Exception("Booking not found");
        }

        Booking booking = bookingOpt.get();
        Student currentStudent = resolveStudent(studentId);

        if (!booking.getStudent().getId().equals(currentStudent.getId())) {
            throw new Exception("You can only cancel your own bookings");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new Exception("Only pending bookings can be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        Booking savedBooking = bookingRepository.save(booking);
        return new BookingResponseDTO(savedBooking);
    }

    // Admin methods
    public List<BookingResponseDTO> getAllBookings() {
        List<Booking> bookings = bookingRepository.findAll();
        return bookings.stream()
                .map(BookingResponseDTO::new)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getBookingAnalytics() {
        List<Booking> allBookings = bookingRepository.findAll();
        long totalBookings = allBookings.size();

        Map<String, Long> popularResources = allBookings.stream()
                .filter(b -> b.getResource() != null)
                .collect(Collectors.groupingBy(b -> b.getResource().getName(), Collectors.counting()));

        Map<String, Long> statusDistribution = allBookings.stream()
                .filter(b -> b.getStatus() != null)
                .collect(Collectors.groupingBy(b -> b.getStatus().name(), Collectors.counting()));

        Map<String, Long> peakHours = allBookings.stream()
                .filter(b -> b.getStartTime() != null)
                .collect(Collectors.groupingBy(b -> String.format("%02d:00", b.getStartTime().getHour()), Collectors.counting()));

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalBookings", totalBookings);
        analytics.put("popularResources", popularResources);
        analytics.put("statusDistribution", statusDistribution);
        analytics.put("peakHours", peakHours);
        
        return analytics;
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

    private Student resolveStudent(String identity) {
        if (identity == null || identity.isBlank()) {
            throw new IllegalArgumentException("User identity is required");
        }

        Optional<Student> byDocId = studentRepository.findById(identity);
        if (byDocId.isPresent()) return byDocId.get();

        Optional<Student> byStudentId = studentRepository.findAll().stream()
                .filter(student -> identity.equals(student.getStudentId()))
                .findFirst();
        if (byStudentId.isPresent()) return byStudentId.get();

        Optional<Student> byEmail = studentRepository.findAll().stream()
                .filter(student -> identity.equalsIgnoreCase(student.getEmail()))
                .findFirst();
        if (byEmail.isPresent()) return byEmail.get();

        Optional<User> userOpt = userRepository.findById(identity);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            Student student = new Student();
            student.setStudentId(user.getId());
            student.setUsername(user.getName());
            student.setEmail(user.getEmail());
            student.setPassword("managed-by-auth");
            return studentRepository.save(student);
        }

        // Accept email as booking identity to avoid id mismatch issues.
        Optional<User> userByEmail = userRepository.findByEmail(identity);
        if (userByEmail.isPresent()) {
            User user = userByEmail.get();
            Optional<Student> existing = studentRepository.findAll().stream()
                    .filter(student -> user.getEmail().equalsIgnoreCase(student.getEmail()))
                    .findFirst();
            if (existing.isPresent()) return existing.get();

            Student student = new Student();
            student.setStudentId(user.getId());
            student.setUsername(user.getName());
            student.setEmail(user.getEmail());
            student.setPassword("managed-by-auth");
            return studentRepository.save(student);
        }

        throw new IllegalArgumentException("Student not found");
    }

    private void validateBookingPayload(
            LocalDateTime startTime,
            LocalDateTime endTime,
            Integer expectedAttendees,
            Integer resourceCapacity
    ) throws Exception {
        LocalDateTime now = LocalDateTime.now();

        if (startTime == null || endTime == null) {
            throw new Exception("Start time and end time are required");
        }
        if (!startTime.isBefore(endTime)) {
            throw new Exception("Start time must be before end time");
        }
        if (startTime.isBefore(now) || endTime.isBefore(now)) {
            throw new Exception("Booking times must be in the present or future");
        }
        if (expectedAttendees == null) {
            throw new Exception("Expected attendees is required");
        }
        
        if (resourceCapacity == null) {
            throw new Exception("Resource capacity is not configured");
        }
        if (expectedAttendees > resourceCapacity) {
            throw new Exception("Expected attendees cannot exceed resource capacity");
        }
    }
}