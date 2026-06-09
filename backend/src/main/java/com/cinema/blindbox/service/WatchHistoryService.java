package com.cinema.blindbox.service;

import com.cinema.blindbox.dto.WatchHistoryRequest;
import com.cinema.blindbox.entity.WatchHistory;
import com.cinema.blindbox.entity.WatchStatus;
import com.cinema.blindbox.repository.MovieRepository;
import com.cinema.blindbox.repository.WatchHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class WatchHistoryService {

    @Autowired
    private WatchHistoryRepository watchHistoryRepository;

    @Autowired
    private MovieRepository movieRepository;

    public Map<String, Object> addWatchHistory(Long userId, WatchHistoryRequest request) {
        WatchHistory history = watchHistoryRepository.findByUserIdAndMovieId(userId, request.getMovieId())
                .orElse(new WatchHistory());

        history.setUserId(userId);
        history.setMovieId(request.getMovieId());
        if (request.getStatus() != null) {
            history.setStatus(WatchStatus.valueOf(request.getStatus()));
        } else {
            history.setStatus(WatchStatus.WATCHED);
        }

        if (request.getWatchedAt() != null && !request.getWatchedAt().isEmpty()) {
            history.setWatchedAt(LocalDateTime.parse(request.getWatchedAt(), DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        } else {
            history.setWatchedAt(LocalDateTime.now());
        }

        WatchHistory saved = watchHistoryRepository.save(history);
        return buildHistoryResponse(saved);
    }

    public Map<String, Object> updateWatchHistory(Long userId, Long historyId, WatchHistoryRequest request) {
        WatchHistory history = watchHistoryRepository.findById(historyId)
                .orElseThrow(() -> new RuntimeException("观影记录不存在"));

        if (!history.getUserId().equals(userId)) {
            throw new RuntimeException("无权修改此记录");
        }

        if (request.getStatus() != null) {
            history.setStatus(WatchStatus.valueOf(request.getStatus()));
        }
        if (request.getWatchedAt() != null && !request.getWatchedAt().isEmpty()) {
            history.setWatchedAt(LocalDateTime.parse(request.getWatchedAt(), DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        }

        WatchHistory saved = watchHistoryRepository.save(history);
        return buildHistoryResponse(saved);
    }

    public List<Map<String, Object>> getWatchHistory(Long userId) {
        List<WatchHistory> histories = watchHistoryRepository.findByUserIdOrderByWatchedAtDesc(userId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (WatchHistory h : histories) {
            result.add(buildHistoryResponse(h));
        }
        return result;
    }

    public void deleteWatchHistory(Long userId, Long historyId) {
        WatchHistory history = watchHistoryRepository.findById(historyId)
                .orElseThrow(() -> new RuntimeException("观影记录不存在"));

        if (!history.getUserId().equals(userId)) {
            throw new RuntimeException("无权删除此记录");
        }

        watchHistoryRepository.deleteById(historyId);
    }

    private Map<String, Object> buildHistoryResponse(WatchHistory history) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", history.getId());
        response.put("userId", history.getUserId());
        response.put("movieId", history.getMovieId());
        response.put("watchStatus", history.getStatus() != null ? history.getStatus().name() : null);
        response.put("watchedAt", history.getWatchedAt());
        response.put("createdAt", history.getCreatedAt());
        response.put("updatedAt", history.getUpdatedAt());

        movieRepository.findById(history.getMovieId()).ifPresent(movie -> {
            response.put("movie", movie);
        });

        return response;
    }
}
