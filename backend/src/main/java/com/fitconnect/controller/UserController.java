package com.fitconnect.controller;



import com.fitconnect.entity.User;
import com.fitconnect.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/search")
    public ResponseEntity<List<User>> searchUsers(@RequestParam String query) {
        var result = userRepository.findByUsernameContainingIgnoreCase(query);
        return ResponseEntity.ok(result);
    }
}
