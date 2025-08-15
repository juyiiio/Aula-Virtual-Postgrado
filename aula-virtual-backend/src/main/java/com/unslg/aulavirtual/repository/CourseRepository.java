package com.unslg.aulavirtual.repository;

import com.unslg.aulavirtual.entity.Course;
import com.unslg.aulavirtual.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    
    Optional<Course> findByCode(String code);
    
    Boolean existsByCode(String code);
    
    List<Course> findByInstructor(User instructor);
    
    List<Course> findByStatus(Course.CourseStatus status);
    
    @Query("SELECT c FROM Course c JOIN c.enrolledStudents s WHERE s.id = :studentId")
    List<Course> findByEnrolledStudentsId(@Param("studentId") Long studentId);
    
    @Query("SELECT c FROM Course c WHERE c.name LIKE %:search% OR c.code LIKE %:search% OR c.description LIKE %:search%")
    List<Course> findBySearchTerm(@Param("search") String search);
    
    List<Course> findByAcademicPeriod(String academicPeriod);
}
