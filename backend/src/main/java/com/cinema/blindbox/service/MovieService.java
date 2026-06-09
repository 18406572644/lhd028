package com.cinema.blindbox.service;

import com.cinema.blindbox.entity.Movie;
import com.cinema.blindbox.repository.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MovieService {

    @Autowired
    private MovieRepository movieRepository;

    public Map<String, Object> findMoviesWithFilters(String keyword, String genre, Integer year, Double minRating, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Movie> moviePage = movieRepository.findWithFilters(keyword, genre, year, minRating, pageable);

        Map<String, Object> result = new HashMap<>();
        result.put("list", moviePage.getContent());
        result.put("total", moviePage.getTotalElements());
        result.put("page", page);
        result.put("size", size);
        return result;
    }

    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    public Movie getMovieById(Long id) {
        return movieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("电影不存在"));
    }

    public Movie createMovie(Movie movie) {
        return movieRepository.save(movie);
    }

    public Movie updateMovie(Long id, Movie movieDetails) {
        Movie movie = getMovieById(id);
        if (movieDetails.getTitle() != null) {
            movie.setTitle(movieDetails.getTitle());
        }
        if (movieDetails.getGenre() != null) {
            movie.setGenre(movieDetails.getGenre());
        }
        if (movieDetails.getYear() != null) {
            movie.setYear(movieDetails.getYear());
        }
        if (movieDetails.getRating() != null) {
            movie.setRating(movieDetails.getRating());
        }
        if (movieDetails.getDirector() != null) {
            movie.setDirector(movieDetails.getDirector());
        }
        if (movieDetails.getActors() != null) {
            movie.setActors(movieDetails.getActors());
        }
        if (movieDetails.getDescription() != null) {
            movie.setDescription(movieDetails.getDescription());
        }
        if (movieDetails.getPosterUrl() != null) {
            movie.setPosterUrl(movieDetails.getPosterUrl());
        }
        if (movieDetails.getDuration() != null) {
            movie.setDuration(movieDetails.getDuration());
        }
        if (movieDetails.getCountry() != null) {
            movie.setCountry(movieDetails.getCountry());
        }
        return movieRepository.save(movie);
    }

    public void deleteMovie(Long id) {
        movieRepository.deleteById(id);
    }

    public List<Movie> searchMovies(String keyword) {
        return movieRepository.findAll().stream()
                .filter(m -> m.getTitle().contains(keyword) ||
                        (m.getDirector() != null && m.getDirector().contains(keyword)) ||
                        (m.getActors() != null && m.getActors().contains(keyword)))
                .collect(java.util.stream.Collectors.toList());
    }

    public List<Movie> getMoviesByGenre(String genre) {
        return movieRepository.findByGenreContaining(genre);
    }
}
