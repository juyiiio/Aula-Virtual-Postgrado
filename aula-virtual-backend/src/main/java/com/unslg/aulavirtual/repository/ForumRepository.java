package com.unslg.aulavirtual.repository;

import com.unslg.aulavirtual.entity.Forum;
import com.unslg.aulavirtual.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ForumRepository extends JpaRepository<Forum, Long> {
    
    List<Forum> findByCourse(Course course);
    
    List<Forum> findByCourseId(Long courseId);
    
    List<Forum> findByStatus(Forum.ForumStatus status);
    
    List<Forum> findByForumType(Forum.ForumType forumType);
    
    @Query("SELECT f FROM Forum f WHERE f.title LIKE %:search% OR f.description LIKE %:search%")
    List<Forum> findBySearchTerm(@Param("search") String search);
    
    @Query("SELECT f FROM Forum f ORDER BY f.lastActivity DESC")
    List<Forum> findAllOrderByLastActivity();
}
