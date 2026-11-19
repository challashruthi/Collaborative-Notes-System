package com.collaborativenotes.repository;
import com.collaborativenotes.model.Folder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FolderRepository extends JpaRepository<Folder, Long> {
    List<Folder> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);
}
