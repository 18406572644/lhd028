package com.cinema.blindbox.repository;

import com.cinema.blindbox.entity.MovieList;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovieListRepository extends JpaRepository<MovieList, Long> {

    List<MovieList> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT ml FROM MovieList ml WHERE ml.visibility = 'PUBLIC' ORDER BY ml.createdAt DESC")
    Page<MovieList> findPublicLists(Pageable pageable);

    @Query("SELECT ml FROM MovieList ml WHERE ml.visibility = 'PUBLIC' AND (ml.title LIKE %:keyword% OR ml.description LIKE %:keyword%) ORDER BY ml.createdAt DESC")
    Page<MovieList> searchPublicLists(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT ml FROM MovieList ml WHERE ml.userId = :userId AND ml.visibility = 'PRIVATE' ORDER BY ml.createdAt DESC")
    List<MovieList> findPrivateListsByUserId(@Param("userId") Long userId);

    @Query("SELECT ml FROM MovieList ml WHERE ml.visibility = 'PUBLIC' ORDER BY ml.createdAt DESC")
    List<MovieList> findAllPublicLists();
}
