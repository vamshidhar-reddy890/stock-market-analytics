package com.stockanalytics.spring_boot_project.controller;

import com.stockanalytics.spring_boot_project.dto.PredictionResponse;
import com.stockanalytics.spring_boot_project.service.PredictionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/predictions")
@CrossOrigin(origins = {"http://localhost:5173", "https://YOUR-FRONTEND-NAME.onrender.com"})
public class PredictionController {

    private final PredictionService predictionService;

    public PredictionController(PredictionService predictionService) {
        this.predictionService = predictionService;
    }

    @GetMapping("/{symbol}")
    public ResponseEntity<PredictionResponse> getPrediction(@PathVariable String symbol) {
        PredictionResponse prediction = predictionService.predictStock(symbol);
        return ResponseEntity.ok(prediction);
    }

    @GetMapping("/{symbol}/models")
    public ResponseEntity<List<PredictionResponse.ModelEvaluation>> getModelComparisons(@PathVariable String symbol) {
        PredictionResponse prediction = predictionService.predictStock(symbol);
        return ResponseEntity.ok(prediction.getModels());
    }
}
