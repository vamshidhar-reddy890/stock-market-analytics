package com.stockanalytics.spring_boot_project.dto;

import java.util.ArrayList;
import java.util.List;

public class SentimentResponse {

    private String symbol;
    private Double sentimentScore;
    private String overallSentiment;
    private Double positivePercent;
    private Double neutralPercent;
    private Double negativePercent;
    private String modelName;
    private List<NewsItem> headlines = new ArrayList<>();

    public SentimentResponse() {
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public Double getSentimentScore() {
        return sentimentScore;
    }

    public void setSentimentScore(Double sentimentScore) {
        this.sentimentScore = sentimentScore;
    }

    public String getOverallSentiment() {
        return overallSentiment;
    }

    public void setOverallSentiment(String overallSentiment) {
        this.overallSentiment = overallSentiment;
    }

    public Double getPositivePercent() {
        return positivePercent;
    }

    public void setPositivePercent(Double positivePercent) {
        this.positivePercent = positivePercent;
    }

    public Double getNeutralPercent() {
        return neutralPercent;
    }

    public void setNeutralPercent(Double neutralPercent) {
        this.neutralPercent = neutralPercent;
    }

    public Double getNegativePercent() {
        return negativePercent;
    }

    public void setNegativePercent(Double negativePercent) {
        this.negativePercent = negativePercent;
    }

    public String getModelName() {
        return modelName;
    }

    public void setModelName(String modelName) {
        this.modelName = modelName;
    }

    public List<NewsItem> getHeadlines() {
        return headlines;
    }

    public void setHeadlines(List<NewsItem> headlines) {
        this.headlines = headlines;
    }

    public static class NewsItem {
        private String title;
        private String source;
        private String sentiment;
        private Double confidence;
        private String timeAgo;

        public NewsItem() {
        }

        public NewsItem(String title, String source, String sentiment, Double confidence, String timeAgo) {
            this.title = title;
            this.source = source;
            this.sentiment = sentiment;
            this.confidence = confidence;
            this.timeAgo = timeAgo;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getSource() {
            return source;
        }

        public void setSource(String source) {
            this.source = source;
        }

        public String getSentiment() {
            return sentiment;
        }

        public void setSentiment(String sentiment) {
            this.sentiment = sentiment;
        }

        public Double getConfidence() {
            return confidence;
        }

        public void setConfidence(Double confidence) {
            this.confidence = confidence;
        }

        public String getTimeAgo() {
            return timeAgo;
        }

        public void setTimeAgo(String timeAgo) {
            this.timeAgo = timeAgo;
        }
    }
}
