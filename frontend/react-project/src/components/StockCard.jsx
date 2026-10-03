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
      title={`Click to view ${cleanSymbol} detailed chart & analysis`}
    >
      {/* Top Row: Logo + Names */}
      <div className="stock-card-top">
        <StockLogo symbol={cleanSymbol} size={36} />
        <div className="stock-card-meta">
          <h3 className="stock-card-company">
            {company || cleanSymbol}
          </h3>
          <p className="stock-card-symbol">
            {cleanSymbol}
          </p>
        </div>
      </div>

      {/* Bottom Row: Price (Left) & Change Badge (Right) */}
      <div className="stock-card-bottom">
        <div className="stock-card-price-wrap">
          <span className="stock-card-price">
            {Number(price).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </span>
          <span className="stock-card-currency">
            {currencySuffix}
          </span>
        </div>

        <div className={`stock-card-badge ${positive ? "positive" : "negative"}`}>
          <span className="badge-arrow">{positive ? "▲" : "▼"}</span>
          <span className="badge-change">
            {positive ? "+" : ""}
            {prefix}
            {Math.abs(Number(change)).toFixed(2)}
          </span>
          <span className="badge-percent">
            ({positive ? "+" : ""}
            {Number(changePercent).toFixed(2)}%)
          </span>
        </div>
      </div>
    </div>
  );
}

export default StockCard;