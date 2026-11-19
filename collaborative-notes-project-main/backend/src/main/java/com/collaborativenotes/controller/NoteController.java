package com.collaborativenotes.controller;
import com.collaborativenotes.model.Note;
import com.collaborativenotes.model.NoteShare;
import com.collaborativenotes.model.Notification;
import com.collaborativenotes.model.User;
import com.collaborativenotes.repository.NoteRepository;
import com.collaborativenotes.repository.NoteShareRepository;
import com.collaborativenotes.repository.NotificationRepository;
import com.collaborativenotes.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    @Autowired private NoteRepository noteRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private NoteShareRepository noteShareRepository;
    @Autowired private NotificationRepository notificationRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    // GET all non-draft, non-trashed notes
    @GetMapping
    public List<Note> getAllNotes() {
        return noteRepository.findByOwnerIdAndIsTrashedFalseAndIsDraftFalseOrderByUpdatedAtDesc(getCurrentUser().getId());
    }

    // GET trashed notes
    @GetMapping("/trash")
    public List<Note> getTrashedNotes() {
        return noteRepository.findByOwnerIdAndIsTrashedTrueOrderByUpdatedAtDesc(getCurrentUser().getId());
    }

    // GET draft notes
    @GetMapping("/drafts")
    public List<Note> getDraftNotes() {
        return noteRepository.findByOwnerIdAndIsDraftTrueAndIsTrashedFalseOrderByUpdatedAtDesc(getCurrentUser().getId());
    }

    // GET favorite notes
    @GetMapping("/favorites")
    public List<Note> getFavoriteNotes() {
        return noteRepository.findByOwnerIdAndIsFavoriteTrueAndIsTrashedFalseOrderByUpdatedAtDesc(getCurrentUser().getId());
    }

    // GET recently created (latest 8)
    @GetMapping("/recent")
    public List<Note> getRecentNotes() {
        return noteRepository.findRecentByOwnerId(getCurrentUser().getId(), PageRequest.of(0, 8));
    }

    // GET notes in a folder
    @GetMapping("/folder/{folderId}")
    public List<Note> getNotesByFolder(@PathVariable Long folderId) {
        return noteRepository.findByOwnerIdAndFolderIdAndIsTrashedFalseOrderByUpdatedAtDesc(getCurrentUser().getId(), folderId);
    }

    // GET notes without any folder
    @GetMapping("/unfiled")
    public List<Note> getUnfiledNotes() {
        return noteRepository.findByOwnerIdAndFolderIdIsNullAndIsTrashedFalseAndIsDraftFalseOrderByUpdatedAtDesc(getCurrentUser().getId());
    }

    // GET shared notes (ungrouped, for backwards compat)
    @GetMapping("/shared")
    public List<Note> getSharedNotes() {
        List<NoteShare> shares = noteShareRepository.findBySharedWithUserId(getCurrentUser().getId());
        List<Long> noteIds = shares.stream().map(NoteShare::getNoteId).collect(Collectors.toList());
        if (noteIds.isEmpty()) return List.of();
        return noteRepository.findByIdInAndIsTrashedFalseOrderByUpdatedAtDesc(noteIds);
    }

    // GET shared notes grouped by sender
    @GetMapping("/shared-grouped")
    public List<Map<String, Object>> getSharedNotesGrouped() {
        User me = getCurrentUser();
        List<NoteShare> shares = noteShareRepository.findBySharedWithUserId(me.getId());

        // Group shares by sharedByUserId
        Map<Long, List<NoteShare>> grouped = shares.stream()
            .filter(s -> s.getSharedByUserId() != null)
            .collect(Collectors.groupingBy(NoteShare::getSharedByUserId));

        return grouped.entrySet().stream().map(entry -> {
            Long sharerId = entry.getKey();
            List<NoteShare> sharerShares = entry.getValue();

            User sharer = userRepository.findById(sharerId).orElse(null);
            List<Long> noteIds = sharerShares.stream().map(NoteShare::getNoteId).collect(Collectors.toList());
            List<Note> notes = noteRepository.findByIdInAndIsTrashedFalseOrderByUpdatedAtDesc(noteIds);

            Map<String, Object> group = new HashMap<>();
            group.put("sharerId", sharerId);
            group.put("sharerName", sharer != null ? sharer.getName() : "Unknown");
            group.put("sharerEmail", sharer != null ? sharer.getEmail() : "");
            group.put("notes", notes);
            return group;
        }).collect(Collectors.toList());
    }

    // POST create note
    @PostMapping
    public Note createNote(@RequestBody Note note) {
        User user = getCurrentUser();
        note.setOwnerId(user.getId());
        note.setCreatedAt(LocalDateTime.now());
        note.setUpdatedAt(LocalDateTime.now());
        return noteRepository.save(note);
    }

    // GET note by ID
    @GetMapping("/{id}")
    public ResponseEntity<Note> getNote(@PathVariable Long id) {
        return noteRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // PUT update note
    @PutMapping("/{id}")
    public ResponseEntity<?> updateNote(@PathVariable Long id, @RequestBody Note noteDetails) {
        User currentUser = getCurrentUser();
        return noteRepository.findById(id).map(note -> {
            // Allow if the user is the owner
            if (!note.getOwnerId().equals(currentUser.getId())) {
                // Check if note is shared with this user and they have EDIT permission
                NoteShare share = noteShareRepository
                    .findByNoteIdAndSharedWithUserId(id, currentUser.getId())
                    .orElse(null);
                if (share == null || !"EDIT".equals(share.getPermission())) {
                    return ResponseEntity.status(403).<Note>build();
                }
            }
            note.setTitle(noteDetails.getTitle());
            note.setContent(noteDetails.getContent());
            if (noteDetails.getIsDraft() != null) note.setIsDraft(noteDetails.getIsDraft());
            if (noteDetails.getFolderId() != null) note.setFolderId(noteDetails.getFolderId());
            return ResponseEntity.ok(noteRepository.save(note));
        }).orElse(ResponseEntity.notFound().build());
    }

    // PUT move note to folder
    @PutMapping("/{id}/move")
    public ResponseEntity<Note> moveToFolder(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        return noteRepository.findById(id).map(note -> {
            note.setFolderId(body.get("folderId"));
            return ResponseEntity.ok(noteRepository.save(note));
        }).orElse(ResponseEntity.notFound().build());
    }

    // PUT toggle favorite
    @PutMapping("/{id}/toggle-favorite")
    public ResponseEntity<Note> toggleFavorite(@PathVariable Long id) {
        return noteRepository.findById(id).map(note -> {
            note.setIsFavorite(note.getIsFavorite() == null ? true : !note.getIsFavorite());
            return ResponseEntity.ok(noteRepository.save(note));
        }).orElse(ResponseEntity.notFound().build());
    }

    // DELETE soft-delete (to trash)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> trashNote(@PathVariable Long id) {
        return noteRepository.findById(id).map(note -> {
            note.setIsTrashed(true);
            note.setDeletedAt(LocalDateTime.now());
            noteRepository.save(note);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    // PUT restore from trash
    @PutMapping("/{id}/restore")
    public ResponseEntity<Note> restoreNote(@PathVariable Long id) {
        return noteRepository.findById(id).map(note -> {
            note.setIsTrashed(false);
            note.setDeletedAt(null);
            return ResponseEntity.ok(noteRepository.save(note));
        }).orElse(ResponseEntity.notFound().build());
    }

    // DELETE permanently delete
    @DeleteMapping("/{id}/permanent")
    public ResponseEntity<?> permanentlyDelete(@PathVariable Long id) {
        return noteRepository.findById(id).map(note -> {
            noteRepository.delete(note);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    // GET count of notes owned (for profile stats)
    @GetMapping("/count")
    public Map<String, Long> getNoteCount() {
        User user = getCurrentUser();
        Map<String, Long> result = new HashMap<>();
        result.put("total", noteRepository.countByOwnerIdAndIsTrashedFalse(user.getId()));
        return result;
    }

    // GET current user's permission for a specific note
    @GetMapping("/{id}/my-permission")
    public ResponseEntity<Map<String, String>> getMyPermission(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        Map<String, String> result = new HashMap<>();
        return noteRepository.findById(id).map(note -> {
            if (note.getOwnerId().equals(currentUser.getId())) {
                result.put("permission", "OWNER");
            } else {
                NoteShare share = noteShareRepository
                    .findByNoteIdAndSharedWithUserId(id, currentUser.getId())
                    .orElse(null);
                result.put("permission", share != null ? share.getPermission() : "NONE");
            }
            return ResponseEntity.ok(result);
        }).orElse(ResponseEntity.notFound().build());
    }
}