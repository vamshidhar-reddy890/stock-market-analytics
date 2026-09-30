package com.stockanalytics.spring_boot_project.repository;

import com.stockanalytics.spring_boot_project.entity.User;
import com.stockanalytics.spring_boot_project.entity.Watchlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WatchlistRepository extends JpaRepository<Watchlist, Long> {
    List<Watchlist> findByUserOrderByCreatedAtDesc(User user);
    Optional<Watchlist> findByUserAndStockSymbol(User user, String stockSymbol);
    boolean existsByUserAndStockSymbol(User user, String stockSymbol);
    void deleteByUserAndStockSymbol(User user, String stockSymbol);
}
