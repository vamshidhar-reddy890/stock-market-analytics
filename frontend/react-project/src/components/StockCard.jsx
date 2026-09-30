import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, TrendingDown } from "lucide-react";
import StockLogo from "./StockLogo";

const INDIAN_STOCKS = new Set([
  "RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK", "SBIN", "BHARTIARTL", "ITC", "LT", "AXISBANK",
  "KOTAKBANK", "HINDUNILVR", "MARUTI", "TATAMOTORS", "M&M", "SUNPHARMA", "NTPC", "POWERGRID", "ADANIENT", "ADANIPORTS",
  "TATASTEEL", "JSWSTEEL", "WIPRO", "TECHM", "HCLTECH", "ASIANPAINT", "BAJFINANCE", "BAJAJFINSV", "ULTRACEMCO", "TITAN"
]);

function StockCard(props) {
  const stockObj = props.stock || {};
  const symbol = stockObj.symbol || props.symbol || "AAPL";
  const company = stockObj.companyName || stockObj.company || props.company || symbol;
  const price = stockObj.price ?? props.price ?? 0;
  const change = stockObj.change ?? props.change ?? 0;
  const changePercent = stockObj.changePercent ?? props.changePercent ?? 0;

  const navigate = useNavigate();
  const [pulse, setPulse] = useState(null);
  const prevPriceRef = useRef(price);

  useEffect(() => {
    if (prevPriceRef.current !== undefined && price !== prevPriceRef.current) {
      setPulse(price > prevPriceRef.current ? "tick-up" : "tick-down");
      const timer = setTimeout(() => setPulse(null), 1000);
      prevPriceRef.current = price;
      return () => clearTimeout(timer);
    }
    prevPriceRef.current = price;
  }, [price]);

  const cleanSymbol = symbol ? symbol.toUpperCase() : "AAPL";
  const positive = change >= 0;
  const isIndian = INDIAN_STOCKS.has(cleanSymbol);
  const currencySuffix = isIndian ? "INR" : "USD";
  const prefix = isIndian ? "₹" : "$";

  return (
    <div
      className={`stock-card ${pulse || ""}`}
      onClick={() => navigate(`/stock/${cleanSymbol}`)}
      style={{
        cursor: "pointer",
        position: "relative",
        borderRadius: "14px",
        padding: "18px 20px",
        transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "135px"
      }}
      title={`Click to view ${cleanSymbol} detailed chart & analysis`}
    >
      {/* Top Row: Logo + Names */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
        <StockLogo symbol={cleanSymbol} size={38} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              fontSize: "15px",
              fontWeight: 700,
              margin: 0,
              color: "var(--text-primary)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}
          >
            {company || cleanSymbol}
          </h3>
          <p
            style={{
              fontSize: "12px",
              color: "var(--text-secondary)",
              margin: "2px 0 0 0",
              fontWeight: 600,
              letterSpacing: "0.5px"
            }}
          >
            {cleanSymbol}
          </p>
        </div>
      </div>

      {/* Bottom Row: Price (Left) & Change (Right) matching Reference Photo */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "auto" }}>
        <div
          style={{
            fontSize: "18px",
            fontWeight: 800,
            color: "#2563eb", // Vibrant blue accent matching reference photo
            letterSpacing: "-0.3px"
          }}
        >
          {Number(price).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}{" "}
          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)" }}>
            {currencySuffix}
          </span>
        </div>

        <div
          style={{
            fontSize: "12px",
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            gap: "3px",
            color: positive ? "var(--positive, #10b981)" : "var(--negative, #ef4444)"
          }}
        >
          <span>
            {positive ? "+" : ""}
            {prefix}
            {Math.abs(Number(change)).toFixed(2)}
          </span>
          <span>
            ({positive ? "+" : ""}
            {Number(changePercent).toFixed(2)}%)
          </span>
          <span style={{ fontSize: "10px" }}>{positive ? "▲" : "▼"}</span>
        </div>
      </div>
    </div>
  );
}

export default StockCard;