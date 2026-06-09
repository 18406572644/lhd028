package com.cinema.blindbox.entity;

import lombok.Data;

import javax.persistence.*;

@Data
@Entity
@Table(name = "blindbox_movie")
public class BlindBoxMovie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "blindbox_id", nullable = false)
    private Long blindBoxId;

    @Column(name = "movie_id", nullable = false)
    private Long movieId;
}
