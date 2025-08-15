package com.unslg.aulavirtual.service;

import com.unslg.aulavirtual.entity.Forum;
import com.unslg.aulavirtual.exception.ResourceNotFoundException;
import com.unslg.aulavirtual.repository.ForumRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ForumService {

    private final ForumRepository forumRepository;

    public List<Forum> getAllForums() {
        return forumRepository.findAll();
    }

    public Forum getForumById(Long id) {
        return forumRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Forum not found with id: " + id));
    }

    public List<Forum> getForumsByCourse(Long courseId) {
        return forumRepository.findByCourseId(courseId);
    }

    public Forum createForum(Forum forum) {
        return forumRepository.save(forum);
    }

    public Forum updateForum(Long id, Forum forumDetails) {
        Forum forum = forumRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Forum not found with id: " + id));

        forum.setTitle(forumDetails.getTitle());
        forum.setDescription(forumDetails.getDescription());
        forum.setForumType(forumDetails.getForumType());
        forum.setStatus(forumDetails.getStatus());

        return forumRepository.save(forum);
    }

    public void deleteForum(Long id) {
        Forum forum = forumRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Forum not found with id: " + id));
        forumRepository.delete(forum);
    }

    public List<Forum> searchForums(String searchTerm) {
        return forumRepository.findBySearchTerm(searchTerm);
    }
}
