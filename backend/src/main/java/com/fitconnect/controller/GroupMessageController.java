package com.fitconnect.controller;

import com.fitconnect.entity.Group;
import com.fitconnect.entity.GroupMessage;
import com.fitconnect.entity.User;
import com.fitconnect.repository.GroupMessageRepository;
import com.fitconnect.repository.GroupParticipantRepository;
import com.fitconnect.repository.GroupRepository;
import com.fitconnect.repository.UserRepository;
import com.fitconnect.service.FeedSseService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/group-messages")
public class GroupMessageController {

    private final GroupRepository groupRepo;
    private final GroupParticipantRepository participantRepo;
    private final GroupMessageRepository messageRepo;
    private final UserRepository userRepo;
    private final FeedSseService feedSseService;

    public GroupMessageController(GroupRepository groupRepo, GroupParticipantRepository participantRepo,
                                  GroupMessageRepository messageRepo, UserRepository userRepo, FeedSseService feedSseService) {
        this.groupRepo = groupRepo;
        this.participantRepo = participantRepo;
        this.messageRepo = messageRepo;
        this.userRepo = userRepo;
        this.feedSseService=feedSseService;
    }

    @PostMapping("/{groupId}")
    public ResponseEntity<?> sendMessage(@PathVariable Long groupId,
                                         @RequestParam String text,
                                         Authentication auth) {
        String sender = auth.getName();
        boolean isMember = participantRepo.existsByGroupIdAndUserUsername(groupId, sender);
        if (!isMember) return ResponseEntity.status(403).build();

        Group group = groupRepo.findById(groupId).orElseThrow();
        User user = userRepo.findById(sender).orElseThrow();

        messageRepo.save(new GroupMessage(group, user, text));
        feedSseService.broadcastGroupMessage(groupId, sender);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<List<GroupMessage>> getMessages(@PathVariable Long groupId, Authentication auth) {
        String user = auth.getName();
        boolean isMember = participantRepo.existsByGroupIdAndUserUsername(groupId, user);
        if (!isMember) return ResponseEntity.status(403).build();

        Group group = groupRepo.findById(groupId).orElseThrow();
        return ResponseEntity.ok(messageRepo.findByGroupOrderByTimestampAsc(group));
    }
}
