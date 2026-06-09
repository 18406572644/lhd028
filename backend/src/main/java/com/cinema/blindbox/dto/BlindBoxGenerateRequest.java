package com.cinema.blindbox.dto;

import lombok.Data;

import java.util.List;

@Data
public class BlindBoxGenerateRequest {

    private List<String> genres;

    private String yearRange;

    private Double minRating;

    private Integer movieCount = 5;
}
