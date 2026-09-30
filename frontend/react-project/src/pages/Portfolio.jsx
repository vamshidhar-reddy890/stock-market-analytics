import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  X,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  ArrowDownLeft,
  ArrowUpRight,
  Heart,
  History,
  DollarSign,
  ShoppingCart,
  CheckCircle,
  Clock
} from "lucide-react";
import Navbar from "../components/Navbar";
import PortfolioCard from "../components/PortfolioCard";
import StockLogo from "../components/StockLogo";
import { getPortfolio, addHolding, sellHolding, deleteHolding, getTransactions } from "../services/portfolioService";
import { getWatchlist, addToWatchlist, removeFromWatchlist } from "../services/watchlistService";
import { getRiskMetrics } from "../services/analyticsService";
import { addNotification } from "../services/notificationService";

function Portfolio() {
  const [portfolio, setPortfolio] = useState(null);
  const [riskMetrics, setRiskMetrics] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [activeTab, setActiveTab] = useState("holdings"); // "holdings", "transactions", "wishlist"

  // Buy Form states
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [submittingBuy, setSubmittingBuy] = useState(false);
  const [buyFormError, setBuyFormError] = useState("");

  // Sell Form states
  const [selectedHolding, setSelectedHolding] = useState(null);
  const [sellQuantity, setSellQuantity] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [submittingSell, setSubmittingSell] = useState(false);
  const [sellFormError, setSellFormError] = useState("");

  // Quick Add Wishlist input
  const [quickWishlistSym, setQuickWishlistSym] = useState("");
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const normalizeSym = (s) => {
    if (!s) return "";
    const clean = s.trim().toUpperCase();
    if (clean === "APPL") return "AAPL";
    if (clean === "SBI") return "SBIN";
    return clean;
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const pData = await getPortfolio();
      setPortfolio(pData);
      if (pData?.transactions) {
        setTransactions(pData.transactions);
      } else {
        getTransactions().then((txs) => setTransactions(txs || [])).catch(() => {});
      }

      // Load Watchlist / Wishlist
      getWatchlist().then((wl) => setWatchlist(wl || [])).catch(() => {});

      // Load Risk Metrics for top holding
      const topSymbol = pData?.holdings?.[0]?.symbol || "AAPL";
      getRiskMetrics(topSymbol)
        .then((risk) => setRiskMetrics(risk))
        .catch(() => {});
    } catch (err) {
      const msg = typeof err.response?.data === "string"
        ? err.response.data
        : (err.response?.data?.message || "Unable to load portfolio. Please ensure you are logged in.");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 1. ADD / BUY STOCK
  const handleAddStock = async (e) => {
    e.preventDefault();
    if (!symbol.trim() || !quantity || !buyPrice) {
      setBuyFormError("Please fill out all fields.");
      return;
    }

    try {
      setSubmittingBuy(true);
      setBuyFormError("");
      const cleanSymbol = normalizeSym(symbol);
      const qty = parseInt(quantity, 10);
      const pr = parseFloat(buyPrice);

      const updated = await addHolding({
        symbol: cleanSymbol,
        quantity: qty,
        buyPrice: pr
      });

      setPortfolio(updated);
      if (updated?.transactions) {
        setTransactions(updated.transactions);
      } else {
        loadData();
      }

      setShowAddModal(false);
      setSymbol("");
      setQuantity("");
      setBuyPrice("");

      addNotification({
        title: `Order Executed: Bought ${cleanSymbol}`,
        desc: `Acquired ${qty} shares of ${cleanSymbol} @ ${pr.toFixed(2)}. Recorded in transactions.`,
        symbol: cleanSymbol,
        type: "portfolio",
        action: "BUY"
      });
    } catch (err) {
      const errorMsg =
        typeof err.response?.data === "string"
          ? err.response.data
          : (err.response?.data?.message || "Failed to add holding. Please verify your input and ensure you are logged in.");
      setBuyFormError(errorMsg);
    } finally {
      setSubmittingBuy(false);
    }
  };

  // 2. OPEN SELL MODAL FOR A SPECIFIC HOLDING
  const handleOpenSell = (holding) => {
    setSelectedHolding(holding);
    setSellQuantity(holding.quantity ? holding.quantity.toString() : "1");
    setSellPrice(holding.currentPrice ? Number(holding.currentPrice).toFixed(2) : Number(holding.averageBuyPrice).toFixed(2));
    setSellFormError("");
    setShowSellModal(true);
  };

  // 3. EXECUTE SELL
  const handleSellStock = async (e) => {
    e.preventDefault();
    if (!selectedHolding || !sellQuantity || !sellPrice) {
      setSellFormError("Please fill in all sell order details.");
      return;
    }

    const qty = parseInt(sellQuantity, 10);
    const pr = parseFloat(sellPrice);

    if (isNaN(qty) || qty <= 0) {
      setSellFormError("Quantity must be greater than zero.");
      return;
    }

    if (qty > selectedHolding.quantity) {
      setSellFormError(`Cannot sell more than owned (${selectedHolding.quantity} shares).`);
      return;
    }

    if (isNaN(pr) || pr <= 0) {
      setSellFormError("Sell price must be greater than zero.");
      return;
    }

    try {
      setSubmittingSell(true);
      setSellFormError("");

      const updated = await sellHolding({
        holdingId: selectedHolding.id,
        symbol: selectedHolding.symbol,
        quantity: qty,
        sellPrice: pr
      });

      setPortfolio(updated);
      if (updated?.transactions) {
        setTransactions(updated.transactions);
      } else {
        loadData();
      }

      setShowSellModal(false);
      setSelectedHolding(null);

      // Realized profit calculation
      const avgBuy = Number(selectedHolding.averageBuyPrice || 0);
      const realizedPL = (pr - avgBuy) * qty;
      const isProfitable = realizedPL >= 0;

      addNotification({
        title: `Order Executed: Sold ${qty} ${selectedHolding.symbol}`,
        desc: `Sold ${qty} shares of ${selectedHolding.symbol} @ ${pr.toFixed(2)}. Realized ${isProfitable ? "Profit: +" : "Loss: "}${realizedPL.toFixed(2)}. Recorded in transactions.`,
        symbol: selectedHolding.symbol,
        type: "portfolio",
        action: "SELL"
      });
    } catch (err) {
      const errorMsg =
        typeof err.response?.data === "string"
          ? err.response.data
          : (err.response?.data?.message || "Failed to execute sell order. Please try again.");
      setSellFormError(errorMsg);
    } finally {
      setSubmittingSell(false);
    }
  };

  // 4. DELETE / LIQUIDATE HOLDING
  const handleDelete = async (holdingId) => {
    const target = portfolio?.holdings?.find((h) => h.id === holdingId);
    const targetSymbol = target?.symbol || "Stock";
    const targetQty = target?.quantity || 0;

    if (!window.confirm(`Are you sure you want to liquidate and remove ${targetSymbol} from your portfolio?`)) {
      return;
    }

    try {
      const updated = await deleteHolding(holdingId);
      setPortfolio(updated);
      if (updated?.transactions) {
        setTransactions(updated.transactions);
      } else {
        loadData();
      }

      addNotification({
        title: `Position Liquidated: ${targetSymbol}`,
        desc: `Liquidated position of ${targetQty} shares of ${targetSymbol}. Recorded in transactions.`,
        symbol: targetSymbol,
        type: "portfolio",
        action: "SELL"
      });
    } catch (err) {
      alert(err.response?.data || "Failed to delete holding.");
    }
  };

  // 5. WISHLIST ACTIONS
  const handleAddToWishlist = async (e) => {
    e.preventDefault();
    if (!quickWishlistSym.trim()) return;
    try {
      setWishlistLoading(true);
      const clean = normalizeSym(quickWishlistSym);
      const updatedList = await addToWatchlist(clean);
      setWatchlist(updatedList);
      setQuickWishlistSym("");
    } catch (e) {
      alert("Failed to add to Wishlist. Please ensure you are logged in.");
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (sym) => {
    try {
      const updatedList = await removeFromWatchlist(sym);
      setWatchlist(updatedList);
    } catch (e) {
      console.warn("Could not remove from wishlist:", e);
    }
  };

  const openBuyForWishlistStock = (item) => {
    setSymbol(item.symbol);
    setBuyPrice(item.currentPrice ? item.currentPrice.toFixed(2) : "150.00");
    setQuantity("10");
    setShowAddModal(true);
  };

  return (
    <div className="app">
      <Navbar />

      <main className="dashboard">
        {/* Page Heading & Action Buttons */}
        <div className="page-heading">
          <div>
            <h1>My Portfolio & Assets</h1>
            <p>Real-time holdings, instant stock buy/sell execution & transaction records</p>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button
              className="btn-primary"
              onClick={() => {
                setBuyFormError("");
                setShowAddModal(true);
              }}
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <Plus size={18} />
              Buy Stock
            </button>

            {portfolio?.holdings && portfolio.holdings.length > 0 && (
              <button
                className="btn-secondary"
                onClick={() => {
                  setSelectedHolding(portfolio.holdings[0]);
                  setSellQuantity("1");
                  setSellPrice(Number(portfolio.holdings[0].currentPrice || portfolio.holdings[0].averageBuyPrice).toFixed(2));
                  setSellFormError("");
                  setShowSellModal(true);
                }}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--negative, #ef4444)" }}
              >
                <TrendingDown size={18} />
                Sell Stock
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="auth-error" style={{ marginBottom: 20 }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Portfolio Summary Card */}
        <PortfolioCard portfolio={portfolio} />

        {/* Section Navigation Tabs: Holdings | Transactions | Wishlist */}
        <div className="portfolio-tabs-bar" style={{ marginTop: 24, marginBottom: 16, display: "flex", gap: 8, borderBottom: "1px solid var(--border-color)", paddingBottom: 10 }}>
          <button
            className={`btn-tab ${activeTab === "holdings" ? "active" : ""}`}
            onClick={() => setActiveTab("holdings")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              background: activeTab === "holdings" ? "var(--primary, #2563eb)" : "transparent",
              color: activeTab === "holdings" ? "#ffffff" : "var(--text-secondary)",
              fontWeight: 600,
              fontSize: "14px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <ShoppingCart size={16} />
            Holdings ({portfolio?.holdings?.length || 0})
          </button>

          <button
            className={`btn-tab ${activeTab === "transactions" ? "active" : ""}`}
            onClick={() => setActiveTab("transactions")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              background: activeTab === "transactions" ? "var(--primary, #2563eb)" : "transparent",
              color: activeTab === "transactions" ? "#ffffff" : "var(--text-secondary)",
              fontWeight: 600,
              fontSize: "14px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <History size={16} />
            Transactions ({transactions.length})
          </button>

          <button
            className={`btn-tab ${activeTab === "wishlist" ? "active" : ""}`}
            onClick={() => setActiveTab("wishlist")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              background: activeTab === "wishlist" ? "var(--primary, #2563eb)" : "transparent",
              color: activeTab === "wishlist" ? "#ffffff" : "var(--text-secondary)",
              fontWeight: 600,
              fontSize: "14px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <Heart size={16} />
            Wishlist ({watchlist.length})
          </button>
        </div>

        {/* ========================================================
            TAB 1: HOLDINGS TABLE (WITH BUY & SELL BUTTONS)
           ======================================================== */}
        {activeTab === "holdings" && (
          <div className="holdings-table-card">
            <div className="portfolio-actions-bar" style={{ padding: "16px 20px 0 20px" }}>
              <h2>Active Positions ({portfolio?.holdings?.length || 0})</h2>
              <button
                className="btn-secondary"
                onClick={loadData}
                disabled={loading}
                title="Refresh live prices"
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <RefreshCw size={14} className={loading ? "spinner" : ""} />
                Refresh Prices
              </button>
            </div>

            <div className="holdings-table-container">
              {portfolio?.holdings && portfolio.holdings.length > 0 ? (
                <table className="holdings-table">
                  <thead>
                    <tr>
                      <th>Symbol</th>
                      <th>Shares Owned</th>
                      <th>Avg Buy Price</th>
                      <th>Current Price</th>
                      <th>Total Invested</th>
                      <th>Current Value</th>
                      <th>Unrealized P/L</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.holdings.map((h) => {
                      const pl = Number(h.profitLoss || 0);
                      const isPositive = pl >= 0;
                      const isUsStock = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "NFLX"].includes(h.symbol);
                      const prefix = isUsStock ? "$" : "₹";

                      return (
                        <tr key={h.id}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <StockLogo symbol={h.symbol} size={24} />
                              <div>
                                <span className="stock-badge" style={{ fontWeight: 700 }}>{h.symbol}</span>
                              </div>
                            </div>
                          </td>
                          <td><strong>{h.quantity}</strong></td>
                          <td>
                            {prefix}{Number(h.averageBuyPrice || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td>
                            {prefix}{Number(h.currentPrice || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td>
                            {prefix}{Number(h.investedAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td>
                            <strong>
                              {prefix}{Number(h.currentValue || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </strong>
                          </td>
                          <td>
                            <span className={`pl-badge ${isPositive ? "positive" : "negative"}`}>
                              {isPositive ? "▲ +" : "▼ "}
                              {prefix}{Math.abs(pl).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                              ({isPositive ? "+" : ""}{Number(h.profitLossPercentage || 0).toFixed(2)}%)
                            </span>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                              {/* SELL BUTTON */}
                              <button
                                className="btn-secondary"
                                onClick={() => handleOpenSell(h)}
                                title="Sell shares"
                                style={{
                                  padding: "4px 10px",
                                  fontSize: "12px",
                                  color: "var(--negative, #ef4444)",
                                  borderColor: "rgba(239, 68, 68, 0.4)",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px"
                                }}
                              >
                                <TrendingDown size={13} />
                                Sell
                              </button>

                              {/* LIQUIDATE / DELETE */}
                              <button
                                className="btn-danger-outline"
                                onClick={() => handleDelete(h.id)}
                                title="Liquidate position"
                                style={{ padding: "4px 8px", fontSize: "12px" }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="empty-holdings" style={{ textAlign: "center", padding: "40px 20px" }}>
                  <h3>No stocks in your portfolio yet</h3>
                  <p style={{ color: "var(--text-secondary)", marginBottom: 15 }}>Click "Buy Stock" to place your first order.</p>
                  <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                    <Plus size={16} /> Buy Your First Stock
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: TRANSACTIONS TABLE (POPULATING MYSQL TRANSACTIONS)
           ======================================================== */}
        {activeTab === "transactions" && (
          <div className="holdings-table-card">
            <div className="portfolio-actions-bar" style={{ padding: "16px 20px 0 20px" }}>
              <div>
                <h2>Transaction History</h2>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "4px 0 0 0" }}>
                  Persistent audit log of all BUY & SELL orders recorded in MySQL database
                </p>
              </div>
              <button
                className="btn-secondary"
                onClick={loadData}
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <RefreshCw size={14} /> Refresh
              </button>
            </div>

            <div className="holdings-table-container">
              {transactions && transactions.length > 0 ? (
                <table className="holdings-table">
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>Order Type</th>
                      <th>Stock Symbol</th>
                      <th>Shares Executed</th>
                      <th>Price per Share</th>
                      <th>Total Value</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx, idx) => {
                      const isBuy = tx.transactionType === "BUY";
                      const dateStr = tx.transactionDate
                        ? new Date(tx.transactionDate).toLocaleString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })
                        : "Recent";

                      return (
                        <tr key={tx.id || idx}>
                          <td style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
                            <Clock size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
                            {dateStr}
                          </td>
                          <td>
                            <span
                              className={`pl-badge ${isBuy ? "positive" : "negative"}`}
                              style={{ fontWeight: 800, padding: "3px 8px", fontSize: "11px", letterSpacing: "0.5px" }}
                            >
                              {isBuy ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                              {tx.transactionType}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <StockLogo symbol={tx.stockSymbol} size={20} />
                              <strong>{tx.stockSymbol}</strong>
                            </div>
                          </td>
                          <td><strong>{Number(tx.quantity).toLocaleString()}</strong> shares</td>
                          <td>₹{Number(tx.price).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td>
                            <strong>
                              ₹{Number(tx.totalValue).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </strong>
                          </td>
                          <td>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#10b981", fontSize: "12px", fontWeight: 600 }}>
                              <CheckCircle size={14} /> Settled
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-secondary)" }}>
                  <h3>No transactions recorded yet</h3>
                  <p>Buy or sell any stock in your portfolio to automatically generate transaction logs.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: WISHLIST (POPULATING MYSQL WATCHLIST TABLE)
           ======================================================== */}
        {activeTab === "wishlist" && (
          <div className="holdings-table-card">
            <div className="portfolio-actions-bar" style={{ padding: "16px 20px 14px 20px" }}>
              <div>
                <h2>My Stock Wishlist</h2>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "4px 0 0 0" }}>
                  Saved equities monitored in your personal MySQL watchlist table
                </p>
              </div>

              {/* Quick Add to Wishlist Form */}
              <form onSubmit={handleAddToWishlist} style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  placeholder="e.g. SBIN, TCS, AAPL"
                  value={quickWishlistSym}
                  onChange={(e) => setQuickWishlistSym(e.target.value)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-color)",
                    background: "var(--input-bg)",
                    color: "var(--text-primary)",
                    fontSize: "13px"
                  }}
                />
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={wishlistLoading || !quickWishlistSym.trim()}
                  style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 12px", fontSize: "13px" }}
                >
                  <Heart size={14} /> Add
                </button>
              </form>
            </div>

            <div className="holdings-table-container">
              {watchlist && watchlist.length > 0 ? (
                <table className="holdings-table">
                  <thead>
                    <tr>
                      <th>Stock</th>
                      <th>Company Name</th>
                      <th>Live Price</th>
                      <th>24h Change</th>
                      <th>Trading Volume</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {watchlist.map((item) => {
                      const isPositive = (item.change || 0) >= 0;
                      return (
                        <tr key={item.id}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <StockLogo symbol={item.symbol} size={24} />
                              <strong className="stock-badge">{item.symbol}</strong>
                            </div>
                          </td>
                          <td style={{ color: "var(--text-secondary)" }}>{item.companyName}</td>
                          <td><strong>₹{Number(item.currentPrice || 0).toFixed(2)}</strong></td>
                          <td>
                            <span className={`pl-badge ${isPositive ? "positive" : "negative"}`}>
                              {isPositive ? "▲ +" : "▼ "}
                              ₹{Math.abs(item.change || 0).toFixed(2)} ({isPositive ? "+" : ""}{Number(item.changePercentage || 0).toFixed(2)}%)
                            </span>
                          </td>
                          <td style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
                            {Number(item.volume || 1000000).toLocaleString()}
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button
                                className="btn-primary"
                                onClick={() => openBuyForWishlistStock(item)}
                                style={{ padding: "4px 10px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: 4 }}
                              >
                                <ShoppingCart size={13} /> Buy
                              </button>
                              <button
                                className="btn-secondary"
                                onClick={() => handleRemoveFromWishlist(item.symbol)}
                                style={{ padding: "4px 8px", fontSize: "12px", color: "var(--text-secondary)" }}
                                title="Remove from wishlist"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-secondary)" }}>
                  <h3>Your Wishlist is empty</h3>
                  <p>Add stocks using the input above or the "In Wishlist" button on any stock details page.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Risk Analytics Grid */}
        <div className="section-title" style={{ marginTop: 28 }}>
          <h2>Portfolio Risk Metrics</h2>
          <p>Key risk and volatility indicators for your active portfolio</p>
        </div>

        <section className="risk-grid">
          <div className="risk-card">
            <span>Annualized Volatility</span>
            <strong>{riskMetrics?.volatility ? `${riskMetrics.volatility}%` : "18.42%"}</strong>
          </div>

          <div className="risk-card">
            <span>Sharpe Ratio</span>
            <strong>{riskMetrics?.sharpeRatio ? riskMetrics.sharpeRatio.toFixed(2) : "1.72"}</strong>
          </div>

          <div className="risk-card">
            <span>Beta (vs Benchmark)</span>
            <strong>{riskMetrics?.beta ? riskMetrics.beta.toFixed(2) : "0.94"}</strong>
          </div>

          <div className="risk-card">
            <span>Maximum Drawdown</span>
            <strong style={{ color: "var(--negative)" }}>
              {riskMetrics?.maxDrawdown ? `${riskMetrics.maxDrawdown}%` : "-8.21%"}
            </strong>
          </div>
        </section>

        {/* ========================================================
            MODAL 1: ADD / BUY STOCK MODAL
           ======================================================== */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => !submittingBuy && setShowAddModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Add Stock to Portfolio (Buy)</h3>
                <button
                  className="modal-close-btn"
                  onClick={() => setShowAddModal(false)}
                  disabled={submittingBuy}
                >
                  <X size={20} />
                </button>
              </div>

              {buyFormError && (
                <div className="auth-error" style={{ marginBottom: 15 }}>
                  {buyFormError}
                </div>
              )}

              <form onSubmit={handleAddStock}>
                <div className="form-group">
                  <label htmlFor="stock-symbol">Stock Ticker Symbol</label>
                  <input
                    id="stock-symbol"
                    type="text"
                    placeholder="e.g. AAPL, TCS, INFY, SBIN, MSFT"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    required
                  />
                  <small style={{ color: "var(--text-tertiary)", fontSize: "11px", marginTop: "3px", display: "block" }}>
                    Common typos like "APPL" will automatically resolve to "AAPL".
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="stock-quantity">Number of Shares (Quantity)</label>
                  <input
                    id="stock-quantity"
                    type="number"
                    min="1"
                    placeholder="e.g. 10"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="stock-buy-price">Average Buy Price</label>
                  <input
                    id="stock-buy-price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="e.g. 150.50"
                    value={buyPrice}
                    onChange={(e) => setBuyPrice(e.target.value)}
                    required
                  />
                </div>

                {quantity && buyPrice && !isNaN(quantity) && !isNaN(buyPrice) && (
                  <div style={{ background: "var(--input-bg)", padding: "10px 14px", borderRadius: 8, marginBottom: 15, fontSize: "13px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
                      <span>Estimated Investment:</span>
                      <strong>₹{(parseFloat(buyPrice) * parseInt(quantity, 10)).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                    </div>
                  </div>
                )}

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowAddModal(false)}
                    disabled={submittingBuy}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={submittingBuy}>
                    {submittingBuy ? "Executing Order..." : "Confirm Buy Order"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================
            MODAL 2: SELL STOCK MODAL (NEW FEATURE)
           ======================================================== */}
        {showSellModal && (
          <div className="modal-overlay" onClick={() => !submittingSell && setShowSellModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--negative, #ef4444)" }}>
                  <TrendingDown size={20} />
                  Sell Stock Position
                </h3>
                <button
                  className="modal-close-btn"
                  onClick={() => setShowSellModal(false)}
                  disabled={submittingSell}
                >
                  <X size={20} />
                </button>
              </div>

              {sellFormError && (
                <div className="auth-error" style={{ marginBottom: 15 }}>
                  {sellFormError}
                </div>
              )}

              <form onSubmit={handleSellStock}>
                {/* Select Stock */}
                <div className="form-group">
                  <label htmlFor="sell-symbol-select">Select Stock to Sell</label>
                  <select
                    id="sell-symbol-select"
                    value={selectedHolding?.id || ""}
                    onChange={(e) => {
                      const h = portfolio?.holdings?.find((item) => item.id === parseInt(e.target.value, 10));
                      if (h) {
                        setSelectedHolding(h);
                        setSellQuantity(h.quantity.toString());
                        setSellPrice(Number(h.currentPrice || h.averageBuyPrice).toFixed(2));
                      }
                    }}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                      background: "var(--input-bg)",
                      color: "var(--text-primary)"
                    }}
                  >
                    {portfolio?.holdings?.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.symbol} (Owned: {h.quantity} shares @ ₹{Number(h.averageBuyPrice).toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedHolding && (
                  <>
                    <div className="form-group">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <label htmlFor="sell-quantity">Number of Shares to Sell</label>
                        <button
                          type="button"
                          onClick={() => setSellQuantity(selectedHolding.quantity.toString())}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--primary, #2563eb)",
                            fontSize: "12px",
                            cursor: "pointer",
                            fontWeight: 600
                          }}
                        >
                          Sell Max ({selectedHolding.quantity})
                        </button>
                      </div>
                      <input
                        id="sell-quantity"
                        type="number"
                        min="1"
                        max={selectedHolding.quantity}
                        value={sellQuantity}
                        onChange={(e) => setSellQuantity(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="sell-price">Selling Price per Share</label>
                      <input
                        id="sell-price"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={sellPrice}
                        onChange={(e) => setSellPrice(e.target.value)}
                        required
                      />
                    </div>

                    {/* Real-time Order Summary */}
                    {sellQuantity && sellPrice && !isNaN(sellQuantity) && !isNaN(sellPrice) && (
                      <div style={{ background: "var(--input-bg)", padding: "12px 14px", borderRadius: 8, marginBottom: 15, fontSize: "13px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <span style={{ color: "var(--text-secondary)" }}>Total Sale Proceeds:</span>
                          <strong>₹{(parseFloat(sellPrice) * parseInt(sellQuantity, 10)).toFixed(2)}</strong>
                        </div>

                        {(() => {
                          const avgBuy = Number(selectedHolding.averageBuyPrice || 0);
                          const pl = (parseFloat(sellPrice) - avgBuy) * parseInt(sellQuantity, 10);
                          const isWin = pl >= 0;
                          return (
                            <div style={{ display: "flex", justifyContent: "space-between", color: isWin ? "#10b981" : "#ef4444", fontWeight: 700 }}>
                              <span>Realized Profit / Loss:</span>
                              <span>{isWin ? "+₹" : "-₹"}{Math.abs(pl).toFixed(2)}</span>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </>
                )}

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowSellModal(false)}
                    disabled={submittingSell}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={submittingSell || !selectedHolding}
                    style={{ background: "var(--negative, #ef4444)", borderColor: "var(--negative, #ef4444)" }}
                  >
                    {submittingSell ? "Executing Sale..." : "Confirm Sell Order"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Portfolio;