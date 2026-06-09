package com.cinema.blindbox.config;

import com.auth0.jwt.exceptions.TokenExpiredException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.cinema.blindbox.util.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtInterceptor implements HandlerInterceptor {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            try {
                jwtUtil.verifyAccessToken(token);
                Long userId = jwtUtil.getUserId(token);
                String username = jwtUtil.getUsername(token);
                request.setAttribute("userId", userId);
                request.setAttribute("username", username);
                return true;
            } catch (TokenExpiredException e) {
                sendError(response, 401, "TOKEN_EXPIRED", "Access Token已过期");
                return false;
            } catch (JWTVerificationException e) {
                sendError(response, 401, "TOKEN_INVALID", "Token无效");
                return false;
            }
        }

        sendError(response, 401, "TOKEN_MISSING", "未提供认证Token");
        return false;
    }

    private void sendError(HttpServletResponse response, int code, String errorType, String message) throws Exception {
        response.setStatus(code);
        response.setContentType("application/json;charset=UTF-8");
        Map<String, Object> result = new HashMap<>();
        result.put("code", code);
        result.put("errorType", errorType);
        result.put("message", message);
        result.put("data", null);
        response.getWriter().write(objectMapper.writeValueAsString(result));
    }
}
