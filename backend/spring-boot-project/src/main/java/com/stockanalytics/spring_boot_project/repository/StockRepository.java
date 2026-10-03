package com.stockanalytics.spring_boot_project.repository;

import com.stockanalytics.spring_boot_project.entity.Stock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StockRepository extends JpaRepository<Stock, Long> {

    Optional<Stock> findFirstBySymbolOrderByIdDesc(String symbol);

    List<Stock> findAllBySymbol(String symbol);

    Optional<Stock> findBySymbol(String symbol);
}