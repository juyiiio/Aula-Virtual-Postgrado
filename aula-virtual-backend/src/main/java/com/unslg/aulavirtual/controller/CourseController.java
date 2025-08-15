package com.unslg.aulavirtual.controller;

import com.unslg.aulavirtual.dto.request.CourseRequest;
import com.unslg.aulavirtual.dto.response.ApiResponse;
import com.unslg.aulavirtual.dto.response.CourseResponse;
import com.unslg.aulavirtual.service.CourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getAllCourses() {
        List<CourseResponse> courses = courseService.getAllCourses();
        return ResponseEntity.ok(ApiResponse.success("Courses retrieved successfully", courses));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CourseResponse>> getCourseById(@PathVariable Long id) {
        CourseResponse course = courseService.getCourseById(id);
        return ResponseEntity.ok(ApiResponse.success("Course retrieved successfully", course));
    }

    @GetMapping("/instructor/{instructorId}")
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getCoursesByInstructor(@PathVariable Long instructorId) {
        List<CourseResponse> courses = courseService.getCoursesByInstructor(instructorId);
        return ResponseEntity.ok(ApiResponse.success("Instructor courses retrieved successfully", courses));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getCoursesByStudent(@PathVariable Long studentId) {
        List<CourseResponse> courses = courseService.getCoursesByStudent(studentId);
        return ResponseEntity.ok(ApiResponse.success("Student courses retrieved successfully", courses));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<CourseResponse>> createCourse(@Valid @RequestBody CourseRequest request) {
        CourseResponse course = courseService.createCourse(request);
        return ResponseEntity.ok(ApiResponse.success("Course created successfully", course));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<CourseResponse>> updateCourse(@PathVariable Long id, @Valid @RequestBody CourseRequest request) {
        CourseResponse course = courseService.updateCourse(id, request);
        return ResponseEntity.ok(ApiResponse.success("Course updated successfully", course));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok(ApiResponse.success("Course deleted successfully"));
    }

    @PostMapping("/{courseId}/enroll/{studentId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<CourseResponse>> enrollStudent(@PathVariable Long courseId, @PathVariable Long studentId) {
        CourseResponse course = courseService.enrollStudent(courseId, studentId);
        return ResponseEntity.ok(ApiResponse.success("Student enrolled successfully", course));
    }

    @DeleteMapping("/{courseId}/enroll/{studentId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<CourseResponse>> unenrollStudent(@PathVariable Long courseId, @PathVariable Long studentId) {
        CourseResponse course = courseService.unenrollStudent(courseId, studentId);
        return ResponseEntity.ok(ApiResponse.success("Student unenrolled successfully", course));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<CourseResponse>>> searchCourses(@RequestParam String q) {
        List<CourseResponse> courses = courseService.searchCourses(q);
        return ResponseEntity.ok(ApiResponse.success("Search completed successfully", courses));
    }
}
