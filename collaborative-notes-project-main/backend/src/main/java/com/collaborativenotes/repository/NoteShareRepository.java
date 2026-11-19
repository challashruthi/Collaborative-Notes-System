package com.collaborativenotes.repository;
import com.collaborativenotes.model.NoteShare;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface NoteShareRepository extends JpaRepository<NoteShare, Long> {
    List<NoteShare> findByNoteId(Long noteId);
    List<NoteShare> findBySharedWithUserId(Long userId);
    List<NoteShare> findBySharedByUserId(Long userId);
    Optional<NoteShare> findByNoteIdAndSharedWithUserId(Long noteId, Long userId);
}