package com.fitconnect.repository;

import com.fitconnect.entity.Group;
import com.fitconnect.entity.GroupMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GroupMessageRepository extends JpaRepository<GroupMessage, Long> {
    List<GroupMessage> findByGroupOrderByTimestampAsc(Group group);
}
