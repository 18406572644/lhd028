package com.cinema.blindbox.repository;

import com.cinema.blindbox.entity.ListComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ListCommentRepository extends JpaRepository<ListComment, Long> {

    Page<ListComment> findByListIdOrderByCreatedAtDesc(Long listId, Pageable pageable);

    int countByListId(Long listId);

    void deleteByListId(Long listId);
}
