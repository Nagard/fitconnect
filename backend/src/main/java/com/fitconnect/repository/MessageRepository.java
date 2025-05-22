package com.fitconnect.repository;

import com.fitconnect.entity.Message;
import com.fitconnect.entity.User;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("""
        SELECT m FROM Message m
        WHERE (m.sender = :user1 AND m.recipient = :user2)
           OR (m.sender = :user2 AND m.recipient = :user1)
        ORDER BY m.timestamp ASC
    """)
    List<Message> getConversation(@Param("user1") User a, @Param("user2") User b);


    @Query(value = """
    SELECT DISTINCT ON (LEAST(m.sender_username, m.recipient_username), GREATEST(m.sender_username, m.recipient_username))
           CASE WHEN m.sender_username = :current THEN m.recipient_username ELSE m.sender_username END as username,
           m.text as last_message,
           m.timestamp
    FROM message m
    WHERE m.sender_username = :current OR m.recipient_username = :current
    ORDER BY LEAST(m.sender_username, m.recipient_username),
             GREATEST(m.sender_username, m.recipient_username),
             m.timestamp DESC
""", nativeQuery = true)
List<Object[]> findChatOverviews(@Param("current") String currentUser);
}
