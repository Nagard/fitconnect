package com.fitconnect.service;

import com.fitconnect.entity.Activity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class ActivityService {

    private final List<Activity> activities = Collections.synchronizedList(new ArrayList<>());

    public void addActivity(String username, String text) {
        activities.add(new Activity(username, text));
    }

    public List<Activity> getAllActivities() {
        return List.copyOf(activities);
    }
}
