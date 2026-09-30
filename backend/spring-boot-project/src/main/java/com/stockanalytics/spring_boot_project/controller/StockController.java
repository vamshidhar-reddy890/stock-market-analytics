package com.stockanalytics.spring_boot_project.controller;

import com.stockanalytics.spring_boot_project.dto.HistoricalPointDto;
import com.stockanalytics.spring_boot_project.entity.Stock;
import com.stockanalytics.spring_boot_project.service.StockService;
import com.stockanalytics.spring_boot_project.service.TwelveDataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stocks")
@CrossOrigin(origins = {"http://localhost:5173", "https://YOUR-FRONTEND-NAME.onrender.com"})
public class StockController {

    private final StockService stockService;
    private final TwelveDataService twelveDataService;

    public StockController(StockService stockService, TwelveDataService twelveDataService) {
        this.stockService = stockService;
        this.twelveDataService = twelveDataService;
    }

    @PostMapping
    public Stock createStock(@RequestBody Stock stock) {
        return stockService.saveStock(stock);
    }

    @GetMapping
    public List<Stock> getAllStocks() {
        return stockService.getAllStocks();
    }

    /**
     * Fetch live/current quote for a stock symbol from Twelve Data API
     */
    @GetMapping("/live/{symbol}")
    public ResponseEntity<?> getLiveStock(@PathVariable String symbol) {
        Stock stock = twelveDataService.getStockQuote(symbol.toUpperCase());
        if (stock == null) {
            return ResponseEntity.status(504).body("Unable to fetch live data for symbol: " + symbol);
        }
        return ResponseEntity.ok(stock);
    }

    /**
     * Get stock details (quote + metadata) by symbol
     */
    @GetMapping("/details/{symbol}")
    public ResponseEntity<?> getStockDetails(@PathVariable String symbol) {
        Stock stock = twelveDataService.getStockQuote(symbol.toUpperCase());
        if (stock == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(stock);
    }

    /**
     * Get historical chart time series for a stock symbol
     */
    @GetMapping("/{symbol}/historical")
    public ResponseEntity<List<HistoricalPointDto>> getHistoricalData(
            @PathVariable String symbol,
            @RequestParam(defaultValue = "1D") String timeframe) {
        List<HistoricalPointDto> history = twelveDataService.getHistoricalData(symbol.toUpperCase(), timeframe);
        return ResponseEntity.ok(history);
    }

    /**
     * Search for stocks by symbol or company name
     */
    @GetMapping("/search")
    public List<Stock> searchStocks(
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "query", required = false) String query) {
        String searchTerm = (q != null && !q.trim().isEmpty()) ? q : query;
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return stockService.getAllStocks();
        }
        return stockService.searchStocks(searchTerm.trim());
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<Stock> getStockById(@PathVariable Long id) {
        return stockService.getStockById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/id/{id}")
    public ResponseEntity<Void> deleteStock(@PathVariable Long id) {
        stockService.deleteStock(id);
        return ResponseEntity.noContent().build();
    }
}