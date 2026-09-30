package com.stockanalytics.spring_boot_project.dto;

import java.time.LocalDateTime;

public class WatchlistItemDto {

    private Long id;
    private String symbol;
    private String companyName;
    private Double currentPrice;
    private Double openPrice;
    private Double highPrice;
    private Double lowPrice;
    private Double change;
    private Double changePercentage;
    private Long volume;
    private LocalDateTime addedAt;

    public WatchlistItemDto() {
    }

    public WatchlistItemDto(Long id, String symbol, String companyName, Double currentPrice,
                            Double openPrice, Double highPrice, Double lowPrice, Double change,
                            Double changePercentage, Long volume, LocalDateTime addedAt) {
        this.id = id;
        this.symbol = symbol;
        this.companyName = companyName;
        this.currentPrice = currentPrice;
        this.openPrice = openPrice;
        this.highPrice = highPrice;
        this.lowPrice = lowPrice;
        this.change = change;
        this.changePercentage = changePercentage;
        this.volume = volume;
        this.addedAt = addedAt;
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

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public Double getCurrentPrice() {
        return currentPrice;
    }

    public void setCurrentPrice(Double currentPrice) {
        this.currentPrice = currentPrice;
    }

    public Double getOpenPrice() {
        return openPrice;
    }

    public void setOpenPrice(Double openPrice) {
        this.openPrice = openPrice;
    }

    public Double getHighPrice() {
        return highPrice;
    }

    public void setHighPrice(Double highPrice) {
        this.highPrice = highPrice;
    }

    public Double getLowPrice() {
        return lowPrice;
    }

    public void setLowPrice(Double lowPrice) {
        this.lowPrice = lowPrice;
    }

    public Double getChange() {
        return change;
    }

    public void setChange(Double change) {
        this.change = change;
    }

    public Double getChangePercentage() {
        return changePercentage;
    }

    public void setChangePercentage(Double changePercentage) {
        this.changePercentage = changePercentage;
    }

    public Long getVolume() {
        return volume;
    }

    public void setVolume(Long volume) {
        this.volume = volume;
    }

    public LocalDateTime getAddedAt() {
        return addedAt;
    }

    public void setAddedAt(LocalDateTime addedAt) {
        this.addedAt = addedAt;
    }
}
