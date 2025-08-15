package com.unslg.aulavirtual.controller;

import com.unslg.aulavirtual.dto.request.AssignmentRequest;
import com.unslg.aulavirtual.dto.response.ApiResponse;
import com.unslg.aulavirtual.entity.Assignment;
import com.unslg.aulavirtual.service.AssignmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentService assignmentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Assignment>>> getAllAssignments() {
        List<Assignment> assignments = assignmentService.getAllAssignments();
        return ResponseEntity.ok(ApiResponse.success("Assignments retrieved successfully", assignments));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Assignment>> getAssignmentById(@PathVariable Long id) {
        Assignment assignment = assignmentService.getAssignmentById(id);
        return ResponseEntity.ok(ApiResponse.success("Assignment retrieved successfully", assignment));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<ApiResponse<List<Assignment>>> getAssignmentsByCourse(@PathVariable Long courseId) {
        List<Assignment> assignments = assignmentService.getAssignmentsByCourse(courseId);
        return ResponseEntity.ok(ApiResponse.success("Course assignments retrieved successfully", assignments));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<Assignment>>> getAssignmentsByStudent(@PathVariable Long studentId) {
        List<Assignment> assignments = assignmentService.getAssignmentsByStudent(studentId);
        return ResponseEntity.ok(ApiResponse.success("Student assignments retrieved successfully", assignments));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<Assignment>> createAssignment(@Valid @RequestBody AssignmentRequest request) {
        Assignment assignment = assignmentService.createAssignment(request);
        return ResponseEntity.ok(ApiResponse.success("Assignment created successfully", assignment));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<Assignment>> updateAssignment(@PathVariable Long id, @Valid @RequestBody AssignmentRequest request) {
        Assignment assignment = assignmentService.updateAssignment(id, request);
        return ResponseEntity.ok(ApiResponse.success("Assignment updated successfully", assignment));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<Void>> deleteAssignment(@PathVariable Long id) {
        assignmentService.deleteAssignment(id);
        return ResponseEntity.ok(ApiResponse.success("Assignment deleted successfully"));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Assignment>>> searchAssignments(@RequestParam String q) {
        List<Assignment> assignments = assignmentService.searchAssignments(q);
        return ResponseEntity.ok(ApiResponse.success("Search completed successfully", assignments));
    }
}
