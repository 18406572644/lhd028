package com.cinema.blindbox.controller;

import com.cinema.blindbox.dto.ApiResponse;
import com.cinema.blindbox.service.StatsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    @Autowired
    private StatsService statsService;

    @GetMapping("/overview")
    public ApiResponse<Map<String, Object>> getOverview(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ApiResponse.success(statsService.getOverview(userId));
    }

    @GetMapping("/genre-distribution")
    public ApiResponse<List<Map<String, Object>>> getGenreDistribution(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ApiResponse.success(statsService.getGenreDistribution(userId));
    }

    @GetMapping("/monthly-watching")
    public ApiResponse<List<Map<String, Object>>> getMonthlyWatching(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ApiResponse.success(statsService.getMonthlyWatching(userId));
    }

    @GetMapping("/rating-distribution")
    public ApiResponse<List<Map<String, Object>>> getRatingDistribution(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ApiResponse.success(statsService.getRatingDistribution(userId));
    }
}
