package com.fitconnect.controller;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/feed")
public class FeedController {

    @GetMapping
    public List<Map<String, String>> getFeed() {
        return List.of(
            Map.of("user", "Anna", "activity", "5 km Jogging"),
            Map.of("user", "Tom", "activity", "2 km Spaziergang")
        );
    }
}
