package com.unslg.aulavirtual.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CourseRequest {
    
    @NotBlank(message = "Course name is required")
    @Size(min = 3, max = 150, message = "Course name must be between 3 and 150 characters")
    private String name;
    
    @NotBlank(message = "Course code is required")
    @Size(min = 3, max = 20, message = "Course code must be between 3 and 20 characters")
    private String code;
    
    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;
    
    private Integer credits;
    
    @Size(max = 20, message = "Academic period must not exceed 20 characters")
    private String academicPeriod;
    
    @Size(max = 10, message = "Group number must not exceed 10 characters")
    private String groupNumber;
    
    private LocalDateTime startDate;
    
    private LocalDateTime endDate;
    
    private Long instructorId;
}
