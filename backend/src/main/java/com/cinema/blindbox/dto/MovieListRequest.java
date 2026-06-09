package com.cinema.blindbox.dto;

import lombok.Data;

import java.util.List;

@Data
public class MovieListRequest {

    private String title;

    private String description;

    private String cover;

    private String visibility;

    private List<MovieItemRequest> items;

    @Data
    public static class MovieItemRequest {
        private Long movieId;
        private Integer sortOrder;
        private String tag;
    }
}
