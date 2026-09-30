import { useState, useEffect } from "react";
import { Activity, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { getTechnicalIndicators } from "../services/analyticsService";

function TechnicalIndicators({ symbol = "AAPL" }) {
  const [indicators, setIndicators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getTechnicalIndicators(symbol)
      .then((data) => {
        if (!cancelled && Array.isArray(data)) {
          setIndicators(data);
        }
      })
      .catch((err) => {
        console.warn("Unable to load indicators for", symbol, err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [symbol]);

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "bullish":
      case "oversold": // Oversold is often a bullish buy signal
        return "positive";
      case "bearish":
      case "overbought":
        return "negative";
      default:
        return "neutral";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "bullish":
        return <TrendingUp size={14} />;
      case "bearish":
        return <TrendingDown size={14} />;
      default:
        return <Minus size={14} />;
    }
  };

  return (
    <div className="indicator-section">
      <div className="section-title">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Activity size={20} style={{ color: "var(--accent)" }} />
          <h2>Technical Indicators ({symbol?.toUpperCase()})</h2>
        </div>
        <p>Algorithmic trend momentum, volatility bands & oscillators</p>
      </div>

      <div className="indicator-grid">
        {indicators.length > 0 ? (
          indicators.map((ind) => {
            const badgeClass = getStatusBadgeClass(ind.status);

            return (
              <div className="indicator-card" key={ind.name}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <h3>{ind.name}</h3>
                  <span
                    className={`pl-badge ${badgeClass}`}
                    style={{ fontSize: 11, padding: "2px 8px" }}
                  >
                    {getStatusIcon(ind.status)}
                    {ind.status}
                  </span>
                </div>

                <strong style={{ fontSize: 20, color: "var(--text-primary)" }}>{ind.value}</strong>

                {ind.description && (
                  <p style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 8, lineHeight: 1.4 }}>
                    {ind.description}
                  </p>
                )}
              </div>
            );
          })
        ) : (
          <div style={{ color: "var(--text-secondary)", padding: 20 }}>
            {loading ? "Calculating algorithmic indicators..." : "No indicator data available"}
          </div>
        )}
      </div>
    </div>
  );
}

export default TechnicalIndicators;