package com.stockanalytics.spring_boot_project.dto;

public class TechnicalIndicatorDto {

    private String name;
    private String value;
    private String status;
    private String description;

    public TechnicalIndicatorDto() {
    }

    public TechnicalIndicatorDto(String name, String value, String status, String description) {
        this.name = name;
        this.value = value;
        this.status = status;
        this.description = description;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
