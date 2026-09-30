package com.stockanalytics.spring_boot_project.controller;

import com.stockanalytics.spring_boot_project.dto.WatchlistItemDto;
import com.stockanalytics.spring_boot_project.entity.User;
import com.stockanalytics.spring_boot_project.repository.UserRepository;
import com.stockanalytics.spring_boot_project.service.WatchlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/watchlist")
@CrossOrigin(origins = {"http://localhost:5173", "https://YOUR-FRONTEND-NAME.onrender.com"})
public class WatchlistController {

    private final WatchlistService watchlistService;
    private final UserRepository userRepository;

    public WatchlistController(WatchlistService watchlistService, UserRepository userRepository) {
        this.watchlistService = watchlistService;
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
    public ResponseEntity<?> getWatchlist(Authentication authentication) {
        try {
            User user = getAuthenticatedUser(authentication);
            List<WatchlistItemDto> list = watchlistService.getWatchlist(user);
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> addToWatchlist(
            Authentication authentication,
            @RequestBody Map<String, String> body) {
        try {
            User user = getAuthenticatedUser(authentication);
            String symbol = body.get("symbol");
            List<WatchlistItemDto> list = watchlistService.addToWatchlist(user, symbol);
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{symbol}")
    public ResponseEntity<?> removeFromWatchlist(
            Authentication authentication,
            @PathVariable String symbol) {
        try {
            User user = getAuthenticatedUser(authentication);
            List<WatchlistItemDto> list = watchlistService.removeFromWatchlist(user, symbol);
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/check/{symbol}")
    public ResponseEntity<?> checkInWatchlist(
            Authentication authentication,
            @PathVariable String symbol) {
        try {
            User user = getAuthenticatedUser(authentication);
            boolean inList = watchlistService.isInWatchlist(user, symbol);
            return ResponseEntity.ok(Collections.singletonMap("inWatchlist", inList));
        } catch (Exception e) {
            return ResponseEntity.ok(Collections.singletonMap("inWatchlist", false));
        }
    }
}
