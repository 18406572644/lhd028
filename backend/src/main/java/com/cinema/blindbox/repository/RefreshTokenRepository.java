package com.cinema.blindbox.repository;

import com.cinema.blindbox.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenAndRevokedAtIsNull(String token);

    void deleteByUserId(Long userId);
}
