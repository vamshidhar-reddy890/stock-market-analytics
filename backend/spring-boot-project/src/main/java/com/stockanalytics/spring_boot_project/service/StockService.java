package com.stockanalytics.spring_boot_project.service;

import com.stockanalytics.spring_boot_project.entity.Stock;
import com.stockanalytics.spring_boot_project.repository.StockRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StockService {

    private final StockRepository stockRepository;

    public StockService(StockRepository stockRepository) {
        this.stockRepository = stockRepository;
    }

    public Stock saveStock(Stock stock) {
        return stockRepository.save(stock);
    }

    public List<Stock> getAllStocks() {
        return stockRepository.findAll();
    }

    public Optional<Stock> getStockById(Long id) {
        return stockRepository.findById(id);
    }

    public void deleteStock(Long id) {
        stockRepository.deleteById(id);
    }

    public List<Stock> searchStocks(String query) {
        // Search by symbol or company name containing the query
        return stockRepository.findAll().stream()
                .filter(stock -> stock.getSymbol().toLowerCase().contains(query.toLowerCase()) ||
                        stock.getCompanyName() != null && stock.getCompanyName().toLowerCase().contains(query.toLowerCase()))
                .toList();
    }
}