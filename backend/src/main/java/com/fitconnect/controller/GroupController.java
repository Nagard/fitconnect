package com.fitconnect.controller;


import com.fitconnect.entity.Group;
import com.fitconnect.entity.GroupParticipant;
import com.fitconnect.entity.User;
import com.fitconnect.repository.GroupParticipantRepository;
import com.fitconnect.repository.GroupRepository;
import com.fitconnect.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/groups")
public class GroupController {

    private final GroupRepository groupRepo;
    private final UserRepository userRepo;
    private final GroupParticipantRepository participantRepo;

    public GroupController(GroupRepository groupRepo, UserRepository userRepo, GroupParticipantRepository participantRepo) {
        this.groupRepo = groupRepo;
        this.userRepo = userRepo;
        this.participantRepo = participantRepo;
    }

    @PostMapping
    public ResponseEntity<Group> createGroup(@RequestParam String name, Authentication auth) {
        Group group = new Group();
        group.setName(name);
        group.setCreatedBy(auth.getName());
        groupRepo.save(group);

        User creator = userRepo.findById(auth.getName()).orElseThrow();
        participantRepo.save(new GroupParticipant(group, creator, GroupParticipant.Role.ADMIN));

        return ResponseEntity.ok(group);
    }

    @PostMapping("/{id}/invite")
    public ResponseEntity<?> inviteToGroup(
            @PathVariable Long id,
            @RequestParam String friendUsername,
            Authentication auth) {

        String currentUser = auth.getName();

        // ✅ Nur Admins dürfen einladen
        boolean isAdmin = participantRepo
            .findByGroupIdAndUserUsername(id, currentUser)
            .map(p -> p.getRole() == GroupParticipant.Role.ADMIN)
            .orElse(false);

        if (!isAdmin) {
            return ResponseEntity.status(403).body("Nur Admins dürfen Mitglieder einladen.");
        }

        // ⛔ Bereits Mitglied?
        if (participantRepo.existsByGroupIdAndUserUsername(id, friendUsername)) {
            return ResponseEntity.ok("Schon Mitglied.");
        }

        Group group = groupRepo.findById(id).orElseThrow();
        User friend = userRepo.findById(friendUsername).orElseThrow();

        participantRepo.save(new GroupParticipant(group, friend, GroupParticipant.Role.MEMBER));
        return ResponseEntity.ok().build();
    }
    @GetMapping
    public ResponseEntity<List<Group>> myGroups(Authentication auth) {
        List<GroupParticipant> participation = participantRepo.findByUserUsername(auth.getName());
        List<Group> result = participation.stream()
            .map(GroupParticipant::getGroup)
            .toList();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<User>> getGroupMembers(@PathVariable Long id, Authentication auth) {
        String currentUser = auth.getName();
        boolean isMember = participantRepo.existsByGroupIdAndUserUsername(id, currentUser);
        if (!isMember) return ResponseEntity.status(403).build();

        return ResponseEntity.ok(participantRepo.findUsersByGroupId(id));
    }


    @GetMapping("/{id}")
    public ResponseEntity<Group> getGroup(@PathVariable Long id, Authentication auth) {
        String currentUser = auth.getName();
        boolean isMember = participantRepo.existsByGroupIdAndUserUsername(id, currentUser);
        if (!isMember) return ResponseEntity.status(403).build();

        return ResponseEntity.of(groupRepo.findById(id));
    }

    @GetMapping("/{id}/is-admin")
    public ResponseEntity<Boolean> isCurrentUserAdmin(@PathVariable Long id, Authentication auth) {
        String currentUser = auth.getName();
        return ResponseEntity.ok(
            participantRepo.findByGroupIdAndUserUsername(id, currentUser)
                .map(p -> p.getRole() == GroupParticipant.Role.ADMIN)
                .orElse(false)
        );
    }

    @DeleteMapping("/{groupId}/members/{username}")
    public ResponseEntity<?> removeMember(
            @PathVariable Long groupId,
            @PathVariable String username,
            Authentication auth) {

        String currentUser = auth.getName();

        // Admin prüfen
        boolean isAdmin = participantRepo
            .findByGroupIdAndUserUsername(groupId, currentUser)
            .map(p -> p.getRole() == GroupParticipant.Role.ADMIN)
            .orElse(false);

        if (!isAdmin) {
            return ResponseEntity.status(403).body("Nur Admins dürfen Mitglieder entfernen.");
        }

        // Admin darf sich selbst nicht löschen (optional)
        if (currentUser.equals(username)) {
            return ResponseEntity.badRequest().body("Du kannst dich nicht selbst entfernen.");
        }

        // Mitglied suchen und löschen
        participantRepo.findByGroupIdAndUserUsername(groupId, username)
            .ifPresent(participantRepo::delete);

        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{groupId}")
    public ResponseEntity<?> deleteGroup(@PathVariable Long groupId, Authentication auth) {
        String currentUser = auth.getName();
    
        // Prüfen ob Admin der Gruppe
        boolean isAdmin = participantRepo
            .findByGroupIdAndUserUsername(groupId, currentUser)
            .map(p -> p.getRole() == GroupParticipant.Role.ADMIN)
            .orElse(false);
    
        if (!isAdmin) {
            return ResponseEntity.status(403).body("Nur Admins dürfen Gruppen löschen.");
        }
    
        groupRepo.deleteById(groupId);
        return ResponseEntity.ok().build();
    }

}
