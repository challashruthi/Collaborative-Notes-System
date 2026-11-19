package com.collaborativenotes.controller;
import com.collaborativenotes.model.Folder;
import com.collaborativenotes.model.User;
import com.collaborativenotes.repository.FolderRepository;
import com.collaborativenotes.repository.NoteRepository;
import com.collaborativenotes.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/folders")
public class FolderController {

    @Autowired private FolderRepository folderRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private NoteRepository noteRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    @GetMapping
    public List<Folder> getFolders() {
        return folderRepository.findByOwnerIdOrderByCreatedAtDesc(getCurrentUser().getId());
    }

    @PostMapping
    public Folder createFolder(@RequestBody Folder folder) {
        folder.setOwnerId(getCurrentUser().getId());
        return folderRepository.save(folder);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Folder> renameFolder(@PathVariable Long id, @RequestBody Folder folderDetails) {
        return folderRepository.findById(id).map(folder -> {
            folder.setName(folderDetails.getName());
            return ResponseEntity.ok(folderRepository.save(folder));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFolder(@PathVariable Long id) {
        return folderRepository.findById(id).map(folder -> {
            // Move notes in this folder to unfiled
            noteRepository.findByOwnerIdAndFolderIdAndIsTrashedFalseOrderByUpdatedAtDesc(getCurrentUser().getId(), id)
                .forEach(note -> {
                    note.setFolderId(null);
                    noteRepository.save(note);
                });
            folderRepository.delete(folder);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
