package com.collaborativenotes.model;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "note_shares", uniqueConstraints = {@UniqueConstraint(columnNames = {"note_id", "shared_with_user_id"})})
public class NoteShare {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long noteId;
    private Long sharedWithUserId;
    private Long sharedByUserId;

    private String permission = "VIEW"; // VIEW or EDIT
    private LocalDateTime sharedAt = LocalDateTime.now();
}