package com.fitconnect.controller;

import com.fitconnect.dto.ChatMessageRequest;
import com.fitconnect.dto.ChatPreviewDTO;
import com.fitconnect.entity.Message;
import com.fitconnect.entity.User;
import com.fitconnect.repository.MessageRepository;
import com.fitconnect.repository.UserRepository;
import com.fitconnect.service.FeedSseService;
import com.fitconnect.service.FriendshipService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/messages")
public class MessageController {

    private final MessageRepository messageRepo;
    private final UserRepository userRepo;
    private final FriendshipService friendshipService;
    private final FeedSseService feedSseService;
   
    public MessageController(MessageRepository messageRepo, UserRepository userRepo, FriendshipService friendshipService,FeedSseService feedSseService) {
        this.messageRepo = messageRepo;
        this.userRepo = userRepo;
        this.friendshipService = friendshipService;
        this.feedSseService = feedSseService;
    }

    @PostMapping
    public ResponseEntity<?> sendMessage(@RequestBody ChatMessageRequest req, Authentication auth) {
        String senderUsername = auth.getName();
        if (!friendshipService.areFriends(senderUsername, req.recipient)) {
            return ResponseEntity.status(403).body("Nur Freunde dürfen sich schreiben.");
        }

        User sender = userRepo.findById(senderUsername).orElseThrow();
        User recipient = userRepo.findById(req.recipient).orElseThrow();
        Message message = new Message(sender, recipient, req.text);
        messageRepo.save(message);

        feedSseService.broadcastMessage(req.recipient, senderUsername);
        
        // SSE push später in Sprint 13.4
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{with}")
    public ResponseEntity<List<Message>> getConversation(@PathVariable String with, Authentication auth) {
        String currentUser = auth.getName();
        if (!friendshipService.areFriends(currentUser, with)) {
            return ResponseEntity.status(403).build();
        }

        User u1 = userRepo.findById(currentUser).orElseThrow();
        User u2 = userRepo.findById(with).orElseThrow();
        return ResponseEntity.ok(messageRepo.getConversation(u1, u2));
    }


    @GetMapping("/overview")
    public ResponseEntity<List<ChatPreviewDTO>> getChatOverview(Authentication auth) {
        String currentUser = auth.getName();
        List<Object[]> raw = messageRepo.findChatOverviews(currentUser);

        List<ChatPreviewDTO> result = raw.stream()
            .map(row -> new ChatPreviewDTO(
                (String) row[0],
                (String) row[1],
                ((java.sql.Timestamp) row[2]).toLocalDateTime()
            ))
            .toList();

        return ResponseEntity.ok(result);
    }
}
