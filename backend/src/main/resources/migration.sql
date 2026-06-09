USE cinema_blindbox;

ALTER TABLE `user` ADD COLUMN login_attempt_count INT DEFAULT 0;
ALTER TABLE `user` ADD COLUMN lock_time DATETIME;
ALTER TABLE `user` ADD COLUMN password_migrated TINYINT(1) DEFAULT 0;

CREATE TABLE IF NOT EXISTS refresh_token (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    revoked_at DATETIME
);
