package com.cinema.blindbox.repository;

import com.cinema.blindbox.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByMovieIdOrderByCreatedAtDesc(Long movieId);

    List<Review> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Review> findByUserIdAndMovieId(Long userId, Long movieId);

    List<Review> findByMovieId(Long movieId);

    void deleteByUserIdAndMovieId(Long userId, Long movieId);
}
