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
}
