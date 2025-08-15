package com.unslg.aulavirtual.repository;

import com.unslg.aulavirtual.entity.Assignment;
import com.unslg.aulavirtual.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    
    List<Assignment> findByCourse(Course course);
    
    List<Assignment> findByCourseId(Long courseId);
    
    List<Assignment> findByStatus(Assignment.AssignmentStatus status);
    
    @Query("SELECT a FROM Assignment a WHERE a.dueDate BETWEEN :startDate AND :endDate")
    List<Assignment> findByDueDateBetween(@Param("startDate") LocalDateTime startDate, 
                                         @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT a FROM Assignment a JOIN a.course c JOIN c.enrolledStudents s WHERE s.id = :studentId")
    List<Assignment> findByStudentId(@Param("studentId") Long studentId);
    
    @Query("SELECT a FROM Assignment a WHERE a.title LIKE %:search% OR a.description LIKE %:search%")
    List<Assignment> findBySearchTerm(@Param("search") String search);
}
