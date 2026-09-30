package com.stockanalytics.spring_boot_project.controller;

import com.stockanalytics.spring_boot_project.dto.HoldingRequest;
import com.stockanalytics.spring_boot_project.dto.PortfolioResponse;
import com.stockanalytics.spring_boot_project.entity.User;
import com.stockanalytics.spring_boot_project.repository.UserRepository;
import com.stockanalytics.spring_boot_project.service.PortfolioService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/portfolios")
@CrossOrigin(origins = {"http://localhost:5173", "https://YOUR-FRONTEND-NAME.onrender.com"})
public class PortfolioController {

    private final PortfolioService portfolioService;
    private final UserRepository userRepository;

    public PortfolioController(PortfolioService portfolioService, UserRepository userRepository) {
        this.portfolioService = portfolioService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("Unauthorized request - no authenticated user found");
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    @GetMapping
    public ResponseEntity<?> getPortfolio(Authentication authentication) {
        try {
            User user = getAuthenticatedUser(authentication);
            PortfolioResponse response = portfolioService.getPortfolioResponse(user);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/holdings")
    public ResponseEntity<?> addHolding(
            Authentication authentication,
            @RequestBody HoldingRequest request) {
        try {
            User user = getAuthenticatedUser(authentication);
            PortfolioResponse response = portfolioService.addHolding(user, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/holdings/{holdingId}")
    public ResponseEntity<?> deleteHolding(
            Authentication authentication,
            @PathVariable Long holdingId) {
        try {
            User user = getAuthenticatedUser(authentication);
            PortfolioResponse response = portfolioService.deleteHolding(user, holdingId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/sell")
    public ResponseEntity<?> sellHolding(
            Authentication authentication,
            @RequestBody com.stockanalytics.spring_boot_project.dto.SellHoldingRequest request) {
        try {
            User user = getAuthenticatedUser(authentication);
            PortfolioResponse response = portfolioService.sellHolding(user, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/transactions")
    public ResponseEntity<?> getTransactions(Authentication authentication) {
        try {
            User user = getAuthenticatedUser(authentication);
            return ResponseEntity.ok(portfolioService.getTransactions(user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
