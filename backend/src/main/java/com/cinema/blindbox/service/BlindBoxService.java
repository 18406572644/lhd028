package com.cinema.blindbox.service;

import com.cinema.blindbox.dto.BlindBoxGenerateRequest;
import com.cinema.blindbox.entity.BlindBox;
import com.cinema.blindbox.entity.BlindBoxCollection;
import com.cinema.blindbox.entity.BlindBoxMovie;
import com.cinema.blindbox.entity.Movie;
import com.cinema.blindbox.repository.BlindBoxCollectionRepository;
import com.cinema.blindbox.repository.BlindBoxMovieRepository;
import com.cinema.blindbox.repository.BlindBoxRepository;
import com.cinema.blindbox.repository.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

@Service
public class BlindBoxService {

    @Autowired
    private BlindBoxRepository blindBoxRepository;

    @Autowired
    private BlindBoxMovieRepository blindBoxMovieRepository;

    @Autowired
    private BlindBoxCollectionRepository blindBoxCollectionRepository;

    @Autowired
    private MovieRepository movieRepository;

    public Map<String, Object> generateBlindBox(Long userId, BlindBoxGenerateRequest request) {
        List<String> genres = request.getGenres();
        String yearRange = request.getYearRange();
        Double minRating = request.getMinRating() != null ? request.getMinRating() : 0.0;
        int movieCount = request.getMovieCount() != null ? request.getMovieCount() : 5;

        int startYear = 1900;
        int endYear = 2030;
        if (yearRange != null && !yearRange.isEmpty()) {
            String[] parts = yearRange.split("-");
            if (parts.length == 2) {
                startYear = Integer.parseInt(parts[0].trim());
                endYear = Integer.parseInt(parts[1].trim());
            }
        }

        List<Movie> candidates = findCandidateMovies(genres, minRating, startYear, endYear);

        if (candidates.isEmpty()) {
            throw new RuntimeException("没有找到符合条件的电影");
        }

        List<Movie> selected = randomSelect(candidates, movieCount);

        String genresStr = genres != null && !genres.isEmpty() ? String.join(",", genres) : "全部";

        BlindBox blindBox = new BlindBox();
        blindBox.setUserId(userId);
        blindBox.setGenres(genresStr);
        blindBox.setYearRange(yearRange);
        blindBox.setMinRating(minRating);
        blindBox.setCount(selected.size());
        BlindBox savedBox = blindBoxRepository.save(blindBox);

        for (Movie movie : selected) {
            BlindBoxMovie bbm = new BlindBoxMovie();
            bbm.setBlindBoxId(savedBox.getId());
            bbm.setMovieId(movie.getId());
            blindBoxMovieRepository.save(bbm);
        }

        return buildBlindBoxResponse(savedBox, selected);
    }

    private List<Movie> findCandidateMovies(List<String> genres, Double minRating, int startYear, int endYear) {
        BigDecimal minRatingBd = BigDecimal.valueOf(minRating);
        boolean hasGenres = genres != null && !genres.isEmpty();
        boolean hasYearRange = startYear > 1900 || endYear < 2030;
        boolean hasMinRating = minRating > 0.0;

        if (hasGenres && hasYearRange && hasMinRating) {
            return movieRepository.findByGenresAndRatingAndYearRange(genres, minRatingBd, startYear, endYear);
        } else if (hasGenres && hasMinRating) {
            return movieRepository.findByGenresAndMinRating(genres, minRatingBd);
        } else if (hasGenres && hasYearRange) {
            return movieRepository.findByGenresAndYearRange(genres, startYear, endYear);
        } else if (hasMinRating && hasYearRange) {
            return movieRepository.findByMinRatingAndYearRange(minRatingBd, startYear, endYear);
        } else if (hasGenres) {
            return movieRepository.findByGenres(genres);
        } else if (hasMinRating) {
            return movieRepository.findByMinRating(minRatingBd);
        } else {
            return movieRepository.findAll();
        }
    }

    private List<Movie> randomSelect(List<Movie> candidates, int count) {
        List<Movie> shuffled = new ArrayList<>(candidates);
        Collections.shuffle(shuffled);
        return shuffled.subList(0, Math.min(count, shuffled.size()));
    }

    public List<Map<String, Object>> getMyBlindBoxes(Long userId) {
        List<BlindBox> boxes = blindBoxRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (BlindBox box : boxes) {
            result.add(buildBlindBoxResponse(box, getMoviesForBox(box.getId())));
        }
        return result;
    }

    public Map<String, Object> getBlindBoxById(Long id) {
        BlindBox box = blindBoxRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("盲盒不存在"));
        return buildBlindBoxResponse(box, getMoviesForBox(id));
    }

    public Map<String, Object> collectBlindBox(Long userId, Long blindBoxId) {
        BlindBox box = blindBoxRepository.findById(blindBoxId)
                .orElseThrow(() -> new RuntimeException("盲盒不存在"));

        if (blindBoxCollectionRepository.existsByUserIdAndBlindBoxId(userId, blindBoxId)) {
            throw new RuntimeException("已收藏该盲盒");
        }

        BlindBoxCollection collection = new BlindBoxCollection();
        collection.setUserId(userId);
        collection.setBlindBoxId(blindBoxId);
        blindBoxCollectionRepository.save(collection);

        Map<String, Object> result = new HashMap<>();
        result.put("collected", true);
        result.put("blindBoxId", blindBoxId);
        return result;
    }

    public Map<String, Object> uncollectBlindBox(Long userId, Long blindBoxId) {
        blindBoxCollectionRepository.deleteByUserIdAndBlindBoxId(userId, blindBoxId);

        Map<String, Object> result = new HashMap<>();
        result.put("collected", false);
        result.put("blindBoxId", blindBoxId);
        return result;
    }

    public List<Map<String, Object>> getCollections(Long userId) {
        List<BlindBoxCollection> collections = blindBoxCollectionRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (BlindBoxCollection collection : collections) {
            BlindBox box = blindBoxRepository.findById(collection.getBlindBoxId()).orElse(null);
            if (box != null) {
                Map<String, Object> boxResponse = buildBlindBoxResponse(box, getMoviesForBox(box.getId()));
                boxResponse.put("collectedAt", collection.getCreatedAt());
                result.add(boxResponse);
            }
        }
        return result;
    }

    private List<Movie> getMoviesForBox(Long blindBoxId) {
        List<BlindBoxMovie> bbms = blindBoxMovieRepository.findByBlindBoxId(blindBoxId);
        List<Movie> movies = new ArrayList<>();
        for (BlindBoxMovie bbm : bbms) {
            movieRepository.findById(bbm.getMovieId()).ifPresent(movies::add);
        }
        return movies;
    }

    private Map<String, Object> buildBlindBoxResponse(BlindBox box, List<Movie> movies) {
        Map<String, Object> response = new HashMap<>();
        response.put("blindboxId", box.getId());
        response.put("userId", box.getUserId());
        response.put("genres", box.getGenres());
        response.put("yearRange", box.getYearRange());
        response.put("minRating", box.getMinRating());
        response.put("count", box.getCount());
        response.put("createdAt", box.getCreatedAt());
        response.put("movies", movies);
        return response;
    }
}
