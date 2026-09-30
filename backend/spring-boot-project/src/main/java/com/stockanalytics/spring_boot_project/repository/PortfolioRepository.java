package com.stockanalytics.spring_boot_project.repository;

import com.stockanalytics.spring_boot_project.entity.Portfolio;
import com.stockanalytics.spring_boot_project.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {

    List<Portfolio> findByUser(User user);

    Optional<Portfolio> findByIdAndUser(Long id, User user);
}