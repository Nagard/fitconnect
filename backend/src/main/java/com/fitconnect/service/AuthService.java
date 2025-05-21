package com.fitconnect.service;

import com.fitconnect.dto.AuthRequest;
import com.fitconnect.dto.AuthResponse;
import com.fitconnect.entity.User;
import com.fitconnect.repository.UserRepository;
import com.fitconnect.security.JwtUtil;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil = new JwtUtil();
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public AuthResponse register(AuthRequest request) {
        if (userRepository.existsById(request.username)) {
            throw new RuntimeException("Benutzername ist bereits vergeben");
        }

        User user = new User(request.username, encoder.encode(request.password));
        userRepository.save(user);
        String token = jwtUtil.generateToken(user.getUsername());
        return new AuthResponse(token);
    }

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findById(request.username)
                .orElseThrow(() -> new RuntimeException("Benutzer nicht gefunden"));

        if (!encoder.matches(request.password, user.getPassword())) {
            throw new RuntimeException("Falsches Passwort");
        }

        String token = jwtUtil.generateToken(user.getUsername());
        return new AuthResponse(token);
    }
}

