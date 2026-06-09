package com.cinema.blindbox.dto;

import lombok.Data;

@Data
public class ListCommentRequest {

    private Long listId;

    private String content;
}
