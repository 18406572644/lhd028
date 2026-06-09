package com.cinema.blindbox.service;

import com.cinema.blindbox.dto.ReviewRequest;
import com.cinema.blindbox.entity.Review;
import com.cinema.blindbox.entity.User;
import com.cinema.blindbox.repository.ReviewRepository;
import com.cinema.blindbox.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    public Map<String, Object> addReview(Long userId, ReviewRequest request) {
        Review existingReview = reviewRepository.findByUserIdAndMovieId(userId, request.getMovieId()).orElse(null);

        if (existingReview != null) {
            existingReview.setRating(request.getRating());
            existingReview.setContent(request.getContent());
            Review saved = reviewRepository.save(existingReview);
            return buildReviewResponse(saved);
        }

        Review review = new Review();
        review.setUserId(userId);
        review.setMovieId(request.getMovieId());
        review.setRating(request.getRating());
        review.setContent(request.getContent());
        Review saved = reviewRepository.save(review);
        return buildReviewResponse(saved);
    }

    public Map<String, Object> updateReview(Long userId, Long reviewId, ReviewRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("评论不存在"));

        if (!review.getUserId().equals(userId)) {
            throw new RuntimeException("无权修改此评论");
        }

        if (request.getRating() != null) {
            review.setRating(request.getRating());
        }
        if (request.getContent() != null) {
            review.setContent(request.getContent());
        }

        Review saved = reviewRepository.save(review);
        return buildReviewResponse(saved);
    }

    public List<Map<String, Object>> getReviewsByMovie(Long movieId) {
        List<Review> reviews = reviewRepository.findByMovieIdOrderByCreatedAtDesc(movieId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Review r : reviews) {
            result.add(buildReviewResponse(r));
        }
        return result;
    }

    public List<Map<String, Object>> getReviewsByUser(Long userId) {
        List<Review> reviews = reviewRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Review r : reviews) {
            result.add(buildReviewResponse(r));
        }
        return result;
    }

    public void deleteReview(Long userId, Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("评论不存在"));

        if (!review.getUserId().equals(userId)) {
            throw new RuntimeException("无权删除此评论");
        }

        reviewRepository.deleteById(reviewId);
    }

    private Map<String, Object> buildReviewResponse(Review review) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", review.getId());
        response.put("userId", review.getUserId());
        response.put("movieId", review.getMovieId());
        response.put("rating", review.getRating());
        response.put("content", review.getContent());
        response.put("createdAt", review.getCreatedAt());
        response.put("updatedAt", review.getUpdatedAt());

        userRepository.findById(review.getUserId()).ifPresent(user -> {
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", user.getId());
            userInfo.put("username", user.getUsername());
            userInfo.put("nickname", user.getNickname());
            userInfo.put("avatar", user.getAvatar());
            response.put("user", userInfo);
        });

        return response;
    }
}
