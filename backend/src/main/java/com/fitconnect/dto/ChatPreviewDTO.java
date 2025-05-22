package com.fitconnect.dto;

import java.time.LocalDateTime;

public class ChatPreviewDTO {
    public String username;
    public String lastMessage;
    public LocalDateTime timestamp;

    public ChatPreviewDTO(String username, String lastMessage, LocalDateTime timestamp) {
        this.username = username;
        this.lastMessage = lastMessage;
        this.timestamp = timestamp;
    }
}
