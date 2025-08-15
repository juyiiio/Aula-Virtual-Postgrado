package com.unslg.aulavirtual.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "forums")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@EntityListeners(AuditingEntityListener.class)
public class Forum {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ForumType forumType = ForumType.GENERAL;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ForumStatus status = ForumStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @OneToMany(mappedBy = "forum", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<ForumPost> posts = new HashSet<>();

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    private LocalDateTime lastActivity;

    public enum ForumType {
        GENERAL, ACADEMIC, TECHNICAL, SOCIAL
    }

    public enum ForumStatus {
        ACTIVE, INACTIVE, CLOSED
    }

    public Forum(String title, String description, Course course, User createdBy) {
        this.title = title;
        this.description = description;
        this.course = course;
        this.createdBy = createdBy;
    }
}
