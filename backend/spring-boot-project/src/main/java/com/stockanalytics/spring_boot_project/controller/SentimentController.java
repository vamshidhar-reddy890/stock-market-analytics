package com.stockanalytics.spring_boot_project.controller;

import com.stockanalytics.spring_boot_project.dto.SentimentResponse;
import com.stockanalytics.spring_boot_project.service.SentimentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sentiment")
@CrossOrigin(origins = {"http://localhost:5173", "https://YOUR-FRONTEND-NAME.onrender.com"})
public class SentimentController {

    private final SentimentService sentimentService;

    public SentimentController(SentimentService sentimentService) {
        this.sentimentService = sentimentService;
    }

    @GetMapping("/{symbol}")
    public ResponseEntity<SentimentResponse> getSentiment(@PathVariable String symbol) {
        SentimentResponse sentiment = sentimentService.getSentiment(symbol);
        return ResponseEntity.ok(sentiment);
    }
}
