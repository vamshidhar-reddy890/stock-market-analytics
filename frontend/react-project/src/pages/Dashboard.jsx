import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Activity,
  Layers,
  ChevronDown,
  ChevronUp
} from "lucide-react";
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
  const [categoryView, setCategoryView] = useState("all"); // 'all' (split), 'high', 'low'
  const [categoryMetric, setCategoryMetric] = useState("change"); // 'change' (movement) or 'price' (value)
  const [showAllHigh, setShowAllHigh] = useState(false);
  const [showAllLow, setShowAllLow] = useState(false);
  const navigate = useNavigate();

  // Load all 90 tracked stocks so the ticker tape and analysis have the complete universe
  const { stocks, loading, error } = useLiveStockData(ALL_TRACKED_SYMBOLS);

  // Compute median price for price-level categorization mode
  const medianPrice = useMemo(() => {
    if (!stocks || stocks.length === 0) return 100;
    const sorted = [...stocks]
      .map((s) => Number(s.price || 0))
      .filter((p) => p > 0)
      .sort((a, b) => a - b);
    return sorted.length > 0 ? sorted[Math.floor(sorted.length / 2)] : 100;
  }, [stocks]);

  // Dynamically separate stocks into High & Low categories in real-time as prices tick
  const { highStocks, lowStocks } = useMemo(() => {
    const high = [];
    const low = [];

    stocks.forEach((stock) => {
      let isHigh = false;
      if (categoryMetric === "price") {
        isHigh = Number(stock.price || 0) >= medianPrice;
      } else {
        // Price Movement: Low-to-High (gainers, positive) vs High-to-Low (dippers, negative)
        isHigh = Number(stock.change ?? 0) >= 0;
      }

      if (isHigh) {
        high.push({ ...stock, category: "high" });
      } else {
        low.push({ ...stock, category: "low" });
      }
    });

    // Sort High: highest gain % or highest price
    high.sort((a, b) => {
      if (categoryMetric === "price") return (b.price || 0) - (a.price || 0);
      return (b.changePercent || 0) - (a.changePercent || 0);
    });

    // Sort Low: biggest dip % or lowest price
    low.sort((a, b) => {
      if (categoryMetric === "price") return (a.price || 0) - (b.price || 0);
      return (a.changePercent || 0) - (b.changePercent || 0);
    });

    return { highStocks: high, lowStocks: low };
  }, [stocks, categoryMetric, medianPrice]);

  const visibleHigh = showAllHigh ? highStocks : highStocks.slice(0, 8);
  const visibleLow = showAllLow ? lowStocks : lowStocks.slice(0, 8);

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

        {/* Live Dynamic Categorization Banner */}
        <div className="category-live-banner">
          <div className="category-live-badge">
            <span className="live-pulse-dot"></span>
            <span>Real-Time Categorization Active</span>
          </div>
          <div className="category-live-text">
            Stocks dynamically reclassify between <strong>High</strong> (▲) and <strong>Low</strong> (▼) categories as live market prices fluctuate.
          </div>
          <div className="category-live-counts">
            <span className="live-count-tag high">▲ {highStocks.length} High</span>
            <span className="live-count-tag low">▼ {lowStocks.length} Low</span>
          </div>
        </div>

        {/* Categorized Market Equities Header & Controls */}
        <div className="dashboard-category-controls-bar">
          <div className="category-section-main-info">
            <span className="featured-section-title">
              <Sparkles size={16} color="#38bdf8" />
              Categorized Market Equities
            </span>
            <span className="category-subtitle">
              Separated by {categoryMetric === "change" ? "Price Movement (Low-to-High vs High-to-Low)" : `Price Value (Threshold: $${medianPrice.toFixed(0)})`}
            </span>
          </div>

          <div className="category-action-buttons">
            {/* Category Filter Tabs */}
            <div className="category-view-tabs">
              <button
                onClick={() => setCategoryView("all")}
                className={`category-tab-btn ${categoryView === "all" ? "active" : ""}`}
                title="View both High and Low stock categories side-by-side"
              >
                <Layers size={13} />
                <span>Split View ({stocks.length})</span>
              </button>
              <button
                onClick={() => setCategoryView("high")}
                className={`category-tab-btn high ${categoryView === "high" ? "active" : ""}`}
                title="View High Category stocks only"
              >
                <TrendingUp size={13} />
                <span>High Category ({highStocks.length})</span>
              </button>
              <button
                onClick={() => setCategoryView("low")}
                className={`category-tab-btn low ${categoryView === "low" ? "active" : ""}`}
                title="View Low Category stocks only"
              >
                <TrendingDown size={13} />
                <span>Low Category ({lowStocks.length})</span>
              </button>
            </div>

            {/* Mode Switcher: Movement vs Price Level */}
            <div className="category-metric-toggle-wrap">
              <button
                onClick={() => setCategoryMetric((prev) => (prev === "change" ? "price" : "change"))}
                className="btn-secondary category-metric-btn"
                title="Toggle between Price Movement (Gainers/Losers) and Price Value categorization"
              >
                <ArrowUpDown size={13} />
                <span>Criteria: {categoryMetric === "change" ? "Price Movement" : "Price Value"}</span>
              </button>
            </div>

            <button
              onClick={() => navigate("/stocks")}
              className="btn-secondary featured-explore-btn"
            >
              Explore All {stocks.length || 90} Stocks
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* HIGH STOCKS CATEGORY SECTION                                  */}
        {/* ============================================================== */}
        {(categoryView === "all" || categoryView === "high") && (
          <section className="stock-category-group category-high-group">
            <div className="category-group-header high">
              <div className="category-group-title-wrap">
                <div className="category-group-icon-badge high">
                  <TrendingUp size={16} />
                </div>
                <div>
                  <div className="category-group-title-row">
                    <h2 className="category-group-title">High Stocks Category</h2>
                    <span className="category-group-pill high">
                      ▲ {highStocks.length} Equities
                    </span>
                  </div>
                  <p className="category-group-desc">
                    {categoryMetric === "change"
                      ? "Equities with positive movement & upward momentum (price changed Low to High)"
                      : `High-value equities with price at or above median market level ($${medianPrice.toFixed(0)})`}
                  </p>
                </div>
              </div>

              {highStocks.length > 8 && (
                <button
                  onClick={() => setShowAllHigh((prev) => !prev)}
                  className="category-expand-btn high"
                >
                  {showAllHigh ? (
                    <>
                      <span>Show Less</span>
                      <ChevronUp size={13} />
                    </>
                  ) : (
                    <>
                      <span>View All {highStocks.length} High Stocks</span>
                      <ChevronDown size={13} />
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="stock-grid">
              {loading && stocks.length === 0 ? (
                <div className="category-empty-state">
                  Streaming live quotes for market equities...
                </div>
              ) : highStocks.length === 0 ? (
                <div className="category-empty-state">
                  No stocks currently in the High category based on current prices.
                </div>
              ) : (
                visibleHigh.map((stock) => (
                  <StockCard
                    key={`high-${stock.symbol}`}
                    stock={stock}
                    symbol={stock.symbol}
                    company={stock.companyName}
                    price={stock.price || 0}
                    change={stock.change || 0}
                    changePercent={stock.changePercent || 0}
                    category="high"
                  />
                ))
              )}
            </div>
          </section>
        )}

        {/* ============================================================== */}
        {/* LOW STOCKS CATEGORY SECTION                                   */}
        {/* ============================================================== */}
        {(categoryView === "all" || categoryView === "low") && (
          <section className="stock-category-group category-low-group">
            <div className="category-group-header low">
              <div className="category-group-title-wrap">
                <div className="category-group-icon-badge low">
                  <TrendingDown size={16} />
                </div>
                <div>
                  <div className="category-group-title-row">
                    <h2 className="category-group-title">Low Stocks Category</h2>
                    <span className="category-group-pill low">
                      ▼ {lowStocks.length} Equities
                    </span>
                  </div>
                  <p className="category-group-desc">
                    {categoryMetric === "change"
                      ? "Equities undergoing price dip or downward pressure (price changed High to Low)"
                      : `Accessible equities with price below median market level ($${medianPrice.toFixed(0)})`}
                  </p>
                </div>
              </div>

              {lowStocks.length > 8 && (
                <button
                  onClick={() => setShowAllLow((prev) => !prev)}
                  className="category-expand-btn low"
                >
                  {showAllLow ? (
                    <>
                      <span>Show Less</span>
                      <ChevronUp size={13} />
                    </>
                  ) : (
                    <>
                      <span>View All {lowStocks.length} Low Stocks</span>
                      <ChevronDown size={13} />
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="stock-grid">
              {loading && stocks.length === 0 ? (
                <div className="category-empty-state">
                  Streaming live quotes for market equities...
                </div>
              ) : lowStocks.length === 0 ? (
                <div className="category-empty-state">
                  No stocks currently in the Low category based on current prices.
                </div>
              ) : (
                visibleLow.map((stock) => (
                  <StockCard
                    key={`low-${stock.symbol}`}
                    stock={stock}
                    symbol={stock.symbol}
                    company={stock.companyName}
                    price={stock.price || 0}
                    change={stock.change || 0}
                    changePercent={stock.changePercent || 0}
                    category="low"
                  />
                ))
              )}
            </div>
          </section>
        )}

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