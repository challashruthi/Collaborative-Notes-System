package com.collaborativenotes.model;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "notes")
public class Note {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title = "Untitled Note";

    @Column(columnDefinition = "LONGTEXT")
    private String content;

    private Long ownerId;
    private Long folderId;

    private Boolean isPinned = false;
    private Boolean isTrashed = false;
    private Boolean isDraft = false;
    private Boolean isFavorite = false;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
    private LocalDateTime deletedAt;

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}