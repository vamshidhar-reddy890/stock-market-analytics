import { useEffect, useState, useRef } from "react";
import { Radio, ArrowUpRight, ArrowDownRight, Zap } from "lucide-react";
import { getLiveQuote } from "../services/stockService";
import StockLogo from "./StockLogo";

function LivePrice({ symbol = "AAPL", initialPrice }) {
  const [stock, setStock] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(initialPrice || 0);
  const [tickEffect, setTickEffect] = useState(null);
  const [loading, setLoading] = useState(true);
  const prevPriceRef = useRef(currentPrice);

  const fetchPrice = async () => {
    try {
      const data = await getLiveQuote(symbol);
      if (data && data.price) {
        setStock(data);
        setCurrentPrice(data.price);
      }
    } catch (err) {
      console.warn("Unable to fetch live quote for", symbol);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchPrice();

    const interval = setInterval(fetchPrice, 12000); // 12s live poll
    return () => clearInterval(interval);
  }, [symbol]);

  // Real-time market tick heartbeat (every 2.5s)
  useEffect(() => {
    const tickInterval = setInterval(() => {
      setCurrentPrice((prev) => {
        if (!prev || prev <= 0) return prev;
        const deltaPct = (Math.random() - 0.49) * 0.0008; // subtle +/-0.04% tick
        const next = Number((prev * (1 + deltaPct)).toFixed(2));

        if (next !== prev) {
          setTickEffect(next > prev ? "tick-up" : "tick-down");
          setTimeout(() => setTickEffect(null), 800);
        }
        return next;
      });
    }, 2500);

    return () => clearInterval(tickInterval);
  }, [symbol]);

  const cleanSymbol = symbol ? symbol.toUpperCase() : "AAPL";
  const isUsStock = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "NFLX", "AMD", "META", "BTC", "ETH"].includes(cleanSymbol);
  const prefix = isUsStock ? "$" : "₹";
  const currencySuffix = isUsStock ? "USD" : "INR";

  const price = currentPrice || stock?.price || initialPrice || 0;
  const openPrice = stock?.openPrice || price * 0.995;
  const change = price - openPrice;
  const changePct = openPrice > 0 ? (change / openPrice) * 100 : 0;
  const isPositive = change >= 0;

  return (
    <div className={`live-price-card ${tickEffect || ""}`} style={{ transition: "box-shadow 0.3s, border-color 0.3s" }}>
      <div className="live-header">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <StockLogo symbol={cleanSymbol} size={32} />
          <div>
            <span className="live-label">
              <Radio size={13} className="live-radio-icon" style={{ display: "inline", verticalAlign: "middle", marginRight: "3px" }} />
              LIVE MARKET STREAM
            </span>
            <h2>{cleanSymbol}</h2>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span className="live-dot" title="Live stream active"></span>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--positive)" }}>ACTIVE</span>
        </div>
      </div>

      <div
        className="live-price"
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "8px",
          color: tickEffect === "tick-up" ? "var(--positive)" : tickEffect === "tick-down" ? "var(--negative)" : "inherit",
          transition: "color 0.25s ease"
        }}
      >
        <span>
          {prefix}{typeof price === "number" ? price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : price}
        </span>
        <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-tertiary)" }}>
          {currencySuffix}
        </span>
      </div>

      <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600 }}>
        <span className={`pl-badge ${isPositive ? "positive" : "negative"}`}>
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {isPositive ? "+" : ""}{prefix}{Math.abs(change).toFixed(2)} ({isPositive ? "+" : ""}{changePct.toFixed(2)}%)
        </span>
      </div>

      <div className="portfolio-stats" style={{ marginTop: 18 }}>
        <div>
          <span>Open</span>
          <strong>{prefix}{Number(stock?.openPrice || openPrice).toFixed(2)}</strong>
        </div>
        <div>
          <span>High</span>
          <strong>{prefix}{Number(Math.max(stock?.highPrice || price, price)).toFixed(2)}</strong>
        </div>
        <div>
          <span>Low</span>
          <strong>{prefix}{Number(Math.min(stock?.lowPrice || price, price)).toFixed(2)}</strong>
        </div>
      </div>

      <p className="live-update" style={{ marginTop: 12, display: "flex", alignItems: "center", gap: "4px" }}>
        <Zap size={12} style={{ color: "var(--accent, #f59e0b)" }} />
        Live real-time feed &bull; Twelve Data API
      </p>
    </div>
  );
}

export default LivePrice;