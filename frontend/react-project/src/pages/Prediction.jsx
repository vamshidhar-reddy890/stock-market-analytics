import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Brain,
  Cpu,
  TrendingUp,
  TrendingDown,
  Target,
  Briefcase,
  AlertCircle,
  Sparkles,
  Calendar,
  Layers,
  ArrowRight
} from "lucide-react";
import Navbar from "../components/Navbar";
import PredictionCard from "../components/PredictionCard";
import StockLogo from "../components/StockLogo";
import { getPrediction } from "../services/predictionService";
import { getPortfolio } from "../services/portfolioService";

function Prediction() {
  const [portfolio, setPortfolio] = useState(null);
  const [portfolioStocks, setPortfolioStocks] = useState([]);
  const [symbol, setSymbol] = useState("AAPL");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch user's portfolio holdings on mount
  useEffect(() => {
    getPortfolio()
      .then((res) => {
        if (res && res.holdings && res.holdings.length > 0) {
          setPortfolio(res);
          const holdingsList = res.holdings.map((h) => ({
            symbol: h.symbol,
            quantity: h.quantity,
            avgBuyPrice: h.averageBuyPrice,
            currentPrice: h.currentPrice,
            currentValue: h.currentValue
          }));
          setPortfolioStocks(holdingsList);
          // Default to the first stock in user's portfolio!
          setSymbol(holdingsList[0].symbol);
        }
      })
      .catch((err) => {
        console.warn("No authenticated portfolio found or error loading portfolio", err);
      });
  }, []);

  // 2. Fetch ML prediction data for the selected symbol
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getPrediction(symbol)
      .then((res) => {
        if (!cancelled && res) {
          setData(res);
        }
      })
      .catch((err) => {
        console.warn("Error fetching prediction", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [symbol]);

  const cleanSymbol = symbol ? symbol.toUpperCase() : "AAPL";
  const isUsStock = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "NFLX", "AMD", "META", "BTC", "ETH"].includes(cleanSymbol);
  const prefix = isUsStock ? "$" : "₹";

  const defaultFeaturedSymbols = [
    "AAPL",
    "MSFT",
    "GOOGL",
    "TSLA",
    "NVDA",
    "META",
    "TCS",
    "INFY",
    "RELIANCE"
  ];

  return (
    <div className="app">
      <Navbar />

      <main className="dashboard">
        {/* Header */}
        <div className="page-heading">
          <div>
            <h1>Machine Learning Stock Predictions</h1>
            <p>
              AI-driven multi-day price forecasting based on your portfolio holdings & market momentum
            </p>
          </div>

          <div className="market-status">
            <span></span>
            Multi-Model AI Active
          </div>
        </div>

        {/* Portfolio Selection Bar (Requirement 6) */}
        {portfolioStocks.length > 0 ? (
          <div
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border-color)",
              borderRadius: "14px",
              padding: "16px 20px",
              marginBottom: "25px",
              boxShadow: "var(--shadow-sm)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Briefcase size={18} style={{ color: "var(--primary)" }} />
                <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>
                  Your Portfolio Stocks ({portfolioStocks.length})
                </span>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  &bull; Select a holding to inspect 5-day AI projections
                </span>
              </div>
              <Link to="/portfolio" style={{ fontSize: "12px", color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>
                Manage Portfolio &rarr;
              </Link>
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {portfolioStocks.map((h) => {
                const isSelected = symbol.toUpperCase() === h.symbol.toUpperCase();
                return (
                  <button
                    key={h.symbol}
                    onClick={() => setSymbol(h.symbol)}
                    className={isSelected ? "btn-primary" : "btn-secondary"}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "10px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: "13px",
                      fontWeight: 600,
                      boxShadow: isSelected ? "0 4px 12px rgba(37,99,235,0.25)" : "none"
                    }}
                  >
                    <StockLogo symbol={h.symbol} size={22} />
                    <span>{h.symbol}</span>
                    <span
                      style={{
                        padding: "2px 6px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        background: isSelected ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.06)"
                      }}
                    >
                      {h.quantity} shares
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div
            style={{
              background: "rgba(59, 130, 246, 0.06)",
              border: "1px dashed var(--border-color)",
              borderRadius: "12px",
              padding: "16px 20px",
              marginBottom: "25px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <AlertCircle size={20} style={{ color: "var(--primary)" }} />
              <div>
                <strong style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                  Personalize with your Portfolio
                </strong>
                <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "var(--text-secondary)" }}>
                  You haven't added any stocks to your portfolio yet. Add holdings to track automatic 5-day AI predictions for your assets!
                </p>
              </div>
            </div>
            <Link to="/portfolio" className="btn-primary" style={{ padding: "6px 14px", fontSize: "12px", borderRadius: "8px", textDecoration: "none" }}>
              Add to Portfolio
            </Link>
          </div>
        )}

        {/* Global Stock Switcher */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>
            Featured Assets:
          </span>
          {defaultFeaturedSymbols.map((sym) => (
            <button
              key={sym}
              onClick={() => setSymbol(sym)}
              className={symbol === sym ? "btn-primary" : "btn-secondary"}
              style={{
                padding: "5px 12px",
                fontSize: "12px",
                borderRadius: "8px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <StockLogo symbol={sym} size={16} />
              <span>{sym}</span>
            </button>
          ))}
        </div>

        {/* Top Grid: Primary Prediction Card + Model Benchmarking */}
        <div className="prediction-page-grid" style={{ marginBottom: 30 }}>
          <PredictionCard symbol={symbol} />

          {/* Model Performance Overview */}
          <div className="model-card">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 15 }}>
              <Cpu size={22} style={{ color: "var(--accent)" }} />
              <h2 style={{ fontSize: 18 }}>Model Accuracy & Benchmarking ({cleanSymbol})</h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {data?.models?.map((m) => (
                <div key={m.name} className="model-item" style={{ padding: "12px 14px" }}>
                  <div>
                    <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{m.name}</span>
                    <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
                      RMSE: <strong>{m.rmse}</strong> &bull; MAPE: <strong>{m.mape}%</strong>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <strong style={{ color: "var(--accent)", fontSize: 14 }}>
                      MAE: {m.mae}
                    </strong>
                    <div style={{ fontSize: 11, color: "var(--positive)", fontWeight: 600 }}>
                      {m.recommendation}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5-Day Projected Trajectory (Requirement 6) */}
        <div className="section-title">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <StockLogo symbol={cleanSymbol} size={28} />
            <div>
              <h2 style={{ margin: 0 }}>5-Day Upcoming Stock Price Forecast &bull; {cleanSymbol}</h2>
              <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "var(--text-secondary)" }}>
                Multi-step temporal forecasting with 95% statistical confidence intervals
              </p>
            </div>
          </div>
        </div>

        <div className="holdings-table-card" style={{ marginBottom: 30 }}>
          <div className="holdings-table-container">
            <table className="holdings-table">
              <thead>
                <tr>
                  <th>Forecast Horizon</th>
                  <th>Projected Price</th>
                  <th>Lower Bound (-95% CI)</th>
                  <th>Upper Bound (+95% CI)</th>
                  <th>Expected Shift</th>
                  <th>Signal Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.trajectory && data.trajectory.length > 0 ? (
                  data.trajectory.map((pt, idx) => {
                    const currPrice = data.currentPrice || 1;
                    const diff = pt.predictedPrice - currPrice;
                    const isPos = diff >= 0;

                    return (
                      <tr key={pt.day}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <Calendar size={14} style={{ color: "var(--primary)" }} />
                            <div>
                              <strong style={{ color: "var(--text-primary)" }}>{pt.day}</strong>
                              <span style={{ fontSize: 11, color: "var(--text-secondary)", marginLeft: 6 }}>
                                (+{idx + 1} day{idx > 0 ? "s" : ""})
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <strong style={{ color: "#2563eb", fontSize: "15px" }}>
                            {prefix}{Number(pt.predictedPrice).toFixed(2)}
                          </strong>
                        </td>
                        <td style={{ color: "var(--text-secondary)" }}>
                          {prefix}{Number(pt.lowerBound).toFixed(2)}
                        </td>
                        <td style={{ color: "var(--text-secondary)" }}>
                          {prefix}{Number(pt.upperBound).toFixed(2)}
                        </td>
                        <td>
                          <span className={`pl-badge ${isPos ? "positive" : "negative"}`}>
                            {isPos ? "+" : ""}{prefix}{diff.toFixed(2)} ({isPos ? "+" : ""}{((diff / currPrice) * 100).toFixed(2)}%)
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              fontSize: 12,
                              fontWeight: 600,
                              color: isPos ? "var(--positive)" : "var(--negative)"
                            }}
                          >
                            {isPos ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {isPos ? "Bullish Extension" : "Bearish Pullback"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "30px 0", color: "var(--text-secondary)" }}>
                      Loading 5-day trajectory forecast for {cleanSymbol}...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Prediction;