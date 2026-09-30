package com.stockanalytics.spring_boot_project.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class PortfolioResponse {

    private Long id;
    private String name;
    private BigDecimal totalInvested = BigDecimal.ZERO;
    private BigDecimal currentValue = BigDecimal.ZERO;
    private BigDecimal totalProfitLoss = BigDecimal.ZERO;
    private BigDecimal totalProfitLossPercentage = BigDecimal.ZERO;
    private List<HoldingItem> holdings = new ArrayList<>();
    private List<TransactionDto> transactions = new ArrayList<>();

    public PortfolioResponse() {
    }

    public List<TransactionDto> getTransactions() {
        return transactions;
    }

    public void setTransactions(List<TransactionDto> transactions) {
        this.transactions = transactions;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getTotalInvested() {
        return totalInvested;
    }

    public void setTotalInvested(BigDecimal totalInvested) {
        this.totalInvested = totalInvested;
    }

    public BigDecimal getCurrentValue() {
        return currentValue;
    }

    public void setCurrentValue(BigDecimal currentValue) {
        this.currentValue = currentValue;
    }

    public BigDecimal getTotalProfitLoss() {
        return totalProfitLoss;
    }

    public void setTotalProfitLoss(BigDecimal totalProfitLoss) {
        this.totalProfitLoss = totalProfitLoss;
    }

    public BigDecimal getTotalProfitLossPercentage() {
        return totalProfitLossPercentage;
    }

    public void setTotalProfitLossPercentage(BigDecimal totalProfitLossPercentage) {
        this.totalProfitLossPercentage = totalProfitLossPercentage;
    }

    public List<HoldingItem> getHoldings() {
        return holdings;
    }

    public void setHoldings(List<HoldingItem> holdings) {
        this.holdings = holdings;
    }

    public static class HoldingItem {
        private Long id;
        private String symbol;
        private Integer quantity;
        private BigDecimal averageBuyPrice;
        private BigDecimal currentPrice;
        private BigDecimal investedAmount;
        private BigDecimal currentValue;
        private BigDecimal profitLoss;
        private BigDecimal profitLossPercentage;

        public HoldingItem() {
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getSymbol() {
            return symbol;
        }

        public void setSymbol(String symbol) {
            this.symbol = symbol;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }

        public BigDecimal getAverageBuyPrice() {
            return averageBuyPrice;
        }

        public void setAverageBuyPrice(BigDecimal averageBuyPrice) {
            this.averageBuyPrice = averageBuyPrice;
        }

        public BigDecimal getCurrentPrice() {
            return currentPrice;
        }

        public void setCurrentPrice(BigDecimal currentPrice) {
            this.currentPrice = currentPrice;
        }

        public BigDecimal getInvestedAmount() {
            return investedAmount;
        }

        public void setInvestedAmount(BigDecimal investedAmount) {
            this.investedAmount = investedAmount;
        }

        public BigDecimal getCurrentValue() {
            return currentValue;
        }

        public void setCurrentValue(BigDecimal currentValue) {
            this.currentValue = currentValue;
        }

        public BigDecimal getProfitLoss() {
            return profitLoss;
        }

        public void setProfitLoss(BigDecimal profitLoss) {
            this.profitLoss = profitLoss;
        }

        public BigDecimal getProfitLossPercentage() {
            return profitLossPercentage;
        }

        public void setProfitLossPercentage(BigDecimal profitLossPercentage) {
            this.profitLossPercentage = profitLossPercentage;
        }
    }
}
