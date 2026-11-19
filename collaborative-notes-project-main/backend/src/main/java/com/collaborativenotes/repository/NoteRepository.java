package com.collaborativenotes.repository;
import com.collaborativenotes.model.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface NoteRepository extends JpaRepository<Note, Long> {

    // All non-trashed, non-draft notes for a user
    List<Note> findByOwnerIdAndIsTrashedFalseAndIsDraftFalseOrderByUpdatedAtDesc(Long ownerId);

    // Trashed notes
    List<Note> findByOwnerIdAndIsTrashedTrueOrderByUpdatedAtDesc(Long ownerId);

    // Draft notes
    List<Note> findByOwnerIdAndIsDraftTrueAndIsTrashedFalseOrderByUpdatedAtDesc(Long ownerId);

    // Favorited notes
    List<Note> findByOwnerIdAndIsFavoriteTrueAndIsTrashedFalseOrderByUpdatedAtDesc(Long ownerId);

    // Notes in a specific folder
    List<Note> findByOwnerIdAndFolderIdAndIsTrashedFalseOrderByUpdatedAtDesc(Long ownerId, Long folderId);

    // Notes without a folder
    List<Note> findByOwnerIdAndFolderIdIsNullAndIsTrashedFalseAndIsDraftFalseOrderByUpdatedAtDesc(Long ownerId);

    // Shared notes by IDs (not trashed)
    List<Note> findByIdInAndIsTrashedFalseOrderByUpdatedAtDesc(List<Long> ids);

    // Recently created notes (limit via pageable)
    @Query("SELECT n FROM Note n WHERE n.ownerId = :ownerId AND n.isTrashed = false AND n.isDraft = false ORDER BY n.createdAt DESC")
    List<Note> findRecentByOwnerId(@Param("ownerId") Long ownerId, org.springframework.data.domain.Pageable pageable);

    // Notes eligible for permanent deletion (trashed > 7 days ago)
    @Query("SELECT n FROM Note n WHERE n.isTrashed = true AND n.deletedAt IS NOT NULL AND n.deletedAt < :threshold")
    List<Note> findNotesForPermanentDeletion(@Param("threshold") LocalDateTime threshold);

    // Count all notes owned by user
    long countByOwnerIdAndIsTrashedFalse(Long ownerId);
}