package com.unslg.aulavirtual.controller;

import com.unslg.aulavirtual.dto.response.ApiResponse;
import com.unslg.aulavirtual.entity.VideoConference;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/videoconference")
@RequiredArgsConstructor
public class VideoConferenceController {

    @GetMapping
    public ResponseEntity<ApiResponse<List<VideoConference>>> getAllConferences() {
        // Implementation would go here
        return ResponseEntity.ok(ApiResponse.success("Conferences retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VideoConference>> getConferenceById(@PathVariable Long id) {
        // Implementation would go here
        return ResponseEntity.ok(ApiResponse.success("Conference retrieved successfully"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<VideoConference>> createConference(@RequestBody VideoConference conference) {
        // Implementation would go here
        return ResponseEntity.ok(ApiResponse.success("Conference created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<VideoConference>> updateConference(@PathVariable Long id, @RequestBody VideoConference conferenceDetails) {
        // Implementation would go here
        return ResponseEntity.ok(ApiResponse.success("Conference updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<Void>> deleteConference(@PathVariable Long id) {
        // Implementation would go here
        return ResponseEntity.ok(ApiResponse.success("Conference deleted successfully"));
    }
}
