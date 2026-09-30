package com.stockanalytics.spring_boot_project.dto;

import java.math.BigDecimal;

public class HoldingRequest {

    private String symbol;
    private Integer quantity;
    private BigDecimal buyPrice;

    public HoldingRequest() {
    }

    public HoldingRequest(String symbol, Integer quantity, BigDecimal buyPrice) {
        this.symbol = symbol;
        this.quantity = quantity;
        this.buyPrice = buyPrice;
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

    public BigDecimal getBuyPrice() {
        return buyPrice;
    }

    public void setBuyPrice(BigDecimal buyPrice) {
        this.buyPrice = buyPrice;
    }
}
