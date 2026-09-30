import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, TrendingDown, Plus, Activity, Heart } from "lucide-react";
import Navbar from "../components/Navbar";
import LivePrice from "../components/LivePrice";
import StockChart from "../components/StockChart";
import TechnicalIndicators from "../components/TechnicalIndicators";
import PredictionCard from "../components/PredictionCard";
import SentimentCard from "../components/SentimentCard";
import StockLogo from "../components/StockLogo";
import { getStock } from "../services/stockService";
import { checkInWatchlist, addToWatchlist, removeFromWatchlist } from "../services/watchlistService";

function StockDetails() {
  const { symbol = "AAPL" } = useParams();
  const navigate = useNavigate();
  const cleanSymbol = symbol.toUpperCase();

  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getStock(cleanSymbol)
      .then((data) => {
        if (!cancelled && data) {
          setStock(data);
        }
      })
      .catch((err) => {
        console.warn("Failed to load details for", cleanSymbol, err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // Check if stock is in user's wishlist
    checkInWatchlist(cleanSymbol)
      .then((res) => {
        if (!cancelled && res && typeof res.inWatchlist === "boolean") {
          setInWishlist(res.inWatchlist);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [cleanSymbol]);

  const handleToggleWishlist = async () => {
    try {
      setWishlistLoading(true);
      if (inWishlist) {
        await removeFromWatchlist(cleanSymbol);
        setInWishlist(false);
      } else {
        await addToWatchlist(cleanSymbol);
        setInWishlist(true);
      }
    } catch (e) {
      console.warn("Could not update wishlist:", e);
    } finally {
      setWishlistLoading(false);
    }
  };

  const isUsStock = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "NFLX"].includes(cleanSymbol);
  const prefix = isUsStock ? "$" : "₹";

  const price = stock?.price || 0;
  const open = stock?.openPrice || price;
  const high = stock?.highPrice || price;
  const low = stock?.lowPrice || price;
  const change = price - open;
  const changePct = open > 0 ? (change / open) * 100 : 0;
  const isPositive = change >= 0;

  return (
    <div className="app">
      <Navbar />

      <main className="dashboard">
        <div style={{ marginBottom: 15 }}>
          <button
            onClick={() => navigate("/dashboard")}
            className="btn-secondary"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 13 }}
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
        </div>

        <div className="page-heading">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <StockLogo symbol={cleanSymbol} size={42} />
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <h1 style={{ margin: 0 }}>{cleanSymbol}</h1>
                  <span className="stock-badge" style={{ fontSize: 13 }}>
                    {stock?.companyName || cleanSymbol}
                  </span>
                </div>
              </div>
            </div>
            <p>Real-time market quotes, technical parameters & time-series analysis</p>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span className={`pl-badge ${isPositive ? "positive" : "negative"}`} style={{ fontSize: 15, padding: "6px 12px" }}>
              {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {isPositive ? "+" : ""}{prefix}{Math.abs(change).toFixed(2)} ({isPositive ? "+" : ""}{changePct.toFixed(2)}%)
            </span>
            <button
              className="btn-secondary"
              onClick={handleToggleWishlist}
              disabled={wishlistLoading}
              title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <Heart
                size={16}
                fill={inWishlist ? "#ef4444" : "none"}
                color={inWishlist ? "#ef4444" : "currentColor"}
              />
              {inWishlist ? "In Wishlist" : "Add to Wishlist"}
            </button>
            <button
              className="btn-primary"
              onClick={() => navigate("/portfolio")}
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <Plus size={16} />
              Add to Portfolio
            </button>
          </div>
        </div>

        {/* Key Market Stats Grid */}
        <div className="stock-grid" style={{ marginBottom: 25 }}>
          <div className="stock-card">
            <span className="stock-company">CURRENT PRICE</span>
            <div className="stock-price">{prefix}{Number(price).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <span className={isPositive ? "stock-change positive" : "stock-change negative"}>
              {isPositive ? "▲" : "▼"} {changePct.toFixed(2)}%
            </span>
          </div>

          <div className="stock-card">
            <span className="stock-company">DAY HIGH</span>
            <div className="stock-price">{prefix}{Number(high).toFixed(2)}</div>
            <span className="stock-symbol" style={{ fontSize: 12 }}>Peak Price Today</span>
          </div>

          <div className="stock-card">
            <span className="stock-company">DAY LOW</span>
            <div className="stock-price">{prefix}{Number(low).toFixed(2)}</div>
            <span className="stock-symbol" style={{ fontSize: 12 }}>Trough Price Today</span>
          </div>

          <div className="stock-card">
            <span className="stock-company">TRADING VOLUME</span>
            <div className="stock-price">{(stock?.volume || 1500000).toLocaleString("en-IN")}</div>
            <span className="stock-symbol" style={{ fontSize: 12 }}>Shares Traded</span>
          </div>
        </div>

        {/* Main Chart + Live Price */}
        <section className="main-grid">
          <StockChart symbol={cleanSymbol} />
          <LivePrice symbol={cleanSymbol} initialPrice={price} />
        </section>

        {/* Technical Indicators */}
        <TechnicalIndicators symbol={cleanSymbol} />

        {/* Prediction + Sentiment */}
        <section className="analytics-grid" style={{ marginTop: "24px", marginBottom: "30px" }}>
          <PredictionCard symbol={cleanSymbol} />
          <SentimentCard symbol={cleanSymbol} />
        </section>
      </main>
    </div>
  );
}

export default StockDetails;