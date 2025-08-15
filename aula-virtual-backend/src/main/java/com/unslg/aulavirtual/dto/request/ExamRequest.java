package com.unslg.aulavirtual.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ExamRequest {
    
    @NotBlank(message = "Exam title is required")
    @Size(min = 3, max = 150, message = "Title must be between 3 and 150 characters")
    private String title;
    
    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;
    
    private String examType;
    
    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;
    
    @NotNull(message = "End time is required")
    private LocalDateTime endTime;
    
    @NotNull(message = "Duration is required")
    private Integer durationMinutes;
    
    private Integer maxPoints;
    
    private Double passingGrade;
    
    private String instructions;
    
    @NotNull(message = "Course ID is required")
    private Long courseId;
}
