package com.unslg.aulavirtual.repository;

import com.unslg.aulavirtual.entity.Announcement;
import com.unslg.aulavirtual.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    
    List<Announcement> findByCourse(Course course);
    
    List<Announcement> findByCourseId(Long courseId);
    
    List<Announcement> findByStatus(Announcement.AnnouncementStatus status);
    
    List<Announcement> findByPriority(Announcement.Priority priority);
    
    @Query("SELECT a FROM Announcement a WHERE a.status = 'PUBLISHED' ORDER BY a.isPinned DESC, a.publishedAt DESC")
    List<Announcement> findPublishedOrderByPinnedAndDate();
    
    @Query("SELECT a FROM Announcement a WHERE a.title LIKE %:search% OR a.content LIKE %:search% OR a.summary LIKE %:search%")
    List<Announcement> findBySearchTerm(@Param("search") String search);
    
    List<Announcement> findByIsPinnedTrue();
}
