package com.stockanalytics.spring_boot_project.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@CrossOrigin(origins = {"http://localhost:5173", "https://YOUR-FRONTEND-NAME.onrender.com"})
public class TestController {

    @GetMapping("/")
    public Map<String, String> root() {
        return Map.of(
                "status", "UP",
                "message", "Stock Market Analytics Backend is live and running on Render!"
        );
    }

    @GetMapping("/api/test/protected")
    public String protectedEndpoint() {
        return "JWT authentication successful!";
    }
}