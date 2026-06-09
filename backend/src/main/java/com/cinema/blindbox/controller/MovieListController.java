package com.cinema.blindbox.controller;

import com.cinema.blindbox.dto.ApiResponse;
import com.cinema.blindbox.dto.ListCommentRequest;
import com.cinema.blindbox.dto.MovieListRequest;
import com.cinema.blindbox.service.MovieListService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;

@RestController
@RequestMapping("/api/lists")
public class MovieListController {

    @Autowired
    private MovieListService movieListService;

    @PostMapping
    public ApiResponse<Map<String, Object>> createList(HttpServletRequest request,
                                                        @RequestBody MovieListRequest listRequest) {
        Long userId = (Long) request.getAttribute("userId");
        try {
            Map<String, Object> result = movieListService.createList(userId, listRequest);
            return ApiResponse.success("创建成功", result);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ApiResponse<Map<String, Object>> updateList(HttpServletRequest request,
                                                        @PathVariable Long id,
                                                        @RequestBody MovieListRequest listRequest) {
        Long userId = (Long) request.getAttribute("userId");
        try {
            Map<String, Object> result = movieListService.updateList(userId, id, listRequest);
            return ApiResponse.success("更新成功", result);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteList(HttpServletRequest request, @PathVariable Long id) {
        Long userId = (Long) request.getAttribute("userId");
        try {
            movieListService.deleteList(userId, id);
            return ApiResponse.success("删除成功", null);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ApiResponse<Map<String, Object>> getListDetail(HttpServletRequest request, @PathVariable Long id) {
        Long userId = (Long) request.getAttribute("userId");
        try {
            Map<String, Object> result = movieListService.getListDetail(id, userId);
            return ApiResponse.success(result);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @GetMapping
    public ApiResponse<Map<String, Object>> getPublicLists(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "latest") String sort,
            @RequestParam(required = false) String keyword) {
        Map<String, Object> result = movieListService.getPublicLists(page, size, sort, keyword);
        return ApiResponse.success(result);
    }

    @GetMapping("/my")
    public ApiResponse<Map<String, Object>> getMyLists(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        Map<String, Object> result = movieListService.getMyLists(userId);
        return ApiResponse.success(result);
    }

    @PostMapping("/{id}/collect")
    public ApiResponse<Void> collectList(HttpServletRequest request, @PathVariable Long id) {
        Long userId = (Long) request.getAttribute("userId");
        try {
            movieListService.collectList(userId, id);
            return ApiResponse.success("收藏成功", null);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @DeleteMapping("/{id}/collect")
    public ApiResponse<Void> uncollectList(HttpServletRequest request, @PathVariable Long id) {
        Long userId = (Long) request.getAttribute("userId");
        try {
            movieListService.uncollectList(userId, id);
            return ApiResponse.success("取消收藏成功", null);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @GetMapping("/collected")
    public ApiResponse<Map<String, Object>> getCollectedLists(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        Map<String, Object> result = movieListService.getCollectedLists(userId);
        return ApiResponse.success(result);
    }

    @PostMapping("/{id}/comments")
    public ApiResponse<Map<String, Object>> addComment(HttpServletRequest request,
                                                        @PathVariable Long id,
                                                        @RequestBody ListCommentRequest commentRequest) {
        Long userId = (Long) request.getAttribute("userId");
        try {
            commentRequest.setListId(id);
            Map<String, Object> result = movieListService.addComment(userId, commentRequest);
            return ApiResponse.success("评论成功", result);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @GetMapping("/{id}/comments")
    public ApiResponse<Map<String, Object>> getComments(
            @PathVariable Long id,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        Map<String, Object> result = movieListService.getComments(id, page, size);
        return ApiResponse.success(result);
    }

    @DeleteMapping("/comments/{commentId}")
    public ApiResponse<Void> deleteComment(HttpServletRequest request, @PathVariable Long commentId) {
        Long userId = (Long) request.getAttribute("userId");
        try {
            movieListService.deleteComment(userId, commentId);
            return ApiResponse.success("删除成功", null);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @PostMapping("/{id}/movies")
    public ApiResponse<Void> addMovieToList(HttpServletRequest request,
                                             @PathVariable Long id,
                                             @RequestBody Map<String, Object> body) {
        Long userId = (Long) request.getAttribute("userId");
        try {
            Long movieId = Long.valueOf(body.get("movieId").toString());
            Integer sortOrder = body.get("sortOrder") != null ? Integer.valueOf(body.get("sortOrder").toString()) : null;
            String tag = body.get("tag") != null ? body.get("tag").toString() : null;
            movieListService.addMovieToList(userId, id, movieId, sortOrder, tag);
            return ApiResponse.success("添加成功", null);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @DeleteMapping("/{id}/movies/{movieId}")
    public ApiResponse<Void> removeMovieFromList(HttpServletRequest request,
                                                  @PathVariable Long id,
                                                  @PathVariable Long movieId) {
        Long userId = (Long) request.getAttribute("userId");
        try {
            movieListService.removeMovieFromList(userId, id, movieId);
            return ApiResponse.success("移除成功", null);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @PostMapping("/year-review")
    public ApiResponse<Map<String, Object>> generateYearReview(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        try {
            Map<String, Object> result = movieListService.generateYearReview(userId);
            return ApiResponse.success("生成成功", result);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }
}
