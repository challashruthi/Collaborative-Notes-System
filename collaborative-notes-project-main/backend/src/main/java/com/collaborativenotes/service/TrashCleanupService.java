package com.collaborativenotes.service;
import com.collaborativenotes.repository.NoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TrashCleanupService {

    @Autowired private NoteRepository noteRepository;

    // Runs every day at midnight
    @Scheduled(cron = "0 0 0 * * ?")
    public void permanentlyDeleteOldTrashedNotes() {
        LocalDateTime threshold = LocalDateTime.now().minusDays(7);
        List<com.collaborativenotes.model.Note> expiredNotes = noteRepository.findNotesForPermanentDeletion(threshold);
        if (!expiredNotes.isEmpty()) {
            noteRepository.deleteAll(expiredNotes);
            System.out.println("[TrashCleanup] Permanently deleted " + expiredNotes.size() + " expired note(s).");
        }
    }
}
