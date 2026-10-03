import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import Navbar from "../components/Navbar";
import StockTicker from "../components/StockTicker";
import StockCard from "../components/StockCard";
import LivePrice from "../components/LivePrice";
import StockChart from "../components/StockChart";
import TechnicalIndicators from "../components/TechnicalIndicators";
import PredictionCard from "../components/PredictionCard";
import SentimentCard from "../components/SentimentCard";
import PortfolioCard from "../components/PortfolioCard";
import StockLogo from "../components/StockLogo";
import { useLiveStockData } from "../hooks/useLiveStockData";
import { ALL_TRACKED_SYMBOLS } from "../constants/stocks";

function Dashboard() {
  const [activeSymbol, setActiveSymbol] = useState("AAPL");
  const navigate = useNavigate();

  // Load all 90 tracked stocks so the ticker tape and analysis have the complete universe
  const { stocks, loading, error } = useLiveStockData(ALL_TRACKED_SYMBOLS);

  return (
    <div className="app">
      <Navbar />

      {/* Full-Universe Horizontal Scrolling Live Ticker - All 90 stocks, clickable */}
      <div className="stock-ticker-container">
        <StockTicker
          stocks={stocks}
          loading={loading}
          error={error}
        />
      </div>

      <main className="dashboard">
        <div className="page-heading">
          <div>
            <h1>Market Dashboard</h1>
            <p>Real-time stock market analytics, live quotes & AI predictions</p>
          </div>

          <div className="market-status">
            <span></span>
            Market Live • {stocks.length} Global Equities Tracked
          </div>
        </div>

        {/* Featured Market Leaders Header */}
        <div className="featured-section-header">
          <span className="featured-section-title">
            <Sparkles size={16} color="#38bdf8" />
            Featured Market Equities
          </span>
          <button
            onClick={() => navigate("/stocks")}
            className="btn-secondary featured-explore-btn"
          >
            Explore All {stocks.length || 90} Stocks
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Stock Cards Grid (Side-by-Side) */}
        <section className="stock-grid">
          {stocks.length > 0 ? (
            stocks.slice(0, 12).map((stock) => (
              <StockCard
                key={stock.symbol}
                stock={stock}
                symbol={stock.symbol}
                company={stock.companyName}
                price={stock.price || 0}
                change={stock.change || 0}
                changePercent={stock.changePercent || 0}
              />
            ))
          ) : (
            <div style={{ color: "var(--text-secondary)", padding: 20 }}>
              {loading ? "Streaming live quotes for 90 market equities..." : "No live quotes available"}
            </div>
          )}
        </section>

        {/* Quick Symbol Switcher for Main Chart */}
        <div id="analytics-chart-section" className="asset-switcher-container">
          <div className="asset-switcher-label">
            Selected:
          </div>
          <div className="asset-switcher-scroll">
            {["AAPL", "MSFT", "GOOGL", "TSLA", "NVDA", "BTC", "TCS", "INFY", "RELIANCE", "HDFCBANK"].map((sym) => (
              <button
                key={sym}
                onClick={() => setActiveSymbol(sym)}
                className={`asset-pill-btn ${activeSymbol === sym ? "btn-primary active" : "btn-secondary"}`}
              >
                <StockLogo symbol={sym} size={16} />
                <span>{sym}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => navigate(`/stock/${activeSymbol}`)}
            className="btn-secondary asset-open-details-btn"
          >
            <span>{activeSymbol} Details</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Main Analytics Grid */}
        <section className="main-grid">
          <StockChart symbol={activeSymbol} />
          <LivePrice symbol={activeSymbol} />
        </section>

        {/* Technical Indicators */}
        <TechnicalIndicators symbol={activeSymbol} />

        {/* Prediction + Sentiment */}
        <section className="analytics-grid">
          <PredictionCard symbol={activeSymbol} />
          <SentimentCard symbol={activeSymbol} />
        </section>

        {/* Portfolio Summary */}
        <section className="portfolio-section">
          <PortfolioCard />
        </section>
      </main>
    </div>
  );
}

export default Dashboard;