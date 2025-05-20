package com.fitconnect.service;

import com.fitconnect.dto.AuthRequest;
import com.fitconnect.dto.AuthResponse;
import com.fitconnect.entity.User;
import com.fitconnect.security.JwtUtil;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    private final Map<String, User> users = new HashMap<>();
    private final JwtUtil jwtUtil = new JwtUtil();
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthResponse register(AuthRequest request) {
        if (users.containsKey(request.username)) {
            throw new RuntimeException("Benutzername ist bereits vergeben");
        }
    
        String hashedPassword = encoder.encode(request.password);
        User user = new User(request.username, hashedPassword);
        users.put(request.username, user);
        String token = jwtUtil.generateToken(request.username);
        return new AuthResponse(token);
    }

public AuthResponse login(AuthRequest request) {
    User user = users.get(request.username);
    if (user == null) {
        throw new RuntimeException("Benutzer nicht gefunden");
    }

    if (!encoder.matches(request.password, user.getPassword())) {
        throw new RuntimeException("Falsches Passwort");
    }

    String token = jwtUtil.generateToken(user.getUsername());
    return new AuthResponse(token);
}

}
