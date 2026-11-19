package com.collaborativenotes.controller;
import com.collaborativenotes.model.Notification;
import com.collaborativenotes.model.User;
import com.collaborativenotes.repository.NotificationRepository;
import com.collaborativenotes.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired private NotificationRepository notificationRepository;
    @Autowired private UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    @GetMapping
    public List<Notification> getNotifications() {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(getCurrentUser().getId());
    }

    @GetMapping("/unread-count")
    public Map<String, Long> getUnreadCount() {
        long count = notificationRepository.countByUserIdAndIsReadFalse(getCurrentUser().getId());
        Map<String, Long> result = new HashMap<>();
        result.put("count", count);
        return result;
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id) {
        return notificationRepository.findById(id).map(notif -> {
            notif.setIsRead(true);
            return ResponseEntity.ok(notificationRepository.save(notif));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead() {
        List<Notification> notifs = notificationRepository.findByUserIdOrderByCreatedAtDesc(getCurrentUser().getId());
        notifs.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(notifs);
        return ResponseEntity.ok().build();
    }
}
