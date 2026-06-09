package com.cinema.blindbox.service;

import com.cinema.blindbox.dto.LoginRequest;
import com.cinema.blindbox.dto.RegisterRequest;
import com.cinema.blindbox.entity.User;
import com.cinema.blindbox.repository.UserRepository;
import com.cinema.blindbox.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    public Map<String, Object> register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("用户名已存在");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword());
        user.setNickname(request.getNickname() != null ? request.getNickname() : request.getUsername());
        user.setFavoriteGenres(request.getFavoriteGenres());

        User savedUser = userRepository.save(user);

        String token = JwtUtil.generateToken(savedUser.getId(), savedUser.getUsername());

        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("user", buildUserResponse(savedUser));
        return result;
    }

    public Map<String, Object> login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("用户名或密码错误"));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("用户名或密码错误");
        }

        String token = JwtUtil.generateToken(user.getId(), user.getUsername());

        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("user", buildUserResponse(user));
        return result;
    }

    public Map<String, Object> getUserInfo(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        return buildUserResponse(user);
    }

    public Map<String, Object> updateUserInfo(Long userId, String nickname, String favoriteGenres, String avatar) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        if (nickname != null) {
            user.setNickname(nickname);
        }
        if (favoriteGenres != null) {
            user.setFavoriteGenres(favoriteGenres);
        }
        if (avatar != null) {
            user.setAvatar(avatar);
        }

        User updatedUser = userRepository.save(user);
        return buildUserResponse(updatedUser);
    }

    private Map<String, Object> buildUserResponse(User user) {
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", user.getId());
        userMap.put("username", user.getUsername());
        userMap.put("nickname", user.getNickname());
        userMap.put("avatar", user.getAvatar());
        userMap.put("favoriteGenres", user.getFavoriteGenres());
        userMap.put("createdAt", user.getCreatedAt());
        return userMap;
    }
}
