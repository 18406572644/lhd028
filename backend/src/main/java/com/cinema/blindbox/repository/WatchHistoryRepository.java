package com.cinema.blindbox.repository;

import com.cinema.blindbox.entity.WatchHistory;
import com.cinema.blindbox.entity.WatchStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface WatchHistoryRepository extends JpaRepository<WatchHistory, Long> {

    List<WatchHistory> findByUserIdOrderByWatchedAtDesc(Long userId);

    Optional<WatchHistory> findByUserIdAndMovieId(Long userId, Long movieId);

    List<WatchHistory> findByUserIdAndStatus(Long userId, WatchStatus status);

    @Query("SELECT wh FROM WatchHistory wh WHERE wh.userId = :userId AND wh.watchedAt BETWEEN :start AND :end")
    List<WatchHistory> findByUserIdAndWatchedAtBetween(@Param("userId") Long userId,
                                                       @Param("start") LocalDateTime start,
                                                       @Param("end") LocalDateTime end);

    long countByUserId(Long userId);

    void deleteByUserIdAndMovieId(Long userId, Long movieId);
}
