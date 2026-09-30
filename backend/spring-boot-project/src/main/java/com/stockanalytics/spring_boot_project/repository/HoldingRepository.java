package com.stockanalytics.spring_boot_project.repository;

import com.stockanalytics.spring_boot_project.entity.Holding;
import com.stockanalytics.spring_boot_project.entity.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HoldingRepository extends JpaRepository<Holding, Long> {

    List<Holding> findByPortfolio(Portfolio portfolio);

    Optional<Holding> findByPortfolioAndSymbol(Portfolio portfolio, String symbol);

    Optional<Holding> findByIdAndPortfolio(Long id, Portfolio portfolio);
}
