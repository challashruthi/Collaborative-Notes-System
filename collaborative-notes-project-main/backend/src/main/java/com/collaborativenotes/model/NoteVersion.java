package com.collaborativenotes.model;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "note_versions")
public class NoteVersion {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long noteId;
    private String title;
    @Column(columnDefinition = "LONGTEXT")
    private String content;
    private Long changedBy;
    private Integer versionNumber;
    private LocalDateTime changedAt = LocalDateTime.now();
}