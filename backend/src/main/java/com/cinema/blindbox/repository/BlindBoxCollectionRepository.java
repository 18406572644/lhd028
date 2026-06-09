package com.cinema.blindbox.repository;

import com.cinema.blindbox.entity.BlindBoxCollection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BlindBoxCollectionRepository extends JpaRepository<BlindBoxCollection, Long> {

    List<BlindBoxCollection> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<BlindBoxCollection> findByUserIdAndBlindBoxId(Long userId, Long blindBoxId);

    void deleteByUserIdAndBlindBoxId(Long userId, Long blindBoxId);

    boolean existsByUserIdAndBlindBoxId(Long userId, Long blindBoxId);
}
