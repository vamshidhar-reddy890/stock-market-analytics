import React, { useState, useEffect } from "react";
import {
  Newspaper,
  Smile,
  Meh,
  Frown,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  Loader2
} from "lucide-react";
import { getSentiment } from "../services/analyticsService";

function SentimentCard({ symbol = "AAPL" }) {
  const [sentiment, setSentiment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHeadlines, setShowHeadlines] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    getSentiment(symbol)
      .then((data) => {
        if (isMounted) {
          setSentiment(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Failed to fetch sentiment:", err);
          setError("Failed to load sentiment analysis");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [symbol]);

  if (loading) {
    return (
      <div className="sentiment-card card">
        <div className="section-header">
          <div>
            <h2>
              <Newspaper size={20} />
              News Sentiment
            </h2>
            <p>FinBERT analysis &bull; {symbol}</p>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "180px", color: "var(--text-secondary)", gap: "10px" }}>
          <Loader2 size={24} className="spin-animation" />
          <span>Analyzing market news with FinBERT...</span>
        </div>
      </div>
    );
  }

  if (error || !sentiment) {
    return (
      <div className="sentiment-card card">
        <div className="section-header">
          <div>
            <h2>
              <Newspaper size={20} />
              News Sentiment
            </h2>
            <p>FinBERT analysis &bull; {symbol}</p>
          </div>
        </div>
        <div style={{ padding: "20px 0", color: "var(--negative)", fontSize: "14px" }}>
          {error || "No sentiment data available"}
        </div>
      </div>
    );
  }

  const isBullish = sentiment.overallSentiment?.toLowerCase().includes("bullish");
  const isBearish = sentiment.overallSentiment?.toLowerCase().includes("bearish");

  const scoreBadgeClass = isBullish ? "score-positive" : isBearish ? "score-negative" : "score-neutral";
  const overallColor = isBullish ? "var(--positive)" : isBearish ? "var(--negative)" : "var(--neutral, #f59e0b)";

  return (
    <div className="sentiment-card card">
      <div className="section-header">
        <div>
          <h2>
            <Newspaper size={20} />
            News Sentiment
          </h2>
          <p>
            <BrainCircuit size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
            {sentiment.modelName || "FinBERT"} &bull; {sentiment.symbol}
          </p>
        </div>

        <span className={`sentiment-score ${scoreBadgeClass}`}>
          {Math.round(sentiment.sentimentScore)}%
        </span>
      </div>

      <div className="sentiment-bars">
        <div className="sentiment-row">
          <span>
            <Smile size={18} style={{ color: "var(--positive)" }} />
            Positive
          </span>
          <div className="progress">
            <div
              className="progress-positive"
              style={{ width: `${sentiment.positivePercent || 0}%`, transition: "width 0.8s ease-in-out" }}
            ></div>
          </div>
          <strong>{Math.round(sentiment.positivePercent || 0)}%</strong>
        </div>

        <div className="sentiment-row">
          <span>
            <Meh size={18} style={{ color: "#9ca3af" }} />
            Neutral
          </span>
          <div className="progress">
            <div
              className="progress-neutral"
              style={{ width: `${sentiment.neutralPercent || 0}%`, transition: "width 0.8s ease-in-out" }}
            ></div>
          </div>
          <strong>{Math.round(sentiment.neutralPercent || 0)}%</strong>
        </div>

        <div className="sentiment-row">
          <span>
            <Frown size={18} style={{ color: "var(--negative)" }} />
            Negative
          </span>
          <div className="progress">
            <div
              className="progress-negative"
              style={{ width: `${sentiment.negativePercent || 0}%`, transition: "width 0.8s ease-in-out" }}
            ></div>
          </div>
          <strong>{Math.round(sentiment.negativePercent || 0)}%</strong>
        </div>
      </div>

      <div className="overall-sentiment" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          Overall Sentiment:{" "}
          <strong style={{ color: overallColor }}>
            {sentiment.overallSentiment || "Neutral"}
          </strong>
        </div>
        {sentiment.headlines && sentiment.headlines.length > 0 && (
          <button
            onClick={() => setShowHeadlines(!showHeadlines)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--primary)",
              cursor: "pointer",
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 8px",
              borderRadius: "4px"
            }}
          >
            {showHeadlines ? (
              <>Hide Headlines <ChevronUp size={14} /></>
            ) : (
              <>View Headlines ({sentiment.headlines.length}) <ChevronDown size={14} /></>
            )}
          </button>
        )}
      </div>

      {showHeadlines && sentiment.headlines && (
        <div className="sentiment-headlines-container" style={{
          marginTop: "16px",
          paddingTop: "12px",
          borderTop: "1px dashed var(--border-color)",
          display: "flex",
          flexDirection: "column",
          gap: "10px"
        }}>
          {sentiment.headlines.map((item, idx) => (
            <div
              key={idx}
              style={{
                padding: "10px 12px",
                background: "var(--bg-tertiary, rgba(255,255,255,0.03))",
                borderRadius: "8px",
                fontSize: "12px",
                border: "1px solid var(--border-color)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", color: "var(--text-secondary)", fontSize: "11px" }}>
                <span><strong>{item.source}</strong> &bull; {item.timeAgo}</span>
                <span
                  style={{
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontWeight: 600,
                    fontSize: "10px",
                    background: item.sentiment === "POSITIVE" ? "var(--positive-bg)" : item.sentiment === "NEGATIVE" ? "var(--negative-bg)" : "rgba(156, 163, 175, 0.15)",
                    color: item.sentiment === "POSITIVE" ? "var(--positive)" : item.sentiment === "NEGATIVE" ? "var(--negative)" : "#9ca3af"
                  }}
                >
                  {item.sentiment} ({Math.round(item.confidence * 100)}%)
                </span>
              </div>
              <div style={{ color: "var(--text-primary)", lineHeight: "1.4" }}>
                {item.title}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SentimentCard;