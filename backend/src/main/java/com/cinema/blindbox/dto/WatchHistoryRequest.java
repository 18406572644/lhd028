package com.cinema.blindbox.dto;

import lombok.Data;

@Data
public class WatchHistoryRequest {

    private Long movieId;

    private String status;

    private String watchedAt;
}
