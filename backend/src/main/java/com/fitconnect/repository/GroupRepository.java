package com.fitconnect.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fitconnect.entity.Group;

public interface GroupRepository extends JpaRepository<Group, Long> {
    List<Group> findByCreatedBy(String username);
}