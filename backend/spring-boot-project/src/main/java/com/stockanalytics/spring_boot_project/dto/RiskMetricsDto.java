package com.stockanalytics.spring_boot_project.dto;

public class RiskMetricsDto {

    private String symbol;
    private Double volatility;
    private Double sharpeRatio;
    private Double beta;
    private Double maxDrawdown;
    private Double expectedReturn;

    public RiskMetricsDto() {
    }

    public RiskMetricsDto(String symbol, Double volatility, Double sharpeRatio, Double beta, Double maxDrawdown, Double expectedReturn) {
        this.symbol = symbol;
        this.volatility = volatility;
        this.sharpeRatio = sharpeRatio;
        this.beta = beta;
        this.maxDrawdown = maxDrawdown;
        this.expectedReturn = expectedReturn;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public Double getVolatility() {
        return volatility;
    }

    public void setVolatility(Double volatility) {
        this.volatility = volatility;
    }

    public Double getSharpeRatio() {
        return sharpeRatio;
    }

    public void setSharpeRatio(Double sharpeRatio) {
        this.sharpeRatio = sharpeRatio;
    }

    public Double getBeta() {
        return beta;
    }

    public void setBeta(Double beta) {
        this.beta = beta;
    }

    public Double getMaxDrawdown() {
        return maxDrawdown;
    }

    public void setMaxDrawdown(Double maxDrawdown) {
        this.maxDrawdown = maxDrawdown;
    }

    public Double getExpectedReturn() {
        return expectedReturn;
    }

    public void setExpectedReturn(Double expectedReturn) {
        this.expectedReturn = expectedReturn;
    }
}
