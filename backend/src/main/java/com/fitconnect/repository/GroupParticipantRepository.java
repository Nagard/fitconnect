package com.fitconnect.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.fitconnect.entity.GroupParticipant;
import com.fitconnect.entity.User;

public interface GroupParticipantRepository extends JpaRepository<GroupParticipant, Long> {
   
    List<GroupParticipant> findByUserUsername(String username);
   
    boolean existsByGroupIdAndUserUsername(Long groupId, String username);


    @Query("SELECT gp.user FROM GroupParticipant gp WHERE gp.group.id = :groupId")
    List<User> findUsersByGroupId(@Param("groupId") Long groupId);

    Optional<GroupParticipant> findByGroupIdAndUserUsername(Long groupId, String username);
    
}