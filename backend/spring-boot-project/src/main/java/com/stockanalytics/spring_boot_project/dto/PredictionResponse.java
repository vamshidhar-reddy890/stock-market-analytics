package com.stockanalytics.spring_boot_project.dto;

import java.util.ArrayList;
import java.util.List;

public class PredictionResponse {

    private String symbol;
    private Double currentPrice;
    private Double predictedPrice;
    private Double expectedChange;
    private Double expectedChangePercent;
    private String trend;
    private String primaryModel;
    private Double confidence;
    private List<ModelEvaluation> models = new ArrayList<>();
    private List<TrajectoryPoint> trajectory = new ArrayList<>();

    public PredictionResponse() {
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public Double getCurrentPrice() {
        return currentPrice;
    }

    public void setCurrentPrice(Double currentPrice) {
        this.currentPrice = currentPrice;
    }

    public Double getPredictedPrice() {
        return predictedPrice;
    }

    public void setPredictedPrice(Double predictedPrice) {
        this.predictedPrice = predictedPrice;
    }

    public Double getExpectedChange() {
        return expectedChange;
    }

    public void setExpectedChange(Double expectedChange) {
        this.expectedChange = expectedChange;
    }

    public Double getExpectedChangePercent() {
        return expectedChangePercent;
    }

    public void setExpectedChangePercent(Double expectedChangePercent) {
        this.expectedChangePercent = expectedChangePercent;
    }

    public String getTrend() {
        return trend;
    }

    public void setTrend(String trend) {
        this.trend = trend;
    }

    public String getPrimaryModel() {
        return primaryModel;
    }

    public void setPrimaryModel(String primaryModel) {
        this.primaryModel = primaryModel;
    }

    public Double getConfidence() {
        return confidence;
    }

    public void setConfidence(Double confidence) {
        this.confidence = confidence;
    }

    public List<ModelEvaluation> getModels() {
        return models;
    }

    public void setModels(List<ModelEvaluation> models) {
        this.models = models;
    }

    public List<TrajectoryPoint> getTrajectory() {
        return trajectory;
    }

    public void setTrajectory(List<TrajectoryPoint> trajectory) {
        this.trajectory = trajectory;
    }

    public static class ModelEvaluation {
        private String name;
        private Double mae;
        private Double rmse;
        private Double mape;
        private Double predictedPrice;
        private String recommendation;

        public ModelEvaluation() {
        }

        public ModelEvaluation(String name, Double mae, Double rmse, Double mape, Double predictedPrice, String recommendation) {
            this.name = name;
            this.mae = mae;
            this.rmse = rmse;
            this.mape = mape;
            this.predictedPrice = predictedPrice;
            this.recommendation = recommendation;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public Double getMae() {
            return mae;
        }

        public void setMae(Double mae) {
            this.mae = mae;
        }

        public Double getRmse() {
            return rmse;
        }

        public void setRmse(Double rmse) {
            this.rmse = rmse;
        }

        public Double getMape() {
            return mape;
        }

        public void setMape(Double mape) {
            this.mape = mape;
        }

        public Double getPredictedPrice() {
            return predictedPrice;
        }

        public void setPredictedPrice(Double predictedPrice) {
            this.predictedPrice = predictedPrice;
        }

        public String getRecommendation() {
            return recommendation;
        }

        public void setRecommendation(String recommendation) {
            this.recommendation = recommendation;
        }
    }

    public static class TrajectoryPoint {
        private String day;
        private Double predictedPrice;
        private Double lowerBound;
        private Double upperBound;

        public TrajectoryPoint() {
        }

        public TrajectoryPoint(String day, Double predictedPrice, Double lowerBound, Double upperBound) {
            this.day = day;
            this.predictedPrice = predictedPrice;
            this.lowerBound = lowerBound;
            this.upperBound = upperBound;
        }

        public String getDay() {
            return day;
        }

        public void setDay(String day) {
            this.day = day;
        }

        public Double getPredictedPrice() {
            return predictedPrice;
        }

        public void setPredictedPrice(Double predictedPrice) {
            this.predictedPrice = predictedPrice;
        }

        public Double getLowerBound() {
            return lowerBound;
        }

        public void setLowerBound(Double lowerBound) {
            this.lowerBound = lowerBound;
        }

        public Double getUpperBound() {
            return upperBound;
        }

        public void setUpperBound(Double upperBound) {
            this.upperBound = upperBound;
        }
    }
}
