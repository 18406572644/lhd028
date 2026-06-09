package com.cinema.blindbox.entity;

import lombok.Data;

import javax.persistence.*;

@Data
@Entity
@Table(name = "movie_list_item")
public class MovieListItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "list_id", nullable = false)
    private Long listId;

    @Column(name = "movie_id", nullable = false)
    private Long movieId;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(length = 50)
    private String tag;
}
