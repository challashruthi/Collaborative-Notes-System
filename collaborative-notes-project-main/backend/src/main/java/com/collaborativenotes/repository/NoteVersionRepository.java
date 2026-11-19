package com.collaborativenotes.repository;
import com.collaborativenotes.model.NoteVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NoteVersionRepository extends JpaRepository<NoteVersion, Long> {
    List<NoteVersion> findByNoteIdOrderByVersionNumberDesc(Long noteId);
}