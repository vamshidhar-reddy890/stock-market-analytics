package com.stockanalytics.spring_boot_project.service;

import com.stockanalytics.spring_boot_project.entity.User;
import com.stockanalytics.spring_boot_project.repository.UserRepository;
import com.stockanalytics.spring_boot_project.security.JwtService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    public AuthService(
            UserRepository userRepository,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    public User authenticate(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(
                password,
                user.getPassword())) {

            throw new RuntimeException(
                    "Invalid email or password");
        }

        return user;
    }

    public String login(String email, String password) {
        User user = authenticate(email, password);
        return jwtService.generateToken(user.getEmail());
    }
}