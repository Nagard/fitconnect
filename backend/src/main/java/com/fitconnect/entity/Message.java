package com.fitconnect.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private User sender;

    @ManyToOne(optional = false)
    private User recipient;

    @Column(nullable = false)
    private String text;

    private LocalDateTime timestamp = LocalDateTime.now();

    public Message() {}

    public Message(User sender, User recipient, String text) {
        this.sender = sender;
        this.recipient = recipient;
        this.text = text;
        this.timestamp = LocalDateTime.now();
    }

    // Getter
    public Long getId() { return id; }
    public User getSender() { return sender; }
    public User getRecipient() { return recipient; }
    public String getText() { return text; }
    public LocalDateTime getTimestamp() { return timestamp; }
}
