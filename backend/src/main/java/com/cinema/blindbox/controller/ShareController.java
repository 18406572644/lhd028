package com.cinema.blindbox.controller;

import com.cinema.blindbox.dto.ApiResponse;
import com.cinema.blindbox.dto.ShareRequest;
import com.cinema.blindbox.service.ShareService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/shares")
public class ShareController {

    @Autowired
    private ShareService shareService;

    @PostMapping
    public ApiResponse<Map<String, Object>> createShare(HttpServletRequest request,
                                                        @RequestBody ShareRequest shareRequest) {
        Long userId = (Long) request.getAttribute("userId");
        try {
            Map<String, Object> result = shareService.createShare(userId, shareRequest);
            return ApiResponse.success("分享成功", result);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @GetMapping("/my")
    public ApiResponse<List<Map<String, Object>>> getMyShares(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ApiResponse.success(shareService.getMyShares(userId));
    }

    @GetMapping("/{shareCode}")
    public ApiResponse<Map<String, Object>> getShareByShareCode(@PathVariable String shareCode) {
        try {
            Map<String, Object> result = shareService.getShareByShareCode(shareCode);
            return ApiResponse.success(result);
        } catch (RuntimeException e) {
            return ApiResponse.error(404, e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteShare(HttpServletRequest request, @PathVariable Long id) {
        Long userId = (Long) request.getAttribute("userId");
        try {
            shareService.deleteShare(userId, id);
            return ApiResponse.success("删除成功", null);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }
}
