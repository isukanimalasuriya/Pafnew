package com.example.IT23234048.dto;

import com.example.IT23234048.model.BookingStatus;
import java.time.LocalDateTime;

public class BookingResponseDTO {

    private String id;
    private String resourceId;
    private String resourceName;
    private String studentId;
    private String studentName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String purpose;
    private Integer expectedAttendees;
    private BookingStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public BookingResponseDTO() {
    }

    // Constructor from Booking entity
    public BookingResponseDTO(com.example.IT23234048.model.Booking booking) {
        this.id = booking.getId();
        this.resourceId = booking.getResource() != null ? booking.getResource().getId() : null;
        this.resourceName = booking.getResource() != null ? booking.getResource().getName() : null;
        this.studentId = booking.getStudent() != null ? booking.getStudent().getId() : null;
        this.studentName = booking.getStudent() != null ? booking.getStudent().getUsername() : null;
        this.startTime = booking.getStartTime();
        this.endTime = booking.getEndTime();
        this.purpose = booking.getPurpose();
        this.expectedAttendees = booking.getExpectedAttendees();
        this.status = booking.getStatus();
        this.createdAt = booking.getCreatedAt();
        this.updatedAt = booking.getUpdatedAt();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getResourceId() {
        return resourceId;
    }

    public void setResourceId(String resourceId) {
        this.resourceId = resourceId;
    }

    public String getResourceName() {
        return resourceName;
    }

    public void setResourceName(String resourceName) {
        this.resourceName = resourceName;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public Integer getExpectedAttendees() {
        return expectedAttendees;
    }

    public void setExpectedAttendees(Integer expectedAttendees) {
        this.expectedAttendees = expectedAttendees;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}