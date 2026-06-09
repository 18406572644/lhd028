package com.cinema.blindbox.controller;

import com.cinema.blindbox.dto.ApiResponse;
import com.cinema.blindbox.dto.BlindBoxGenerateRequest;
import com.cinema.blindbox.service.BlindBoxService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/blindbox")
public class BlindBoxController {

    @Autowired
    private BlindBoxService blindBoxService;

    @PostMapping("/generate")
    public ApiResponse<Map<String, Object>> generateBlindBox(HttpServletRequest request,
                                                             @RequestBody BlindBoxGenerateRequest boxRequest) {
        Long userId = (Long) request.getAttribute("userId");
        try {
            Map<String, Object> result = blindBoxService.generateBlindBox(userId, boxRequest);
            return ApiResponse.success("盲盒生成成功", result);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @GetMapping("/my")
    public ApiResponse<List<Map<String, Object>>> getMyBlindBoxes(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ApiResponse.success(blindBoxService.getMyBlindBoxes(userId));
    }

    @GetMapping("/{id}")
    public ApiResponse<Map<String, Object>> getBlindBoxById(@PathVariable Long id) {
        try {
            return ApiResponse.success(blindBoxService.getBlindBoxById(id));
        } catch (RuntimeException e) {
            return ApiResponse.error(404, e.getMessage());
        }
    }

    @PostMapping("/{id}/collect")
    public ApiResponse<Map<String, Object>> collectBlindBox(HttpServletRequest request, @PathVariable Long id) {
        Long userId = (Long) request.getAttribute("userId");
        try {
            Map<String, Object> result = blindBoxService.collectBlindBox(userId, id);
            return ApiResponse.success("收藏成功", result);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @DeleteMapping("/{id}/collect")
    public ApiResponse<Map<String, Object>> uncollectBlindBox(HttpServletRequest request, @PathVariable Long id) {
        Long userId = (Long) request.getAttribute("userId");
        try {
            Map<String, Object> result = blindBoxService.uncollectBlindBox(userId, id);
            return ApiResponse.success("取消收藏成功", result);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @GetMapping("/collections")
    public ApiResponse<List<Map<String, Object>>> getCollections(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ApiResponse.success(blindBoxService.getCollections(userId));
    }
}
