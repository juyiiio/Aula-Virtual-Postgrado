package com.unslg.aulavirtual.repository;

import com.unslg.aulavirtual.entity.Exam;
import com.unslg.aulavirtual.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {
    
    List<Exam> findByCourse(Course course);
    
    List<Exam> findByCourseId(Long courseId);
    
    List<Exam> findByStatus(Exam.ExamStatus status);
    
    List<Exam> findByExamType(Exam.ExamType examType);
    
    @Query("SELECT e FROM Exam e WHERE e.startTime BETWEEN :startDate AND :endDate")
    List<Exam> findByStartTimeBetween(@Param("startDate") LocalDateTime startDate, 
                                     @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT e FROM Exam e JOIN e.course c JOIN c.enrolledStudents s WHERE s.id = :studentId")
    List<Exam> findByStudentId(@Param("studentId") Long studentId);
}
