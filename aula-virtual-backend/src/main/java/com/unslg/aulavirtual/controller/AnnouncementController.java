package com.unslg.aulavirtual.controller;

import com.unslg.aulavirtual.dto.response.ApiResponse;
import com.unslg.aulavirtual.entity.Announcement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    @GetMapping
    public ResponseEntity<ApiResponse<List<Announcement>>> getAllAnnouncements() {
        // Implementation would go here
        return ResponseEntity.ok(ApiResponse.success("Announcements retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Announcement>> getAnnouncementById(@PathVariable Long id) {
        // Implementation would go here
        return ResponseEntity.ok(ApiResponse.success("Announcement retrieved successfully"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<Announcement>> createAnnouncement(@RequestBody Announcement announcement) {
        // Implementation would go here
        return ResponseEntity.ok(ApiResponse.success("Announcement created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<Announcement>> updateAnnouncement(@PathVariable Long id, @RequestBody Announcement announcementDetails) {
        // Implementation would go here
        return ResponseEntity.ok(ApiResponse.success("Announcement updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<Void>> deleteAnnouncement(@PathVariable Long id) {
        // Implementation would go here
        return ResponseEntity.ok(ApiResponse.success("Announcement deleted successfully"));
    }
}
