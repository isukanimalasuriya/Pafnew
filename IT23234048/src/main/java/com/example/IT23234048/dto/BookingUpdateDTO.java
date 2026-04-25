package com.example.IT23234048.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public class BookingUpdateDTO {

    @NotNull(message = "Start time is required")
    @FutureOrPresent(message = "Start time must be in the future or present")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    @FutureOrPresent(message = "End time must be in the future or present")
    private LocalDateTime endTime;

    @NotNull(message = "Purpose is required")
    @Size(min = 3, max = 500, message = "Purpose must be between 3 and 500 characters")
    private String purpose;

    @NotNull(message = "Expected attendees is required")
    @Min(value = 1, message = "Expected attendees must be at least 1")
    @Max(value = 100, message = "Expected attendees must be at most 100")
    private Integer expectedAttendees;

    public BookingUpdateDTO() {
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
}