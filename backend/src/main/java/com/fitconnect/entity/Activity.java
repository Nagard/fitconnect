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

    private String location; // 🆕 z. B. "Darmstadt Marktplatz"


    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Visibility visibility = Visibility.PUBLIC;

    // Getter & Setter
    public Visibility getVisibility() { return visibility; }
    public void setVisibility(Visibility visibility) { this.visibility = visibility; }

    public Activity() {}

    public Activity(String user, String text, String location) {
        this.user = user;
        this.text = text;
        this.location = location;
        this.timestamp = System.currentTimeMillis();
    }

    // Getter & Setter
    public Long getId() { return id; }
    public String getUser() { return user; }
    public String getText() { return text; }
    public long getTimestamp() { return timestamp; }
    public String getLocation() { return location; }

    public void setText(String text) {
        this.text = text;
    }

    public void setLocation(String location) {
        this.location = location;
    }
}

