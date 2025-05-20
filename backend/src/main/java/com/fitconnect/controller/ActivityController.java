package com.fitconnect.controller;

import com.fitconnect.dto.ActivityRequest;
import com.fitconnect.entity.Activity;
import com.fitconnect.service.ActivityService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class ActivityController {

    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @PostMapping("/activities")
    public ResponseEntity<Void> postActivity(@RequestBody ActivityRequest request, Authentication auth) {
        activityService.addActivity(auth.getName(), request.text());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/feed")
    public List<Activity> getFeed() {
        return activityService.getAllActivities();
    }
}
