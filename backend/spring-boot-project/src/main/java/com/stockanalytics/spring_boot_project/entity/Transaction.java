package com.stockanalytics.spring_boot_project.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
public class Transaction {

    public enum TransactionType {
        BUY,
        SELL
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false)
    private Portfolio portfolio;

    @Column(name = "stock_symbol", nullable = false)
    private String stockSymbol;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false)
    private TransactionType transactionType;

    @Column(precision = 18, scale = 6, nullable = false)
    private BigDecimal quantity;

    @Column(precision = 18, scale = 6, nullable = false)
    private BigDecimal price;

    @Column(name = "total_value", precision = 18, scale = 6, nullable = false)
    private BigDecimal totalValue;

    @Column(name = "transaction_date")
    private LocalDateTime transactionDate;

    public Transaction() {
    }

    public Transaction(Portfolio portfolio, String stockSymbol, TransactionType transactionType,
                       BigDecimal quantity, BigDecimal price, BigDecimal totalValue) {
        this.portfolio = portfolio;
        this.stockSymbol = stockSymbol;
        this.transactionType = transactionType;
        this.quantity = quantity;
        this.price = price;
        this.totalValue = totalValue;
        this.transactionDate = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (this.transactionDate == null) {
            this.transactionDate = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public Portfolio getPortfolio() {
        return portfolio;
    }

    public void setPortfolio(Portfolio portfolio) {
        this.portfolio = portfolio;
    }

    public String getStockSymbol() {
        return stockSymbol;
    }

    public void setStockSymbol(String stockSymbol) {
        this.stockSymbol = stockSymbol;
    }

    public TransactionType getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(TransactionType transactionType) {
        this.transactionType = transactionType;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public BigDecimal getTotalValue() {
        return totalValue;
    }

    public void setTotalValue(BigDecimal totalValue) {
        this.totalValue = totalValue;
    }

    public LocalDateTime getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(LocalDateTime transactionDate) {
        this.transactionDate = transactionDate;
    }
}
