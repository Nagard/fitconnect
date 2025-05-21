package com.fitconnect.controller;

import com.fitconnect.dto.ActivityRequest;
import com.fitconnect.entity.Activity;
import com.fitconnect.entity.Visibility;
import com.fitconnect.repository.ActivityRepository;
import com.fitconnect.service.FeedSseService;
import com.fitconnect.service.FriendshipService;

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

    private final FriendshipService friendshipService;

    public ActivityController(ActivityRepository activityRepository,
                            FeedSseService feedSseService,
                            FriendshipService friendshipService) {
        this.activityRepository = activityRepository;
        this.feedSseService = feedSseService;
        this.friendshipService = friendshipService;
    }

    @GetMapping("/feed-stream")
    public SseEmitter subscribeToFeed() {
        return feedSseService.subscribe();
    }

    @PostMapping
    public ResponseEntity<Activity> postActivity(@RequestBody ActivityRequest request, Authentication auth) {
        Activity activity = new Activity(auth.getName(), request.text(), request.location());
        activity.setVisibility(Visibility.valueOf(request.visibility().toUpperCase())); // z. B. "FRIENDS_ONLY"
        activityRepository.save(activity);
        feedSseService.broadcast(activity);
        return ResponseEntity.ok(activity);
    }

   @GetMapping
public List<Activity> getFeed(Authentication auth) {
    String viewer = auth.getName();
    return activityRepository.findAllByOrderByTimestampDesc().stream()
        .filter(a -> {
            if (a.getUser().equals(viewer)) return true;
            return switch (a.getVisibility()) {
                case PUBLIC -> true;
                case PRIVATE -> false;
                case FRIENDS_ONLY -> friendshipService.areFriends(viewer, a.getUser());
            };
        })
        .toList();
}

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody ActivityRequest request, Authentication auth) {
        Optional<Activity> optional = activityRepository.findById(id);
        if (optional.isEmpty()) return ResponseEntity.notFound().build();

        Activity activity = optional.get();
        if (!activity.getUser().equals(auth.getName())) return ResponseEntity.status(403).build();

        activity.setText(request.text());
        activity.setLocation(request.location()); // 🆕
        activityRepository.save(activity);
        feedSseService.broadcastUpdate(activity);
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

    @GetMapping("/me/activities")
    public List<Activity> getOwnActivities(Authentication auth) {
        return activityRepository.findByUserOrderByTimestampDesc(auth.getName());
    }


}
