package com.cinema.blindbox.controller;

import com.cinema.blindbox.dto.ApiResponse;
import com.cinema.blindbox.dto.ReviewRequest;
import com.cinema.blindbox.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @PostMapping
    public ApiResponse<Map<String, Object>> addReview(HttpServletRequest request,
                                                      @RequestBody ReviewRequest reviewRequest) {
        Long userId = (Long) request.getAttribute("userId");
        try {
            Map<String, Object> result = reviewService.addReview(userId, reviewRequest);
            return ApiResponse.success("评论成功", result);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ApiResponse<Map<String, Object>> updateReview(HttpServletRequest request,
                                                         @PathVariable Long id,
                                                         @RequestBody ReviewRequest reviewRequest) {
        Long userId = (Long) request.getAttribute("userId");
        try {
            Map<String, Object> result = reviewService.updateReview(userId, id, reviewRequest);
            return ApiResponse.success("更新成功", result);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @GetMapping
    public ApiResponse<List<Map<String, Object>>> getReviews(@RequestParam Long movieId) {
        return ApiResponse.success(reviewService.getReviewsByMovie(movieId));
    }

    @GetMapping("/my")
    public ApiResponse<List<Map<String, Object>>> getMyReviews(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ApiResponse.success(reviewService.getReviewsByUser(userId));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteReview(HttpServletRequest request, @PathVariable Long id) {
        Long userId = (Long) request.getAttribute("userId");
        try {
            reviewService.deleteReview(userId, id);
            return ApiResponse.success("删除成功", null);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }
}
