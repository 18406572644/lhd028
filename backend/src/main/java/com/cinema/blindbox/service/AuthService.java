package com.cinema.blindbox.service;

import com.cinema.blindbox.dto.LoginRequest;
import com.cinema.blindbox.dto.RegisterRequest;
import com.cinema.blindbox.entity.RefreshToken;
import com.cinema.blindbox.entity.User;
import com.cinema.blindbox.repository.RefreshTokenRepository;
import com.cinema.blindbox.repository.UserRepository;
import com.cinema.blindbox.util.JwtUtil;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    private static final int MAX_LOGIN_ATTEMPTS = 5;
    private static final int LOCK_DURATION_MINUTES = 15;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Value("${jwt.refresh-token-expiration}")
    private long refreshTokenExpiration;

    private final ConcurrentHashMap<String, String> captchaStore = new ConcurrentHashMap<>();

    public Map<String, Object> register(RegisterRequest request, String captchaKey, String captchaCode) {
        if (captchaKey == null || captchaCode == null) {
            throw new RuntimeException("请输入验证码");
        }
        String expectedCode = captchaStore.remove(captchaKey);
        if (expectedCode == null || !expectedCode.equalsIgnoreCase(captchaCode)) {
            throw new RuntimeException("验证码错误或已过期");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("用户名已存在");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(BCrypt.hashpw(request.getPassword(), BCrypt.gensalt()));
        user.setNickname(request.getNickname() != null ? request.getNickname() : request.getUsername());
        user.setFavoriteGenres(request.getFavoriteGenres());
        user.setPasswordMigrated(true);

        User savedUser = userRepository.save(user);

        return buildTokenResponse(savedUser);
    }

    public Map<String, Object> login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("用户名或密码错误"));

        if (isUserLocked(user)) {
            throw new RuntimeException("账户已锁定，请" + LOCK_DURATION_MINUTES + "分钟后重试");
        }

        if (!checkPassword(user, request.getPassword())) {
            handleLoginFailure(user);
            throw new RuntimeException("用户名或密码错误");
        }

        resetLoginAttempts(user);

        return buildTokenResponse(user);
    }

    public Map<String, Object> refreshToken(String refreshTokenStr) {
        if (refreshTokenStr == null) {
            throw new RuntimeException("Refresh Token不能为空");
        }

        var jwt = jwtUtil.verifyRefreshToken(refreshTokenStr);
        Long userId = jwt.getClaim("userId").asLong();

        RefreshToken storedToken = refreshTokenRepository.findByTokenAndRevokedAtIsNull(refreshTokenStr)
                .orElseThrow(() -> new RuntimeException("Refresh Token无效或已吊销"));

        if (storedToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Refresh Token已过期");
        }

        storedToken.setRevokedAt(LocalDateTime.now());
        refreshTokenRepository.save(storedToken);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        return buildTokenResponse(user);
    }

    public void logout(Long userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }

    public Map<String, Object> generateCaptcha() {
        String code = com.cinema.blindbox.util.CaptchaUtil.generateCode();
        String key = java.util.UUID.randomUUID().toString();
        captchaStore.put(key, code);

        if (captchaStore.size() > 1000) {
            captchaStore.clear();
        }

        try {
            String imageBase64 = com.cinema.blindbox.util.CaptchaUtil.generateCaptchaImageBase64(code);
            Map<String, Object> result = new HashMap<>();
            result.put("captchaKey", key);
            result.put("captchaImage", "data:image/png;base64," + imageBase64);
            return result;
        } catch (Exception e) {
            throw new RuntimeException("生成验证码失败");
        }
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

    private boolean checkPassword(User user, String rawPassword) {
        if (Boolean.TRUE.equals(user.getPasswordMigrated())) {
            return BCrypt.checkpw(rawPassword, user.getPassword());
        }

        if (user.getPassword().equals(rawPassword)) {
            user.setPassword(BCrypt.hashpw(rawPassword, BCrypt.gensalt()));
            user.setPasswordMigrated(true);
            userRepository.save(user);
            return true;
        }
        return false;
    }

    private boolean isUserLocked(User user) {
        if (user.getLockTime() != null && user.getLockTime().isAfter(LocalDateTime.now())) {
            return true;
        }
        if (user.getLockTime() != null && user.getLockTime().isBefore(LocalDateTime.now())) {
            user.setLoginAttemptCount(0);
            user.setLockTime(null);
            userRepository.save(user);
        }
        return false;
    }

    private void handleLoginFailure(User user) {
        int attempts = (user.getLoginAttemptCount() != null ? user.getLoginAttemptCount() : 0) + 1;
        user.setLoginAttemptCount(attempts);

        if (attempts >= MAX_LOGIN_ATTEMPTS) {
            user.setLockTime(LocalDateTime.now().plusMinutes(LOCK_DURATION_MINUTES));
        }
        userRepository.save(user);
    }

    private void resetLoginAttempts(User user) {
        if (user.getLoginAttemptCount() != null && user.getLoginAttemptCount() > 0) {
            user.setLoginAttemptCount(0);
            user.setLockTime(null);
            userRepository.save(user);
        }
    }

    private Map<String, Object> buildTokenResponse(User user) {
        String accessToken = jwtUtil.generateAccessToken(user.getId(), user.getUsername());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId(), user.getUsername());

        RefreshToken tokenEntity = new RefreshToken();
        tokenEntity.setUserId(user.getId());
        tokenEntity.setToken(refreshToken);
        tokenEntity.setExpiresAt(LocalDateTime.now().plusNanos(refreshTokenExpiration * 1_000_000));
        refreshTokenRepository.save(tokenEntity);

        Map<String, Object> result = new HashMap<>();
        result.put("token", accessToken);
        result.put("refreshToken", refreshToken);
        result.put("user", buildUserResponse(user));
        return result;
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
