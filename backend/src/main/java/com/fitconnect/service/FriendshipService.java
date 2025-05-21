package com.fitconnect.service;

import com.fitconnect.entity.*;
import com.fitconnect.repository.FriendshipRepository;
import com.fitconnect.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FriendshipService {

    private final FriendshipRepository friendshipRepo;
    private final UserRepository userRepo;

    public FriendshipService(FriendshipRepository friendshipRepo, UserRepository userRepo) {
        this.friendshipRepo = friendshipRepo;
        this.userRepo = userRepo;
    }

    public void sendRequest(String requesterUsername, String addresseeUsername) {
        User requester = userRepo.findById(requesterUsername).orElseThrow();
        User addressee = userRepo.findById(addresseeUsername).orElseThrow();

        if (requester.equals(addressee)) throw new IllegalArgumentException("Du kannst dich nicht selbst hinzufügen.");

        friendshipRepo.findFriendshipBetween(requester, addressee)
            .ifPresent(f -> { throw new IllegalStateException("Freundschaft existiert oder war bereits abgelehnt."); });

        friendshipRepo.save(new Friendship(requester, addressee, FriendshipStatus.PENDING));
    }

    public void respondToRequest(Long requestId, boolean accept) {
        Friendship f = friendshipRepo.findById(requestId).orElseThrow();
        f.setStatus(accept ? FriendshipStatus.ACCEPTED : FriendshipStatus.REJECTED);
        friendshipRepo.save(f);
    }

    public List<User> listFriends(String username) {
        User user = userRepo.findById(username).orElseThrow();
        return friendshipRepo.findAllFriendsOf(user);
    }

    public List<Friendship> listPendingRequests(String username) {
        User user = userRepo.findById(username).orElseThrow();
        return friendshipRepo.findByAddresseeAndStatus(user, FriendshipStatus.PENDING);
    }

    public boolean areFriends(String userA, String userB) {
        User u1 = userRepo.findById(userA).orElseThrow();
        User u2 = userRepo.findById(userB).orElseThrow();
        return friendshipRepo.findFriendshipBetween(u1, u2).isPresent();
    }
}

