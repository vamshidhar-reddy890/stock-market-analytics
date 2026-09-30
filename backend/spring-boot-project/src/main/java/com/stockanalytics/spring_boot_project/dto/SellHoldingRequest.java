package com.stockanalytics.spring_boot_project.dto;

import java.math.BigDecimal;

public class SellHoldingRequest {

    private Long holdingId;
    private String symbol;
    private Integer quantity;
    private BigDecimal sellPrice;

    public SellHoldingRequest() {
    }

    public SellHoldingRequest(Long holdingId, String symbol, Integer quantity, BigDecimal sellPrice) {
        this.holdingId = holdingId;
        this.symbol = symbol;
        this.quantity = quantity;
        this.sellPrice = sellPrice;
    }

    public Long getHoldingId() {
        return holdingId;
    }

    public void setHoldingId(Long holdingId) {
        this.holdingId = holdingId;
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

    public BigDecimal getSellPrice() {
        return sellPrice;
    }

    public void setSellPrice(BigDecimal sellPrice) {
        this.sellPrice = sellPrice;
    }
}
