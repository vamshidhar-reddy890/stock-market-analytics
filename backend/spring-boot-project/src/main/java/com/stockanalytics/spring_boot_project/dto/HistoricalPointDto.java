package com.stockanalytics.spring_boot_project.dto;

public class HistoricalPointDto {

    private String time;
    private Double price;
    private Double open;
    private Double high;
    private Double low;
    private Long volume;

    public HistoricalPointDto() {
    }

    public HistoricalPointDto(String time, Double price, Double open, Double high, Double low, Long volume) {
        this.time = time;
        this.price = price;
        this.open = open;
        this.high = high;
        this.low = low;
        this.volume = volume;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Double getOpen() {
        return open;
    }

    public void setOpen(Double open) {
        this.open = open;
    }

    public Double getHigh() {
        return high;
    }

    public void setHigh(Double high) {
        this.high = high;
    }

    public Double getLow() {
        return low;
    }

    public void setLow(Double low) {
        this.low = low;
    }

    public Long getVolume() {
        return volume;
    }

    public void setVolume(Long volume) {
        this.volume = volume;
    }
}
