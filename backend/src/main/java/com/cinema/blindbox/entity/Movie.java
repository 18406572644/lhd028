package com.cinema.blindbox.entity;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "movie")
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 50)
    private String genre;

    @Column(name = "year")
    @JsonProperty("releaseDate")
    private Integer year;

    @Column(precision = 3, scale = 1)
    private BigDecimal rating;

    @Column(length = 500)
    private String director;

    @Column(length = 1000)
    private String actors;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "poster_url", length = 500)
    @JsonProperty("poster")
    private String posterUrl;

    @Column(name = "duration")
    private Integer duration;

    @Column(length = 50)
    private String country;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
