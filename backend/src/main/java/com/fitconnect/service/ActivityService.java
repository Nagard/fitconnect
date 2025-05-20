package com.fitconnect.service;

import com.fitconnect.entity.Activity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class ActivityService {

    private final List<Activity> activities = Collections.synchronizedList(new ArrayList<>());

    public Activity addActivity(String username, String text) {
        Activity activity = new Activity(username, text);
        activities.add(activity);
        return activity;
    }

    public List<Activity> getAllActivities() {
        return List.copyOf(activities);
    }
}
