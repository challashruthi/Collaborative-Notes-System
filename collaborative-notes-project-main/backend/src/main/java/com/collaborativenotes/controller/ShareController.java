package com.collaborativenotes.controller;
import com.collaborativenotes.dto.ShareRequest;
import com.collaborativenotes.model.Notification;
import com.collaborativenotes.model.NoteShare;
import com.collaborativenotes.model.User;
import com.collaborativenotes.repository.NoteRepository;
import com.collaborativenotes.repository.NoteShareRepository;
import com.collaborativenotes.repository.NotificationRepository;
import com.collaborativenotes.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notes/{noteId}/share")
public class ShareController {

    @Autowired private NoteShareRepository shareRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private NoteRepository noteRepository;
    @Autowired private NotificationRepository notificationRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    @PostMapping
    public ResponseEntity<?> shareNote(@PathVariable Long noteId, @RequestBody ShareRequest request) {
        User currentUser = getCurrentUser();
        User targetUser = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (targetUser == null) return ResponseEntity.badRequest().body("User not found: Please ask them to create an account first.");

        if (currentUser.getId().equals(targetUser.getId())) {
             return ResponseEntity.badRequest().body("You cannot share a note with yourself.");
        }

        if (!shareRepository.findByNoteId(noteId).stream().filter(s -> s.getSharedWithUserId().equals(targetUser.getId())).findAny().isEmpty()) {
            return ResponseEntity.badRequest().body("Note is already shared with this user.");
        }

        NoteShare share = new NoteShare();
        share.setNoteId(noteId);
        share.setSharedWithUserId(targetUser.getId());
        share.setSharedByUserId(currentUser.getId());
        share.setPermission(request.getPermission() != null ? request.getPermission() : "VIEW");

        NoteShare saved = shareRepository.save(share);

        // Create notification for recipient
        noteRepository.findById(noteId).ifPresent(note -> {
            Notification notif = new Notification();
            notif.setUserId(targetUser.getId());
            notif.setMessage(currentUser.getName() + " shared \"" + note.getTitle() + "\" with you.");
            notif.setType("SHARE");
            notificationRepository.save(notif);
        });

        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public List<NoteShare> getShares(@PathVariable Long noteId) {
        return shareRepository.findByNoteId(noteId);
    }
}