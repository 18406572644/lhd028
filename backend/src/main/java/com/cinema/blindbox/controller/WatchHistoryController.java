package com.cinema.blindbox.controller;

import com.cinema.blindbox.dto.ApiResponse;
import com.cinema.blindbox.dto.WatchHistoryRequest;
import com.cinema.blindbox.service.WatchHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/watch-history")
public class WatchHistoryController {

    @Autowired
    private WatchHistoryService watchHistoryService;

    @PostMapping
    public ApiResponse<Map<String, Object>> addWatchHistory(HttpServletRequest request,
                                                            @RequestBody WatchHistoryRequest historyRequest) {
        Long userId = (Long) request.getAttribute("userId");
        try {
            Map<String, Object> result = watchHistoryService.addWatchHistory(userId, historyRequest);
            return ApiResponse.success("添加成功", result);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ApiResponse<Map<String, Object>> updateWatchHistory(HttpServletRequest request,
                                                               @PathVariable Long id,
                                                               @RequestBody WatchHistoryRequest historyRequest) {
        Long userId = (Long) request.getAttribute("userId");
        try {
            Map<String, Object> result = watchHistoryService.updateWatchHistory(userId, id, historyRequest);
            return ApiResponse.success("更新成功", result);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @GetMapping
    public ApiResponse<List<Map<String, Object>>> getWatchHistory(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ApiResponse.success(watchHistoryService.getWatchHistory(userId));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteWatchHistory(HttpServletRequest request, @PathVariable Long id) {
        Long userId = (Long) request.getAttribute("userId");
        try {
            watchHistoryService.deleteWatchHistory(userId, id);
            return ApiResponse.success("删除成功", null);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }
}
