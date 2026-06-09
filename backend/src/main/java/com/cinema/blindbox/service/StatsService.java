package com.cinema.blindbox.service;

import com.cinema.blindbox.entity.Movie;
import com.cinema.blindbox.entity.Review;
import com.cinema.blindbox.entity.WatchHistory;
import com.cinema.blindbox.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StatsService {

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private WatchHistoryRepository watchHistoryRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private BlindBoxRepository blindBoxRepository;

    @Autowired
    private UserRepository userRepository;

    public Map<String, Object> getOverview(Long userId) {
        List<WatchHistory> allHistories = watchHistoryRepository.findByUserIdOrderByWatchedAtDesc(userId);
        long totalWatched = allHistories.stream().filter(h -> h.getStatus() != null && h.getStatus().name().equals("WATCHED")).count();
        long totalWant = allHistories.stream().filter(h -> h.getStatus() != null && h.getStatus().name().equals("WANT")).count();
        long totalWatching = allHistories.stream().filter(h -> h.getStatus() != null && h.getStatus().name().equals("WATCHING")).count();

        List<Review> reviews = reviewRepository.findByUserIdOrderByCreatedAtDesc(userId);
        double avgRating = 0.0;
        if (!reviews.isEmpty()) {
            double sum = reviews.stream().mapToInt(Review::getRating).sum();
            avgRating = BigDecimal.valueOf(sum / reviews.size()).setScale(1, RoundingMode.HALF_UP).doubleValue();
        }

        Map<String, Object> overview = new HashMap<>();
        overview.put("totalWatched", totalWatched);
        overview.put("totalWant", totalWant);
        overview.put("totalWatching", totalWatching);
        overview.put("totalBlindboxes", blindBoxRepository.countByUserId(userId));
        overview.put("avgRating", avgRating);
        overview.put("totalReviews", (long) reviews.size());
        return overview;
    }

    public List<Map<String, Object>> getGenreDistribution(Long userId) {
        List<WatchHistory> histories = watchHistoryRepository.findByUserIdOrderByWatchedAtDesc(userId);
        Map<String, Long> genreCount = new HashMap<>();

        for (WatchHistory history : histories) {
            movieRepository.findById(history.getMovieId()).ifPresent(movie -> {
                String genre = movie.getGenre();
                if (genre != null) {
                    for (String g : genre.split("[,，/]")) {
                        String trimmed = g.trim();
                        if (!trimmed.isEmpty()) {
                            genreCount.merge(trimmed, 1L, Long::sum);
                        }
                    }
                }
            });
        }

        return genreCount.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("name", entry.getKey());
                    item.put("value", entry.getValue());
                    return item;
                })
                .sorted((a, b) -> Long.compare((Long) b.get("value"), (Long) a.get("value")))
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getMonthlyWatching(Long userId) {
        List<Map<String, Object>> result = new ArrayList<>();
        LocalDate now = LocalDate.now();

        for (int i = 11; i >= 0; i--) {
            YearMonth ym = YearMonth.from(now.minusMonths(i));
            LocalDateTime start = ym.atDay(1).atStartOfDay();
            LocalDateTime end = ym.atEndOfMonth().atTime(23, 59, 59);

            List<WatchHistory> histories = watchHistoryRepository.findByUserIdAndWatchedAtBetween(userId, start, end);

            Map<String, Object> item = new HashMap<>();
            item.put("month", ym.toString());
            item.put("count", histories.size());
            result.add(item);
        }

        return result;
    }

    public List<Map<String, Object>> getRatingDistribution(Long userId) {
        List<WatchHistory> histories = watchHistoryRepository.findByUserIdOrderByWatchedAtDesc(userId);
        Map<String, Long> ratingBuckets = new LinkedHashMap<>();
        ratingBuckets.put("1-2", 0L);
        ratingBuckets.put("3-4", 0L);
        ratingBuckets.put("5-6", 0L);
        ratingBuckets.put("7-8", 0L);
        ratingBuckets.put("9-10", 0L);

        for (WatchHistory history : histories) {
            movieRepository.findById(history.getMovieId()).ifPresent(movie -> {
                if (movie.getRating() != null) {
                    double r = movie.getRating().doubleValue();
                    if (r >= 1 && r < 3) ratingBuckets.merge("1-2", 1L, Long::sum);
                    else if (r >= 3 && r < 5) ratingBuckets.merge("3-4", 1L, Long::sum);
                    else if (r >= 5 && r < 7) ratingBuckets.merge("5-6", 1L, Long::sum);
                    else if (r >= 7 && r < 9) ratingBuckets.merge("7-8", 1L, Long::sum);
                    else if (r >= 9) ratingBuckets.merge("9-10", 1L, Long::sum);
                }
            });
        }

        return ratingBuckets.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("range", entry.getKey());
                    item.put("count", entry.getValue());
                    return item;
                })
                .collect(Collectors.toList());
    }
}
