package com.fitconnect.repository;


import com.fitconnect.entity.Friendship;
import com.fitconnect.entity.FriendshipStatus;
import com.fitconnect.entity.User;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;


public interface FriendshipRepository extends JpaRepository<Friendship, Long> {

    List<Friendship> findByAddresseeAndStatus(User addressee, FriendshipStatus status);

    @Query("""
    SELECT f FROM Friendship f
    WHERE ((f.requester = :user1 AND f.addressee = :user2)
       OR (f.requester = :user2 AND f.addressee = :user1))
       AND f.status = 'ACCEPTED'
    """)
    List<Friendship> findFriendshipsBetween(@Param("user1") User u1, @Param("user2") User u2);
    

    @Query("""
        SELECT f.addressee FROM Friendship f
        WHERE f.requester = :user AND f.status = 'ACCEPTED'
        UNION
        SELECT f.requester FROM Friendship f
        WHERE f.addressee = :user AND f.status = 'ACCEPTED'
    """)
    List<User> findAllFriendsOf(@Param("user") User user);
}
