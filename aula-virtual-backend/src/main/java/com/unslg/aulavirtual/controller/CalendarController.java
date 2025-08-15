package com.unslg.aulavirtual.controller;

import com.unslg.aulavirtual.dto.response.ApiResponse;
import com.unslg.aulavirtual.entity.CalendarEvent;
import com.unslg.aulavirtual.service.CalendarService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final CalendarService calendarService;

    @GetMapping("/events")
    public ResponseEntity<ApiResponse<List<CalendarEvent>>> getAllEvents() {
        List<CalendarEvent> events = calendarService.getAllEvents();
        return ResponseEntity.ok(ApiResponse.success("Events retrieved successfully", events));
    }

    @GetMapping("/events/{id}")
    public ResponseEntity<ApiResponse<CalendarEvent>> getEventById(@PathVariable Long id) {
        CalendarEvent event = calendarService.getEventById(id);
        return ResponseEntity.ok(ApiResponse.success("Event retrieved successfully", event));
    }

    @GetMapping("/events/course/{courseId}")
    public ResponseEntity<ApiResponse<List<CalendarEvent>>> getEventsByCourse(@PathVariable Long courseId) {
        List<CalendarEvent> events = calendarService.getEventsByCourse(courseId);
        return ResponseEntity.ok(ApiResponse.success("Course events retrieved successfully", events));
    }

    @GetMapping("/events/range")
    public ResponseEntity<ApiResponse<List<CalendarEvent>>> getEventsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<CalendarEvent> events = calendarService.getEventsByDateRange(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Events retrieved successfully", events));
    }

    @GetMapping("/events/user/{userId}")
    public ResponseEntity<ApiResponse<List<CalendarEvent>>> getEventsByUser(@PathVariable Long userId) {
        List<CalendarEvent> events = calendarService.getEventsByUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User events retrieved successfully", events));
    }

    @PostMapping("/events")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<CalendarEvent>> createEvent(@RequestBody CalendarEvent event) {
        CalendarEvent createdEvent = calendarService.createEvent(event);
        return ResponseEntity.ok(ApiResponse.success("Event created successfully", createdEvent));
    }

    @PutMapping("/events/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<CalendarEvent>> updateEvent(@PathVariable Long id, @RequestBody CalendarEvent eventDetails) {
        CalendarEvent event = calendarService.updateEvent(id, eventDetails);
        return ResponseEntity.ok(ApiResponse.success("Event updated successfully", event));
    }

    @DeleteMapping("/events/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(@PathVariable Long id) {
        calendarService.deleteEvent(id);
        return ResponseEntity.ok(ApiResponse.success("Event deleted successfully"));
    }
}
