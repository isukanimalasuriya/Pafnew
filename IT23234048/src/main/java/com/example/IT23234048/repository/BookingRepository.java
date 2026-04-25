package com.example.IT23234048.repository;

import com.example.IT23234048.model.Booking;
import com.example.IT23234048.model.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import org.bson.types.ObjectId;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByStudentId(String studentId);

    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByResourceId(String resourceId);

    // Find overlapping bookings for a resource
    @Query("{ 'resource.$id': ?0, 'status': { $in: ['PENDING', 'APPROVED'] }, $or: [ " +
           "{ $and: [ { 'startTime': { $lt: ?2 } }, { 'endTime': { $gt: ?1 } } ] }, " +
           "{ $and: [ { 'startTime': { $gte: ?1 } }, { 'startTime': { $lt: ?2 } } ] }, " +
           "{ $and: [ { 'endTime': { $gt: ?1 } }, { 'endTime': { $lte: ?2 } } ] } ] }")
    List<Booking> findOverlappingBookings(ObjectId resourceId, LocalDateTime startTime, LocalDateTime endTime);

    // Exclude current booking when updating
    @Query("{ '_id': { $ne: ?3 }, 'resource.$id': ?0, 'status': { $in: ['PENDING', 'APPROVED'] }, $or: [ " +
           "{ $and: [ { 'startTime': { $lt: ?2 } }, { 'endTime': { $gt: ?1 } } ] }, " +
           "{ $and: [ { 'startTime': { $gte: ?1 } }, { 'startTime': { $lt: ?2 } } ] }, " +
           "{ $and: [ { 'endTime': { $gt: ?1 } }, { 'endTime': { $lte: ?2 } } ] } ] }")
    List<Booking> findOverlappingBookingsExcludingCurrent(ObjectId resourceId, LocalDateTime startTime, LocalDateTime endTime, String excludeBookingId);

    // Find overlapping bookings for a student
    @Query("{ 'student.$id': ?0, 'status': { $in: ['PENDING', 'APPROVED'] }, $or: [ " +
           "{ $and: [ { 'startTime': { $lt: ?2 } }, { 'endTime': { $gt: ?1 } } ] }, " +
           "{ $and: [ { 'startTime': { $gte: ?1 } }, { 'startTime': { $lt: ?2 } } ] }, " +
           "{ $and: [ { 'endTime': { $gt: ?1 } }, { 'endTime': { $lte: ?2 } } ] } ] }")
    List<Booking> findOverlappingBookingsForStudent(ObjectId studentId, LocalDateTime startTime, LocalDateTime endTime);

    // Find overlapping bookings for a student excluding current
    @Query("{ '_id': { $ne: ?3 }, 'student.$id': ?0, 'status': { $in: ['PENDING', 'APPROVED'] }, $or: [ " +
           "{ $and: [ { 'startTime': { $lt: ?2 } }, { 'endTime': { $gt: ?1 } } ] }, " +
           "{ $and: [ { 'startTime': { $gte: ?1 } }, { 'startTime': { $lt: ?2 } } ] }, " +
           "{ $and: [ { 'endTime': { $gt: ?1 } }, { 'endTime': { $lte: ?2 } } ] } ] }")
    List<Booking> findOverlappingBookingsForStudentExcludingCurrent(ObjectId studentId, LocalDateTime startTime, LocalDateTime endTime, String excludeBookingId);
}