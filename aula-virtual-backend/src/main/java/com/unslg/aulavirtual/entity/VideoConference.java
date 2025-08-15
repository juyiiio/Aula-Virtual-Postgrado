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

@Entity
@Table(name = "video_conferences")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@EntityListeners(AuditingEntityListener.class)
public class VideoConference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private LocalDateTime scheduledTime;

    @Column(nullable = false)
    private Integer duration; // in minutes

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Platform platform = Platform.ZOOM;

    @Column(nullable = false, length = 500)
    private String meetingUrl;

    @Column(length = 50)
    private String meetingId;

    @Column(length = 50)
    private String meetingPassword;

    @Column(nullable = false)
    private Boolean recordingEnabled = false;

    @Column(nullable = false)
    private Boolean waitingRoom = true;

    @Column
    private Integer maxParticipants = 100;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConferenceStatus status = ConferenceStatus.SCHEDULED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "host_id", nullable = false)
    private User host;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum Platform {
        ZOOM, MEET, TEAMS, CUSTOM
    }

    public enum ConferenceStatus {
        SCHEDULED, LIVE, ENDED
    }

    public VideoConference(String title, String description, LocalDateTime scheduledTime, String meetingUrl, User host) {
        this.title = title;
        this.description = description;
        this.scheduledTime = scheduledTime;
        this.meetingUrl = meetingUrl;
        this.host = host;
    }
}
