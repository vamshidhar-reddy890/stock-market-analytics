package com.stockanalytics.spring_boot_project.controller;

import com.stockanalytics.spring_boot_project.entity.User;
import com.stockanalytics.spring_boot_project.security.JwtService;
import com.stockanalytics.spring_boot_project.service.AuthService;
import com.stockanalytics.spring_boot_project.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "https://YOUR-FRONTEND-NAME.onrender.com"})
public class AuthController {

    private final UserService userService;
    private final AuthService authService;
    private final JwtService jwtService;

    public AuthController(
            UserService userService,
            AuthService authService,
            JwtService jwtService) {

        this.userService = userService;
        this.authService = authService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {

        try {
            User savedUser = userService.registerUser(user);

            savedUser.setPassword(null);

            // Generate JWT token directly (don't call login as password is already hashed)
            String token = jwtService.generateToken(savedUser.getEmail());

            RegisterResponse response = new RegisterResponse(
                    token,
                    savedUser
            );

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request) {

        try {
            User user = authService.authenticate(
                    request.getEmail(),
                    request.getPassword()
            );

            String token = jwtService.generateToken(user.getEmail());

            return ResponseEntity.ok(
                    new LoginResponse(token, user.getName(), user.getEmail())
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    public static class LoginRequest {

        private String email;
        private String password;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    public static class LoginResponse {

        private String token;
        private String name;
        private String email;

        public LoginResponse(String token) {
            this.token = token;
        }

        public LoginResponse(String token, String name, String email) {
            this.token = token;
            this.name = name;
            this.email = email;
        }

        public String getToken() {
            return token;
        }

        public String getName() {
            return name;
        }

        public String getEmail() {
            return email;
        }
    }

    public static class RegisterResponse {

        private String token;
        private User user;

        public RegisterResponse(String token, User user) {
            this.token = token;
            this.user = user;
        }

        public String getToken() {
            return token;
        }

        public User getUser() {
            return user;
        }
    }
}