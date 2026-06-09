package com.cinema.blindbox.repository;

import com.cinema.blindbox.entity.BlindBox;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BlindBoxRepository extends JpaRepository<BlindBox, Long> {

    List<BlindBox> findByUserIdOrderByCreatedAtDesc(Long userId);

    long countByUserId(Long userId);
}
