package com.fitconnect.entity;

import jakarta.persistence.*;

@Entity
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "username")
    private String user;
    private String text;
    private long timestamp;

    public Activity() {}

    public Activity(String user, String text) {
        this.user = user;
        this.text = text;
        this.timestamp = System.currentTimeMillis();
    }

    public Long getId() { return id; }
    public String getUser() { return user; }
    public String getText() { return text; }
    public long getTimestamp() { return timestamp; }

    public void setText(String text) {
        this.text = text;
    }
}

