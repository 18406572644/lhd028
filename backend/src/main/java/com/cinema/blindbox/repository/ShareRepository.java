package com.cinema.blindbox.repository;

import com.cinema.blindbox.entity.Share;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShareRepository extends JpaRepository<Share, Long> {

    Optional<Share> findByShareCode(String shareCode);

    List<Share> findByUserIdOrderByCreatedAtDesc(Long userId);
}
