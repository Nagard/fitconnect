package com.fitconnect.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class GroupMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Group group;

    @ManyToOne(optional = false)
    private User sender;

    @Column(nullable = false)
    private String text;

    private LocalDateTime timestamp = LocalDateTime.now();

    public GroupMessage() {}

    public GroupMessage(Group group, User sender, String text) {
        this.group = group;
        this.sender = sender;
        this.text = text;
    }

    // Getter
    public Long getId() { return id; }
    public Group getGroup() { return group; }
    public User getSender() { return sender; }
    public String getText() { return text; }
    public LocalDateTime getTimestamp() { return timestamp; }
}