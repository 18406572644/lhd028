package com.cinema.blindbox.service;

import com.cinema.blindbox.dto.ListCommentRequest;
import com.cinema.blindbox.dto.MovieListRequest;
import com.cinema.blindbox.entity.*;
import com.cinema.blindbox.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class MovieListService {

    @Autowired
    private MovieListRepository movieListRepository;

    @Autowired
    private MovieListItemRepository movieListItemRepository;

    @Autowired
    private ListCommentRepository listCommentRepository;

    @Autowired
    private ListCollectionRepository listCollectionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MovieRepository movieRepository;

    @Transactional
    public Map<String, Object> createList(Long userId, MovieListRequest request) {
        MovieList movieList = new MovieList();
        movieList.setUserId(userId);
        movieList.setTitle(request.getTitle());
        movieList.setDescription(request.getDescription());
        movieList.setCover(request.getCover());
        movieList.setVisibility(request.getVisibility() != null ? request.getVisibility() : "PUBLIC");

        MovieList saved = movieListRepository.save(movieList);

        if (request.getItems() != null && !request.getItems().isEmpty()) {
            List<MovieListItem> items = new ArrayList<>();
            int order = 0;
            for (MovieListRequest.MovieItemRequest itemReq : request.getItems()) {
                MovieListItem item = new MovieListItem();
                item.setListId(saved.getId());
                item.setMovieId(itemReq.getMovieId());
                item.setSortOrder(itemReq.getSortOrder() != null ? itemReq.getSortOrder() : order);
                item.setTag(itemReq.getTag());
                items.add(item);
                order++;
            }
            movieListItemRepository.saveAll(items);

            if (saved.getCover() == null || saved.getCover().isEmpty()) {
                Optional<Movie> firstMovie = movieRepository.findById(items.get(0).getMovieId());
                if (firstMovie.isPresent() && firstMovie.get().getPosterUrl() != null) {
                    saved.setCover(firstMovie.get().getPosterUrl());
                    movieListRepository.save(saved);
                }
            }
        }

        return buildListResponse(saved, userId);
    }

    @Transactional
    public Map<String, Object> updateList(Long userId, Long listId, MovieListRequest request) {
        MovieList movieList = movieListRepository.findById(listId)
                .orElseThrow(() -> new RuntimeException("片单不存在"));

        if (!movieList.getUserId().equals(userId)) {
            throw new RuntimeException("无权修改此片单");
        }

        if (request.getTitle() != null) movieList.setTitle(request.getTitle());
        if (request.getDescription() != null) movieList.setDescription(request.getDescription());
        if (request.getCover() != null) movieList.setCover(request.getCover());
        if (request.getVisibility() != null) movieList.setVisibility(request.getVisibility());

        MovieList saved = movieListRepository.save(movieList);

        if (request.getItems() != null) {
            movieListItemRepository.deleteByListId(listId);
            List<MovieListItem> items = new ArrayList<>();
            int order = 0;
            for (MovieListRequest.MovieItemRequest itemReq : request.getItems()) {
                MovieListItem item = new MovieListItem();
                item.setListId(listId);
                item.setMovieId(itemReq.getMovieId());
                item.setSortOrder(itemReq.getSortOrder() != null ? itemReq.getSortOrder() : order);
                item.setTag(itemReq.getTag());
                items.add(item);
                order++;
            }
            movieListItemRepository.saveAll(items);
        }

        return buildListResponse(saved, userId);
    }

    @Transactional
    public void deleteList(Long userId, Long listId) {
        MovieList movieList = movieListRepository.findById(listId)
                .orElseThrow(() -> new RuntimeException("片单不存在"));

        if (!movieList.getUserId().equals(userId)) {
            throw new RuntimeException("无权删除此片单");
        }

        movieListItemRepository.deleteByListId(listId);
        listCommentRepository.deleteByListId(listId);
        listCollectionRepository.deleteByListId(listId);
        movieListRepository.deleteById(listId);
    }

    public Map<String, Object> getListDetail(Long listId, Long currentUserId) {
        MovieList movieList = movieListRepository.findById(listId)
                .orElseThrow(() -> new RuntimeException("片单不存在"));

        if ("PRIVATE".equals(movieList.getVisibility()) && !movieList.getUserId().equals(currentUserId)) {
            throw new RuntimeException("该片单为私密片单");
        }

        return buildListResponse(movieList, currentUserId);
    }

    public Map<String, Object> getPublicLists(int page, int size, String sort, String keyword) {
        Page<MovieList> listsPage;
        Sort sortObj;

        if ("hot".equals(sort)) {
            sortObj = Sort.by(Sort.Direction.DESC, "createdAt");
        } else if ("comments".equals(sort)) {
            sortObj = Sort.by(Sort.Direction.DESC, "createdAt");
        } else {
            sortObj = Sort.by(Sort.Direction.DESC, "createdAt");
        }

        if (keyword != null && !keyword.trim().isEmpty()) {
            listsPage = movieListRepository.searchPublicLists(keyword.trim(), PageRequest.of(page - 1, size, sortObj));
        } else {
            listsPage = movieListRepository.findPublicLists(PageRequest.of(page - 1, size, sortObj));
        }

        List<Map<String, Object>> listResponses = listsPage.getContent().stream()
                .map(ml -> buildListResponse(ml, null))
                .collect(Collectors.toList());

        if ("hot".equals(sort) || "comments".equals(sort)) {
            listResponses.sort((a, b) -> {
                int collectionsA = (int) a.getOrDefault("collectionCount", 0);
                int collectionsB = (int) b.getOrDefault("collectionCount", 0);
                int commentsA = (int) a.getOrDefault("commentCount", 0);
                int commentsB = (int) b.getOrDefault("commentCount", 0);

                if ("hot".equals(sort)) {
                    return (collectionsB + commentsB) - (collectionsA + commentsA);
                } else {
                    return commentsB - commentsA;
                }
            });
        }

        Map<String, Object> result = new HashMap<>();
        result.put("list", listResponses);
        result.put("total", listsPage.getTotalElements());
        result.put("page", page);
        result.put("size", size);
        return result;
    }

    public Map<String, Object> getMyLists(Long userId) {
        List<MovieList> myLists = movieListRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<Map<String, Object>> listResponses = myLists.stream()
                .map(ml -> buildListResponse(ml, userId))
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("list", listResponses);
        result.put("total", myLists.size());
        return result;
    }

    @Transactional
    public void collectList(Long userId, Long listId) {
        MovieList movieList = movieListRepository.findById(listId)
                .orElseThrow(() -> new RuntimeException("片单不存在"));

        if ("PRIVATE".equals(movieList.getVisibility()) && !movieList.getUserId().equals(userId)) {
            throw new RuntimeException("无法收藏私密片单");
        }

        if (listCollectionRepository.findByUserIdAndListId(userId, listId).isPresent()) {
            throw new RuntimeException("已收藏该片单");
        }

        ListCollection collection = new ListCollection();
        collection.setUserId(userId);
        collection.setListId(listId);
        listCollectionRepository.save(collection);
    }

    @Transactional
    public void uncollectList(Long userId, Long listId) {
        listCollectionRepository.deleteByUserIdAndListId(userId, listId);
    }

    public Map<String, Object> getCollectedLists(Long userId) {
        List<ListCollection> collections = listCollectionRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<Map<String, Object>> listResponses = new ArrayList<>();

        for (ListCollection lc : collections) {
            Optional<MovieList> optList = movieListRepository.findById(lc.getListId());
            if (optList.isPresent()) {
                listResponses.add(buildListResponse(optList.get(), userId));
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("list", listResponses);
        result.put("total", collections.size());
        return result;
    }

    public Map<String, Object> addComment(Long userId, ListCommentRequest request) {
        MovieList movieList = movieListRepository.findById(request.getListId())
                .orElseThrow(() -> new RuntimeException("片单不存在"));

        if ("PRIVATE".equals(movieList.getVisibility()) && !movieList.getUserId().equals(userId)) {
            throw new RuntimeException("无法评论私密片单");
        }

        ListComment comment = new ListComment();
        comment.setListId(request.getListId());
        comment.setUserId(userId);
        comment.setContent(request.getContent());
        ListComment saved = listCommentRepository.save(comment);

        return buildCommentResponse(saved);
    }

    public Map<String, Object> getComments(Long listId, int page, int size) {
        Page<ListComment> commentsPage = listCommentRepository.findByListIdOrderByCreatedAtDesc(
                listId, PageRequest.of(page - 1, size));

        List<Map<String, Object>> commentResponses = commentsPage.getContent().stream()
                .map(this::buildCommentResponse)
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("list", commentResponses);
        result.put("total", commentsPage.getTotalElements());
        return result;
    }

    @Transactional
    public void deleteComment(Long userId, Long commentId) {
        ListComment comment = listCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("评论不存在"));

        if (!comment.getUserId().equals(userId)) {
            throw new RuntimeException("无权删除此评论");
        }

        listCommentRepository.deleteById(commentId);
    }

    @Transactional
    public void addMovieToList(Long userId, Long listId, Long movieId, Integer sortOrder, String tag) {
        MovieList movieList = movieListRepository.findById(listId)
                .orElseThrow(() -> new RuntimeException("片单不存在"));

        if (!movieList.getUserId().equals(userId)) {
            throw new RuntimeException("无权修改此片单");
        }

        MovieListItem item = new MovieListItem();
        item.setListId(listId);
        item.setMovieId(movieId);
        item.setSortOrder(sortOrder != null ? sortOrder : movieListItemRepository.countByListId(listId));
        item.setTag(tag);
        movieListItemRepository.save(item);

        if (movieList.getCover() == null || movieList.getCover().isEmpty()) {
            Optional<Movie> movie = movieRepository.findById(movieId);
            if (movie.isPresent() && movie.get().getPosterUrl() != null) {
                movieList.setCover(movie.get().getPosterUrl());
                movieListRepository.save(movieList);
            }
        }
    }

    @Transactional
    public void removeMovieFromList(Long userId, Long listId, Long movieId) {
        MovieList movieList = movieListRepository.findById(listId)
                .orElseThrow(() -> new RuntimeException("片单不存在"));

        if (!movieList.getUserId().equals(userId)) {
            throw new RuntimeException("无权修改此片单");
        }

        movieListItemRepository.deleteByListIdAndMovieId(listId, movieId);
    }

    public Map<String, Object> generateYearReview(Long userId) {
        List<WatchHistory> watchedMovies = new ArrayList<>();
        try {
            watchedMovies = watchedMovies(userId);
        } catch (Exception e) {
            watchedMovies = new ArrayList<>();
        }

        List<Review> userReviews = new ArrayList<>();

        String year = String.valueOf(Calendar.getInstance().get(Calendar.YEAR));
        List<MovieList> existingLists = movieListRepository.findByUserIdOrderByCreatedAtDesc(userId);
        String reviewTitle = year + " 年度观影回顾";

        for (MovieList ml : existingLists) {
            if (reviewTitle.equals(ml.getTitle())) {
                return buildListResponse(ml, userId);
            }
        }

        MovieList reviewList = new MovieList();
        reviewList.setUserId(userId);
        reviewList.setTitle(reviewTitle);
        reviewList.setDescription("基于你的观影记录自动生成的年度回顾片单，共观看了 " + watchedMovies.size() + " 部电影");
        reviewList.setVisibility("PUBLIC");

        if (!watchedMovies.isEmpty()) {
            try {
                Optional<Movie> firstMovie = movieRepository.findById(watchedMovies.get(0).getMovieId());
                if (firstMovie.isPresent() && firstMovie.get().getPosterUrl() != null) {
                    reviewList.setCover(firstMovie.get().getPosterUrl());
                }
            } catch (Exception ignored) {}
        }

        MovieList saved = movieListRepository.save(reviewList);

        if (!watchedMovies.isEmpty()) {
            List<MovieListItem> items = new ArrayList<>();
            int maxMovies = Math.min(watchedMovies.size(), 20);
            for (int i = 0; i < maxMovies; i++) {
                MovieListItem item = new MovieListItem();
                item.setListId(saved.getId());
                item.setMovieId(watchedMovies.get(i).getMovieId());
                item.setSortOrder(i);
                items.add(item);
            }
            movieListItemRepository.saveAll(items);
        }

        return buildListResponse(saved, userId);
    }

    private List<WatchHistory> watchedMovies(Long userId) {
        return new ArrayList<>();
    }

    private Map<String, Object> buildListResponse(MovieList ml, Long currentUserId) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", ml.getId());
        response.put("userId", ml.getUserId());
        response.put("title", ml.getTitle());
        response.put("description", ml.getDescription());
        response.put("cover", ml.getCover());
        response.put("visibility", ml.getVisibility());
        response.put("createdAt", ml.getCreatedAt());

        userRepository.findById(ml.getUserId()).ifPresent(user -> {
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", user.getId());
            userInfo.put("username", user.getUsername());
            userInfo.put("nickname", user.getNickname());
            userInfo.put("avatar", user.getAvatar());
            response.put("user", userInfo);
        });

        List<MovieListItem> items = movieListItemRepository.findByListIdOrderBySortOrderAsc(ml.getId());
        List<Map<String, Object>> itemResponses = new ArrayList<>();
        for (MovieListItem item : items) {
            Map<String, Object> itemMap = new HashMap<>();
            itemMap.put("id", item.getId());
            itemMap.put("listId", item.getListId());
            itemMap.put("movieId", item.getMovieId());
            itemMap.put("sortOrder", item.getSortOrder());
            itemMap.put("tag", item.getTag());

            movieRepository.findById(item.getMovieId()).ifPresent(movie -> {
                Map<String, Object> movieInfo = new HashMap<>();
                movieInfo.put("id", movie.getId());
                movieInfo.put("title", movie.getTitle());
                movieInfo.put("posterUrl", movie.getPosterUrl());
                movieInfo.put("rating", movie.getRating());
                movieInfo.put("genre", movie.getGenre());
                movieInfo.put("year", movie.getYear());
                movieInfo.put("director", movie.getDirector());
                itemMap.put("movie", movieInfo);
            });

            itemResponses.add(itemMap);
        }
        response.put("items", itemResponses);
        response.put("movieCount", items.size());

        int commentCount = listCommentRepository.countByListId(ml.getId());
        response.put("commentCount", commentCount);

        int collectionCount = listCollectionRepository.countByListId(ml.getId());
        response.put("collectionCount", collectionCount);

        if (currentUserId != null) {
            boolean collected = listCollectionRepository.findByUserIdAndListId(currentUserId, ml.getId()).isPresent();
            response.put("isCollected", collected);
        } else {
            response.put("isCollected", false);
        }

        response.put("isOwner", currentUserId != null && currentUserId.equals(ml.getUserId()));

        return response;
    }

    private Map<String, Object> buildCommentResponse(ListComment comment) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", comment.getId());
        response.put("listId", comment.getListId());
        response.put("userId", comment.getUserId());
        response.put("content", comment.getContent());
        response.put("createdAt", comment.getCreatedAt());

        userRepository.findById(comment.getUserId()).ifPresent(user -> {
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
