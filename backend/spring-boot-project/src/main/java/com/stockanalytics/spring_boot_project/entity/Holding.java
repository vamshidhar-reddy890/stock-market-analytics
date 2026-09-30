
package com.stockanalytics.spring_boot_project.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "holdings")
public class Holding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Stock symbol, for example RELIANCE, TCS, INFY
    @Column(nullable = false)
    private String symbol;

    @Column(name = "stock_symbol", nullable = false)
    private String stockSymbol;

    // Number of shares owned
    @Column(nullable = false)
    private Integer quantity;

    // Average price at which the shares were purchased
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal averageBuyPrice;

    // Current market price
    @Column(precision = 15, scale = 2)
    private BigDecimal currentPrice;

    // Total amount invested
    @Column(precision = 15, scale = 2)
    private BigDecimal investedAmount;

    // Current market value
    @Column(precision = 15, scale = 2)
    private BigDecimal currentValue;

    // Profit or loss amount
    @Column(precision = 15, scale = 2)
    private BigDecimal profitLoss;

    // Profit or loss percentage
    @Column(precision = 10, scale = 2)
    private BigDecimal profitLossPercentage;

    // Many holdings belong to one portfolio
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false)
    private Portfolio portfolio;

    public Holding() {
    }

    public Holding(String symbol,
                   Integer quantity,
                   BigDecimal averageBuyPrice,
                   Portfolio portfolio) {

        this.symbol = symbol;
        this.stockSymbol = symbol;
        this.quantity = quantity;
        this.averageBuyPrice = averageBuyPrice;
        this.portfolio = portfolio;

        calculateInvestedAmount();

        this.currentPrice = averageBuyPrice;
        calculateCurrentValue();
        calculateProfitLoss();
    }

    // Calculate total invested amount
    public void calculateInvestedAmount() {

        if (quantity != null && averageBuyPrice != null) {
            investedAmount = averageBuyPrice
                    .multiply(BigDecimal.valueOf(quantity));
        }
    }

    // Calculate current market value
    public void calculateCurrentValue() {

        if (quantity != null && currentPrice != null) {
            currentValue = currentPrice
                    .multiply(BigDecimal.valueOf(quantity));
        }
    }

    // Calculate profit/loss
    public void calculateProfitLoss() {

        if (currentValue != null && investedAmount != null) {

            profitLoss = currentValue.subtract(investedAmount);

            if (investedAmount.compareTo(BigDecimal.ZERO) > 0) {

                profitLossPercentage = profitLoss
                        .divide(investedAmount, 4, java.math.RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
            }
        }
    }

    public Long getId() {
        return id;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
        this.stockSymbol = symbol;
    }

    public String getStockSymbol() {
        return stockSymbol;
    }

    public void setStockSymbol(String stockSymbol) {
        this.stockSymbol = stockSymbol;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
        calculateInvestedAmount();
        calculateCurrentValue();
        calculateProfitLoss();
    }

    public BigDecimal getAverageBuyPrice() {
        return averageBuyPrice;
    }

    public void setAverageBuyPrice(BigDecimal averageBuyPrice) {
        this.averageBuyPrice = averageBuyPrice;
        calculateInvestedAmount();
        calculateProfitLoss();
    }

    public BigDecimal getCurrentPrice() {
        return currentPrice;
    }

    public void setCurrentPrice(BigDecimal currentPrice) {
        this.currentPrice = currentPrice;
        calculateCurrentValue();
        calculateProfitLoss();
    }

    public BigDecimal getInvestedAmount() {
        return investedAmount;
    }

    public BigDecimal getCurrentValue() {
        return currentValue;
    }

    public BigDecimal getProfitLoss() {
        return profitLoss;
    }

    public BigDecimal getProfitLossPercentage() {
        return profitLossPercentage;
    }

    public Portfolio getPortfolio() {
        return portfolio;
    }

    public void setPortfolio(Portfolio portfolio) {
        this.portfolio = portfolio;
    }
}
