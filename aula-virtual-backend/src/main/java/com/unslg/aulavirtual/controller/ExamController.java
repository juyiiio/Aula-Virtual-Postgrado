package com.unslg.aulavirtual.controller;

import com.unslg.aulavirtual.dto.request.ExamRequest;
import com.unslg.aulavirtual.dto.response.ApiResponse;
import com.unslg.aulavirtual.entity.Exam;
import com.unslg.aulavirtual.service.ExamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exams")
@RequiredArgsConstructor
public class ExamController {

    private final ExamService examService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Exam>>> getAllExams() {
        List<Exam> exams = examService.getAllExams();
        return ResponseEntity.ok(ApiResponse.success("Exams retrieved successfully", exams));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Exam>> getExamById(@PathVariable Long id) {
        Exam exam = examService.getExamById(id);
        return ResponseEntity.ok(ApiResponse.success("Exam retrieved successfully", exam));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<ApiResponse<List<Exam>>> getExamsByCourse(@PathVariable Long courseId) {
        List<Exam> exams = examService.getExamsByCourse(courseId);
        return ResponseEntity.ok(ApiResponse.success("Course exams retrieved successfully", exams));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<Exam>>> getExamsByStudent(@PathVariable Long studentId) {
        List<Exam> exams = examService.getExamsByStudent(studentId);
        return ResponseEntity.ok(ApiResponse.success("Student exams retrieved successfully", exams));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<Exam>> createExam(@Valid @RequestBody ExamRequest request) {
        Exam exam = examService.createExam(request);
        return ResponseEntity.ok(ApiResponse.success("Exam created successfully", exam));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<Exam>> updateExam(@PathVariable Long id, @Valid @RequestBody ExamRequest request) {
        Exam exam = examService.updateExam(id, request);
        return ResponseEntity.ok(ApiResponse.success("Exam updated successfully", exam));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<Void>> deleteExam(@PathVariable Long id) {
        examService.deleteExam(id);
        return ResponseEntity.ok(ApiResponse.success("Exam deleted successfully"));
    }
}
