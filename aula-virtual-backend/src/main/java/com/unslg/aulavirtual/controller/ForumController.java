package com.unslg.aulavirtual.controller;

import com.unslg.aulavirtual.dto.response.ApiResponse;
import com.unslg.aulavirtual.entity.Forum;
import com.unslg.aulavirtual.service.ForumService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/forums")
@RequiredArgsConstructor
public class ForumController {

    private final ForumService forumService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Forum>>> getAllForums() {
        List<Forum> forums = forumService.getAllForums();
        return ResponseEntity.ok(ApiResponse.success("Forums retrieved successfully", forums));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Forum>> getForumById(@PathVariable Long id) {
        Forum forum = forumService.getForumById(id);
        return ResponseEntity.ok(ApiResponse.success("Forum retrieved successfully", forum));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<ApiResponse<List<Forum>>> getForumsByCourse(@PathVariable Long courseId) {
        List<Forum> forums = forumService.getForumsByCourse(courseId);
        return ResponseEntity.ok(ApiResponse.success("Course forums retrieved successfully", forums));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<Forum>> createForum(@RequestBody Forum forum) {
        Forum createdForum = forumService.createForum(forum);
        return ResponseEntity.ok(ApiResponse.success("Forum created successfully", createdForum));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<Forum>> updateForum(@PathVariable Long id, @RequestBody Forum forumDetails) {
        Forum forum = forumService.updateForum(id, forumDetails);
        return ResponseEntity.ok(ApiResponse.success("Forum updated successfully", forum));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<Void>> deleteForum(@PathVariable Long id) {
        forumService.deleteForum(id);
        return ResponseEntity.ok(ApiResponse.success("Forum deleted successfully"));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Forum>>> searchForums(@RequestParam String q) {
        List<Forum> forums = forumService.searchForums(q);
        return ResponseEntity.ok(ApiResponse.success("Search completed successfully", forums));
    }
}
