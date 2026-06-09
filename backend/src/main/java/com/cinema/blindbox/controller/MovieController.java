package com.cinema.blindbox.controller;

import com.cinema.blindbox.dto.ApiResponse;
import com.cinema.blindbox.entity.Movie;
import com.cinema.blindbox.service.MovieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/movies")
public class MovieController {

    @Autowired
    private MovieService movieService;

    @GetMapping
    public ApiResponse<Map<String, Object>> getAllMovies(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Double minRating,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(movieService.findMoviesWithFilters(keyword, genre, year, minRating, page, size));
    }

    @GetMapping("/{id}")
    public ApiResponse<Movie> getMovieById(@PathVariable Long id) {
        try {
            return ApiResponse.success(movieService.getMovieById(id));
        } catch (RuntimeException e) {
            return ApiResponse.error(404, e.getMessage());
        }
    }

    @PostMapping
    public ApiResponse<Movie> createMovie(@RequestBody Movie movie) {
        try {
            return ApiResponse.success("创建成功", movieService.createMovie(movie));
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ApiResponse<Movie> updateMovie(@PathVariable Long id, @RequestBody Movie movie) {
        try {
            return ApiResponse.success("更新成功", movieService.updateMovie(id, movie));
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteMovie(@PathVariable Long id) {
        try {
            movieService.deleteMovie(id);
            return ApiResponse.success("删除成功", null);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }
}
