package com.unslg.aulavirtual.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AssignmentRequest {
    
    @NotBlank(message = "Assignment title is required")
    @Size(min = 3, max = 150, message = "Title must be between 3 and 150 characters")
    private String title;
    
    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;
    
    private String instructions;
    
    @NotNull(message = "Due date is required")
    private LocalDateTime dueDate;
    
    private Integer maxPoints;
    
    private String submissionType;
    
    private Long maxFileSize;
    
    private String allowedExtensions;
    
    @NotNull(message = "Course ID is required")
    private Long courseId;
}
