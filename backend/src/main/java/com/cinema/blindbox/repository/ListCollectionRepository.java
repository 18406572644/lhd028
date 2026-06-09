package com.cinema.blindbox.repository;

import com.cinema.blindbox.entity.ListCollection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ListCollectionRepository extends JpaRepository<ListCollection, Long> {

    Optional<ListCollection> findByUserIdAndListId(Long userId, Long listId);

    List<ListCollection> findByUserIdOrderByCreatedAtDesc(Long userId);

    int countByListId(Long listId);

    void deleteByUserIdAndListId(Long userId, Long listId);

    void deleteByListId(Long listId);
}
