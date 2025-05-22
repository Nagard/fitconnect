package com.fitconnect.controller;

import com.fitconnect.entity.Friendship;
import com.fitconnect.entity.User;
import com.fitconnect.service.FriendshipService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/friends")
public class FriendshipController {

    private final FriendshipService friendshipService;

    public FriendshipController(FriendshipService friendshipService) {
        this.friendshipService = friendshipService;
    }

    @PostMapping("/request/{targetUsername}")
    public ResponseEntity<Void> sendRequest(Authentication auth,
                                            @PathVariable String targetUsername) {
        friendshipService.sendRequest(auth.getName(), targetUsername);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/respond/{requestId}")
    public ResponseEntity<Void> respondToRequest(@PathVariable Long requestId,
                                                 @RequestParam boolean accept) {
        friendshipService.respondToRequest(requestId, accept);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<User>> listFriends(Authentication auth) {
        return ResponseEntity.ok(friendshipService.listFriends(auth.getName()));
    }

    @GetMapping("/requests")
    public ResponseEntity<List<Friendship>> listPending(Authentication auth) {
        return ResponseEntity.ok(friendshipService.listPendingRequests(auth.getName()));
    }

    @GetMapping("/{username}/status")
    public ResponseEntity<String> getFriendshipStatus(Authentication auth, @PathVariable String username) {
        String currentUser = auth.getName();
        String status = friendshipService.getFriendshipStatus(currentUser, username);
        return ResponseEntity.ok(status);
    }

    @DeleteMapping("/remove/{username}")
    public ResponseEntity<Void> removeFriend(Authentication auth, @PathVariable String username) {
        friendshipService.removeFriendship(auth.getName(), username);
        return ResponseEntity.ok().build();
    }


}
