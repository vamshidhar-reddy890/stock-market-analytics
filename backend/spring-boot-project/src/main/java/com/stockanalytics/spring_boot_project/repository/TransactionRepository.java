package com.stockanalytics.spring_boot_project.repository;

import com.stockanalytics.spring_boot_project.entity.Portfolio;
import com.stockanalytics.spring_boot_project.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByPortfolioOrderByTransactionDateDesc(Portfolio portfolio);
    List<Transaction> findByPortfolio(Portfolio portfolio);
}
