package com.unslg.aulavirtual.repository;

import com.unslg.aulavirtual.entity.CalendarEvent;
import com.unslg.aulavirtual.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CalendarEventRepository extends JpaRepository<CalendarEvent, Long> {
    
    List<CalendarEvent> findByCourse(Course course);
    
    List<CalendarEvent> findByCourseId(Long courseId);
    
    List<CalendarEvent> findByEventType(CalendarEvent.EventType eventType);
    
    @Query("SELECT e FROM CalendarEvent e WHERE e.startDatetime BETWEEN :startDate AND :endDate")
    List<CalendarEvent> findByDateRange(@Param("startDate") LocalDateTime startDate, 
                                       @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT e FROM CalendarEvent e WHERE e.createdBy.id = :userId OR e.course.id IN (SELECT c.id FROM Course c JOIN c.enrolledStudents s WHERE s.id = :userId)")
    List<CalendarEvent> findByUserId(@Param("userId") Long userId);
}
