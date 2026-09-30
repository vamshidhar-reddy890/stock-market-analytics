import React from "react";
import { useNavigate } from "react-router-dom";
import StockLogo from "./StockLogo";
import { isIndianStock } from "../constants/stocks";

const StockTicker = ({ stocks = [], loading = false, error = null, onSelectStock = null }) => {
  const navigate = useNavigate();

  if (loading && stocks.length === 0) {
    return (
      <div className="stock-ticker">
        <div className="ticker-item">Loading live market ticker for all global assets...</div>
      </div>
    );
  }

  if (error && stocks.length === 0) {
    return (
      <div className="stock-ticker">
        <div className="ticker-item error">Market data offline — check connection</div>
      </div>
    );
  }

  // Duplicate items for seamless continuous 50% translation marquee
  const tickerItems = stocks.length > 0 ? [...stocks, ...stocks] : [];
  // Dynamic duration so reading/clicking is smooth whether 10 or 90 stocks
  const durationSec = Math.max(35, Math.round(stocks.length * 2.5));

  const handleClick = (symbol) => {
    const cleanSym = (symbol || "AAPL").toUpperCase();
    if (typeof onSelectStock === "function") {
      onSelectStock(cleanSym);
    } else {
      navigate(`/stock/${cleanSym}`);
    }
  };

  return (
    <div
      className="stock-ticker"
      style={{ animationDuration: `${durationSec}s` }}
    >
      {tickerItems.map((stock, index) => {
        const isPositive = (stock.change || 0) >= 0;
        const cleanSym = (stock.symbol || "").toUpperCase();
        const isIndian = isIndianStock(cleanSym);
        const currencyPrefix = isIndian ? "₹" : "$";

        return (
          <div
            key={`${cleanSym}-${index}`}
            className="ticker-item ticker-item-clickable"
            onClick={() => handleClick(cleanSym)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleClick(cleanSym);
              }
            }}
            title={`Click to view ${cleanSym} live chart, indicators & AI prediction`}
          >
            <StockLogo symbol={cleanSym} size={20} />
            <span className="ticker-symbol" style={{ fontWeight: 700 }}>
              {cleanSym}
            </span>
            <span className="ticker-price">
              {currencyPrefix}
              {typeof stock.price === "number" ? stock.price.toFixed(2) : stock.price || "--"}
            </span>
            <span className={`ticker-change ${isPositive ? "positive" : "negative"}`}>
              {isPositive ? "▲ +" : "▼ "}
              {currencyPrefix}
              {Math.abs(stock.change || 0).toFixed(2)} ({isPositive ? "+" : ""}
              {(stock.changePercent || 0).toFixed(2)}%)
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default StockTicker;