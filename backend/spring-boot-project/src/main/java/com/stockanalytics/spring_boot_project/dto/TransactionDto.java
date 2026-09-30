package com.stockanalytics.spring_boot_project.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TransactionDto {

    private Long id;
    private String stockSymbol;
    private String transactionType; // BUY or SELL
    private BigDecimal quantity;
    private BigDecimal price;
    private BigDecimal totalValue;
    private LocalDateTime transactionDate;

    public TransactionDto() {
    }

    public TransactionDto(Long id, String stockSymbol, String transactionType,
                          BigDecimal quantity, BigDecimal price, BigDecimal totalValue,
                          LocalDateTime transactionDate) {
        this.id = id;
        this.stockSymbol = stockSymbol;
        this.transactionType = transactionType;
        this.quantity = quantity;
        this.price = price;
        this.totalValue = totalValue;
        this.transactionDate = transactionDate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStockSymbol() {
        return stockSymbol;
    }

    public void setStockSymbol(String stockSymbol) {
        this.stockSymbol = stockSymbol;
    }

    public String getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(String transactionType) {
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
