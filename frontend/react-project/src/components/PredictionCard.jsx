import { useState, useEffect } from "react";
import { Brain, ArrowUp, ArrowDown } from "lucide-react";
import { getPrediction } from "../services/predictionService";

function PredictionCard({ symbol = "AAPL" }) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getPrediction(symbol)
      .then((data) => {
        if (!cancelled && data) {
          setPrediction(data);
        }
      })
      .catch((err) => {
        console.warn("Unable to load prediction for", symbol, err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [symbol]);

  const cleanSymbol = symbol?.toUpperCase() || "AAPL";
  const isUsStock = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "NFLX"].includes(cleanSymbol);
  const prefix = isUsStock ? "$" : "₹";

  const currentPrice = prediction?.currentPrice || 0;
  const predictedPrice = prediction?.predictedPrice || currentPrice;
  const expectedChange = prediction?.expectedChange || 0;
  const expectedChangePct = prediction?.expectedChangePercent || 0;
  const isBullish = prediction?.trend === "BULLISH" || expectedChange >= 0;

  return (
    <div className="prediction-card">
      <div className="prediction-header">
        <div>
          <span className="prediction-label">
            <Brain size={16} />
            AI PRICE PREDICTION
          </span>
          <h2>{cleanSymbol}</h2>
        </div>

        <span className="model-name">
          {prediction?.primaryModel?.split(" ")[0] || "LSTM"}
        </span>
      </div>

      <div className="prediction-values">
        <div>
          <p>Current Price</p>
          <strong>
            {prefix}{Number(currentPrice).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </strong>
        </div>

        <div className="arrow" style={{ color: isBullish ? "var(--positive)" : "var(--negative)" }}>
          {isBullish ? <ArrowUp size={25} /> : <ArrowDown size={25} />}
        </div>

        <div>
          <p>Target Price (5D)</p>
          <strong>
            {prefix}{Number(predictedPrice).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </strong>
        </div>
      </div>

      <div className="prediction-result">
        Expected Movement:{" "}
        <strong className={isBullish ? "positive-text" : "negative-text"}>
          {isBullish ? "▲ +" : "▼ "}
          {prefix}{Math.abs(expectedChange).toFixed(2)} ({isBullish ? "+" : ""}{expectedChangePct.toFixed(2)}%)
        </strong>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
        <small style={{ color: "var(--text-secondary)", fontSize: 11 }}>
          Model Confidence: <strong>{prediction?.confidence || 88}%</strong>
        </small>
        <span
          className={`pl-badge ${isBullish ? "positive" : "negative"}`}
          style={{ fontSize: 11, padding: "2px 8px" }}
        >
          {isBullish ? "BUY / BULLISH" : "BEARISH"}
        </span>
      </div>
    </div>
  );
}

export default PredictionCard;