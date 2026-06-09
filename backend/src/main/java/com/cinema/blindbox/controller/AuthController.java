package com.cinema.blindbox.controller;

import com.cinema.blindbox.dto.ApiResponse;
import com.cinema.blindbox.dto.LoginRequest;
import com.cinema.blindbox.dto.RegisterRequest;
import com.cinema.blindbox.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ApiResponse<Map<String, Object>> register(
            @Valid @RequestBody RegisterRequest request,
            @RequestParam(value = "captchaKey", required = false) String captchaKey,
            @RequestParam(value = "captchaCode", required = false) String captchaCode) {
        try {
            Map<String, Object> result = authService.register(request, captchaKey, captchaCode);
            return ApiResponse.success("注册成功", result);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @PostMapping("/login")
    public ApiResponse<Map<String, Object>> login(@Valid @RequestBody LoginRequest request) {
        try {
            Map<String, Object> result = authService.login(request);
            return ApiResponse.success("登录成功", result);
        } catch (RuntimeException e) {
            return ApiResponse.error(401, e.getMessage());
        }
    }

    @PostMapping("/refresh")
    public ApiResponse<Map<String, Object>> refreshToken(@RequestBody Map<String, String> body) {
        try {
            String refreshToken = body.get("refreshToken");
            Map<String, Object> result = authService.refreshToken(refreshToken);
            return ApiResponse.success("刷新成功", result);
        } catch (RuntimeException e) {
            return ApiResponse.error(401, e.getMessage());
        }
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        try {
            authService.logout(userId);
            return ApiResponse.success("退出成功", null);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @GetMapping("/captcha")
    public ApiResponse<Map<String, Object>> getCaptcha() {
        try {
            Map<String, Object> result = authService.generateCaptcha();
            return ApiResponse.success(result);
        } catch (RuntimeException e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @GetMapping("/info")
    public ApiResponse<Map<String, Object>> getUserInfo(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        try {
            Map<String, Object> result = authService.getUserInfo(userId);
            return ApiResponse.success(result);
        } catch (RuntimeException e) {
            return ApiResponse.error(404, e.getMessage());
        }
    }

    @PutMapping("/info")
    public ApiResponse<Map<String, Object>> updateUserInfo(HttpServletRequest request,
                                                           @RequestBody Map<String, String> body) {
        Long userId = (Long) request.getAttribute("userId");
        try {
            Map<String, Object> result = authService.updateUserInfo(
                    userId,
                    body.get("nickname"),
                    body.get("favoriteGenres"),
                    body.get("avatar")
            );
            return ApiResponse.success("更新成功", result);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }
}
