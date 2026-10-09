import { useState, useMemo } from "react";
import { TrendingUp, Search, SlidersHorizontal, Sparkles, ArrowRight } from "lucide-react";
import Navbar from "../components/Navbar";
import StockCard from "../components/StockCard";
import StockTicker from "../components/StockTicker";
import { useLiveStockData } from "../hooks/useLiveStockData";
import {
  US_TECH_SYMBOLS,
  US_BLUECHIP_SYMBOLS,
  INDIAN_SYMBOLS,
  ALL_TRACKED_SYMBOLS
} from "../constants/stocks";

function Stocks() {
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const usTech = US_TECH_SYMBOLS;
  const usBluechips = US_BLUECHIP_SYMBOLS;
  const indianStocks = INDIAN_SYMBOLS;
  const allSymbols = ALL_TRACKED_SYMBOLS;

  const { stocks, loading, error } = useLiveStockData(allSymbols);

  const filteredStocks = useMemo(() => {
    return stocks.filter((stock) => {
      const sym = (stock.symbol || "").toUpperCase();
      const name = (stock.companyName || "").toLowerCase();
      const q = searchQuery.trim().toLowerCase();

      const matchesSearch =
        q === "" ||
        sym.toLowerCase().includes(q) ||
        name.includes(q);

      if (!matchesSearch) return false;

      if (filterCategory === "ustech") return usTech.includes(sym);
      if (filterCategory === "usblue") return usBluechips.includes(sym);
      if (filterCategory === "india") return indianStocks.includes(sym);
      if (filterCategory === "gainers") return stock.change >= 0;
      if (filterCategory === "losers") return stock.change < 0;

      return true;
    });
  }, [stocks, filterCategory, searchQuery, usTech, usBluechips, indianStocks]);

  return (
    <div className="app">
      <Navbar />

      {/* Horizontal live ticker with ALL tracked stocks */}
      <div className="stock-ticker-container">
        <StockTicker stocks={stocks} loading={loading} error={error} />
      </div>

      <main className="dashboard">
        <div className="page-heading">
          <div>
            <h1>Global Stock Directory</h1>
            <p>Explore all 90 tracked equities across US & Indian markets with real-time live prices & brand logos</p>
          </div>

          <div className="market-status">
            <span></span>
            {stocks.length} Stocks Live
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="stocks-filter-bar">
          {/* Category Tabs */}
          <div className="stocks-filter-chips">
            {[
              { id: "all", label: `All Equities (${allSymbols.length})` },
              { id: "gainers", label: "▲ High Category (Gainers)" },
              { id: "losers", label: "▼ Low Category (Dippers)" },
              { id: "ustech", label: `US Tech (${usTech.length})` },
              { id: "usblue", label: `US Bluechips (${usBluechips.length})` },
              { id: "india", label: `Indian Equities (${indianStocks.length})` }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`stock-filter-chip ${filterCategory === cat.id ? "active" : ""}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="stocks-search-box">
            <Search size={16} className="stocks-search-icon" />
            <input
              type="text"
              placeholder="Search 90 stocks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="stocks-search-input"
            />
          </div>
        </div>

        {/* Side-by-Side Stocks Grid (Same layout as Market Dashboard) */}
        {loading && stocks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-secondary)" }}>
            <p>Streaming real-time live quotes for 90 global assets...</p>
          </div>
        ) : filteredStocks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-secondary)" }}>
            <p>No stocks found matching "{searchQuery}" in this category.</p>
          </div>
        ) : (
          <div className="stocks-grid">
            {filteredStocks.map((stock) => (
              <StockCard
                key={stock.symbol}
                stock={stock}
                symbol={stock.symbol}
                company={stock.companyName}
                price={stock.price}
                change={stock.change}
                changePercent={stock.changePercent}
                category={stock.change >= 0 ? "high" : "low"}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Stocks;
