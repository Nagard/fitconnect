package com.fitconnect.repository;

import com.fitconnect.entity.User;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, String> {

    List<User> findByUsernameContainingIgnoreCase(String query);

}