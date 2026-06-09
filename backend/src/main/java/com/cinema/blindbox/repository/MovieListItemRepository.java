package com.cinema.blindbox.repository;

import com.cinema.blindbox.entity.MovieListItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovieListItemRepository extends JpaRepository<MovieListItem, Long> {

    List<MovieListItem> findByListIdOrderBySortOrderAsc(Long listId);

    void deleteByListId(Long listId);

    void deleteByListIdAndMovieId(Long listId, Long movieId);

    int countByListId(Long listId);
}
