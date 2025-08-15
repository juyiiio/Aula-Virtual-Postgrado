package com.unslg.aulavirtual.service;

import com.unslg.aulavirtual.entity.CalendarEvent;
import com.unslg.aulavirtual.exception.ResourceNotFoundException;
import com.unslg.aulavirtual.repository.CalendarEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CalendarService {

    private final CalendarEventRepository calendarEventRepository;

    public List<CalendarEvent> getAllEvents() {
        return calendarEventRepository.findAll();
    }

    public CalendarEvent getEventById(Long id) {
        return calendarEventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));
    }

    public List<CalendarEvent> getEventsByCourse(Long courseId) {
        return calendarEventRepository.findByCourseId(courseId);
    }

    public List<CalendarEvent> getEventsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return calendarEventRepository.findByDateRange(startDate, endDate);
    }

    public List<CalendarEvent> getEventsByUser(Long userId) {
        return calendarEventRepository.findByUserId(userId);
    }

    public CalendarEvent createEvent(CalendarEvent event) {
        return calendarEventRepository.save(event);
    }

    public CalendarEvent updateEvent(Long id, CalendarEvent eventDetails) {
        CalendarEvent event = calendarEventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));

        event.setTitle(eventDetails.getTitle());
        event.setDescription(eventDetails.getDescription());
        event.setEventType(eventDetails.getEventType());
        event.setStartDatetime(eventDetails.getStartDatetime());
        event.setEndDatetime(eventDetails.getEndDatetime());
        event.setLocation(eventDetails.getLocation());
        event.setIsVirtual(eventDetails.getIsVirtual());
        event.setMeetingUrl(eventDetails.getMeetingUrl());

        return calendarEventRepository.save(event);
    }

    public void deleteEvent(Long id) {
        CalendarEvent event = calendarEventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));
        calendarEventRepository.delete(event);
    }
}
