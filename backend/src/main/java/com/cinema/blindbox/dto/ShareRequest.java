package com.cinema.blindbox.dto;

import lombok.Data;

@Data
public class ShareRequest {

    private String type;

    private Long typeId;

    private Long blindBoxId;
}
