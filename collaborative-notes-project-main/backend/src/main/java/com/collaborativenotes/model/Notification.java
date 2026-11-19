package com.collaborativenotes.model;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "notifications")
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String message;
    private String type; // SHARE, MENTION, SYSTEM
    private Boolean isRead = false;
    private LocalDateTime createdAt = LocalDateTime.now();
}
