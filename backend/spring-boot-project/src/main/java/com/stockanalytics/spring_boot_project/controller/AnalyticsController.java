package com.stockanalytics.spring_boot_project.controller;

import com.stockanalytics.spring_boot_project.dto.RiskMetricsDto;
import com.stockanalytics.spring_boot_project.dto.TechnicalIndicatorDto;
import com.stockanalytics.spring_boot_project.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = {"http://localhost:5173", "https://YOUR-FRONTEND-NAME.onrender.com"})
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/indicators/{symbol}")
    public ResponseEntity<List<TechnicalIndicatorDto>> getIndicators(@PathVariable String symbol) {
        List<TechnicalIndicatorDto> indicators = analyticsService.getTechnicalIndicators(symbol);
        return ResponseEntity.ok(indicators);
    }

    @GetMapping("/risk/{symbol}")
    public ResponseEntity<RiskMetricsDto> getRiskMetrics(@PathVariable String symbol) {
        RiskMetricsDto risk = analyticsService.getRiskMetrics(symbol);
        return ResponseEntity.ok(risk);
    }
}
