package com.fitconnect.controller;

import com.fitconnect.dto.ActivityRequest;
import com.fitconnect.entity.Activity;
import com.fitconnect.service.ActivityService;
import com.fitconnect.service.FeedSseService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
public class ActivityController {

    private final ActivityService activityService;
    private final FeedSseService feedSseService;

    public ActivityController(ActivityService activityService, FeedSseService feedSseService) {
        this.activityService = activityService;
        this.feedSseService = feedSseService;
    }

    @PostMapping("/activities")
    public ResponseEntity<Void> postActivity(@RequestBody ActivityRequest request, Authentication auth) {
        Activity activity = activityService.addActivity(auth.getName(), request.text());
        feedSseService.broadcast(activity);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/feed")
    public List<Activity> getFeed() {
        return activityService.getAllActivities();
    }

    @GetMapping("/feed-stream")
    public SseEmitter subscribeToFeed() {
        return feedSseService.subscribe();
    }
}
