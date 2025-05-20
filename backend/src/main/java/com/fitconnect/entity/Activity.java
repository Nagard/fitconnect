package com.fitconnect.entity;

public class Activity {
    private String user;
    private String text;
    private long timestamp;

    public Activity(String user, String text) {
        this.user = user;
        this.text = text;
        this.timestamp = System.currentTimeMillis();
    }

    public String getUser() {
        return user;
    }

    public String getText() {
        return text;
    }

    public long getTimestamp() {
        return timestamp;
    }
}
