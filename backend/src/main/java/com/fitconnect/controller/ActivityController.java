package com.fitconnect.controller;

import com.fitconnect.dto.ActivityRequest;
import com.fitconnect.entity.Activity;
import com.fitconnect.repository.ActivityRepository;
import com.fitconnect.service.FeedSseService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/activities")
public class ActivityController {

    private final ActivityRepository activityRepository;
    private final FeedSseService feedSseService;

    public ActivityController(ActivityRepository activityRepository, FeedSseService feedSseService) {
        this.activityRepository = activityRepository;
        this.feedSseService = feedSseService;
    }

    @GetMapping("/feed-stream")
    public SseEmitter subscribeToFeed() {
        return feedSseService.subscribe();
    }

    @PostMapping
    public ResponseEntity<Activity> postActivity(@RequestBody ActivityRequest request, Authentication auth) {
        Activity activity = new Activity(auth.getName(), request.text());
        activityRepository.save(activity);
        feedSseService.broadcast(activity);
        return ResponseEntity.ok(activity); // 🟢 gibt echte ID zurück
    }

    @GetMapping
    public List<Activity> getFeed() {
        return activityRepository.findAllByOrderByTimestampDesc();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody ActivityRequest request, Authentication auth) {
        Optional<Activity> optional = activityRepository.findById(id);
        if (optional.isEmpty()) return ResponseEntity.notFound().build();

        Activity activity = optional.get();
        if (!activity.getUser().equals(auth.getName())) return ResponseEntity.status(403).build();

        activity.setText(request.text());
        activityRepository.save(activity);

        feedSseService.broadcastUpdate(activity); // aktualisierte Aktivität senden
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, Authentication auth) {
        Optional<Activity> optional = activityRepository.findById(id);
        if (optional.isEmpty()) return ResponseEntity.notFound().build();

        Activity activity = optional.get();
        if (!activity.getUser().equals(auth.getName())) return ResponseEntity.status(403).build();

        activityRepository.deleteById(id);
        feedSseService.broadcastDelete(id); // Lösch-ID senden
        return ResponseEntity.ok().build();
    }
}
