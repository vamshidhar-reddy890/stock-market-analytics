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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
            margin: "20px 0 25px 0"
          }}
        >
          {/* Category Tabs */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {[
              { id: "all", label: `All Equities (${allSymbols.length})` },
              { id: "ustech", label: `US Tech (${usTech.length})` },
              { id: "usblue", label: `US Bluechips (${usBluechips.length})` },
              { id: "india", label: `Indian Equities (${indianStocks.length})` },
              { id: "gainers", label: "Top Gainers" },
              { id: "losers", label: "Top Losers" }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "20px",
                  border: filterCategory === cat.id ? "1px solid var(--accent-color, #2563eb)" : "1px solid var(--border-color)",
                  background: filterCategory === cat.id ? "var(--accent-color, #2563eb)" : "var(--card-bg)",
                  color: filterCategory === cat.id ? "#ffffff" : "var(--text-primary)",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div
            style={{
              position: "relative",
              width: "280px"
            }}
          >
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-secondary)"
              }}
            />
            <input
              type="text"
              placeholder="Search 90 stocks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px 9px 36px",
                borderRadius: "20px",
                border: "1px solid var(--border-color)",
                background: "var(--card-bg)",
                color: "var(--text-primary)",
                fontSize: "13px",
                outline: "none"
              }}
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
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Stocks;
