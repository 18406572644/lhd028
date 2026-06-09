package com.cinema.blindbox.repository;

import com.cinema.blindbox.entity.Movie;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {

    List<Movie> findByGenreContaining(String genre);

    @Query("SELECT m FROM Movie m WHERE m.rating >= :minRating")
    List<Movie> findByMinRating(@Param("minRating") BigDecimal minRating);

    @Query("SELECT m FROM Movie m WHERE " +
            "(:keyword IS NULL OR m.title LIKE %:keyword% OR m.director LIKE %:keyword% OR m.actors LIKE %:keyword%) AND " +
            "(:genre IS NULL OR m.genre LIKE %:genre%) AND " +
            "(:year IS NULL OR m.year = :year) AND " +
            "(:minRating IS NULL OR m.rating >= :minRating)")
    Page<Movie> findWithFilters(@Param("keyword") String keyword,
                                @Param("genre") String genre,
                                @Param("year") Integer year,
                                @Param("minRating") Double minRating,
                                Pageable pageable);

    @Query("SELECT m FROM Movie m WHERE m.genre IN :genres AND m.rating >= :minRating AND m.year BETWEEN :startYear AND :endYear")
    List<Movie> findByGenresAndRatingAndYearRange(@Param("genres") List<String> genres,
                                                  @Param("minRating") BigDecimal minRating,
                                                  @Param("startYear") int startYear,
                                                  @Param("endYear") int endYear);

    @Query("SELECT m FROM Movie m WHERE m.genre IN :genres AND m.rating >= :minRating")
    List<Movie> findByGenresAndMinRating(@Param("genres") List<String> genres,
                                         @Param("minRating") BigDecimal minRating);

    @Query("SELECT m FROM Movie m WHERE m.rating >= :minRating AND m.year BETWEEN :startYear AND :endYear")
    List<Movie> findByMinRatingAndYearRange(@Param("minRating") BigDecimal minRating,
                                            @Param("startYear") int startYear,
                                            @Param("endYear") int endYear);

    @Query("SELECT m FROM Movie m WHERE m.genre IN :genres AND m.year BETWEEN :startYear AND :endYear")
    List<Movie> findByGenresAndYearRange(@Param("genres") List<String> genres,
                                         @Param("startYear") int startYear,
                                         @Param("endYear") int endYear);

    @Query("SELECT m FROM Movie m WHERE m.genre IN :genres")
    List<Movie> findByGenres(@Param("genres") List<String> genres);

    long countByGenre(String genre);
}
