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

    private final FeedSseService feedSseService;

    public FriendshipService(FriendshipRepository friendshipRepo, UserRepository userRepo, FeedSseService feedSseService) {
        this.friendshipRepo = friendshipRepo;
        this.userRepo = userRepo;
        this.feedSseService = feedSseService;
    }

    public void sendRequest(String requesterUsername, String addresseeUsername) {
        if (requesterUsername.equals(addresseeUsername)) {
            throw new IllegalArgumentException("Du kannst dich nicht selbst hinzufügen.");
        }
    
        // Alphabetische Sortierung: requester = min(a, b), addressee = max(a, b)
        String user1 = requesterUsername.compareTo(addresseeUsername) < 0 ? requesterUsername : addresseeUsername;
        String user2 = requesterUsername.compareTo(addresseeUsername) < 0 ? addresseeUsername : requesterUsername;
    
        User requester = userRepo.findById(user1).orElseThrow();
        User addressee = userRepo.findById(user2).orElseThrow();
    
        if (!friendshipRepo.findFriendshipsBetween(requester, addressee).isEmpty()) {
            throw new IllegalStateException("Freundschaft existiert bereits.");
        }
    
        friendshipRepo.save(new Friendship(requester, addressee, FriendshipStatus.PENDING));
        feedSseService.broadcastFriendRequest(addresseeUsername); // original Ziel-Benutzer
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
        return !friendshipRepo.findFriendshipsBetween(u1, u2).isEmpty();
    }


    public String getFriendshipStatus(String currentUser, String otherUser) {
        if (currentUser.equals(otherUser)) {
            return "SELF";
        }
    
        User requester = userRepo.findById(currentUser).orElse(null);
        User addressee = userRepo.findById(otherUser).orElse(null);
        if (requester == null || addressee == null) return "UNKNOWN";
    
        List<Friendship> friendships = friendshipRepo.findFriendshipsBetween(requester, addressee);
        if (friendships.isEmpty()) return "NONE";
    
        // Nimm einfach den ersten Status (ggf. erweitern mit Prioritätslogik)
        return friendships.get(0).getStatus().name();
    }
}

