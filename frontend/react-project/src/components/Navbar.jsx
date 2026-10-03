import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  LayoutDashboard,
  TrendingUp,
  Briefcase,
  Brain,
  LogOut,
  Search,
  Bell,
  Sun,
  Moon,
  User,
  CheckCheck,
  Activity,
  Newspaper,
  Zap,
  Trash2,
  X,
  Sparkles,
  ArrowUpRight
} from "lucide-react";

import StockLogo from "./StockLogo";
import { ALL_TRACKED_SYMBOLS } from "../constants/stocks";
import { searchStocks } from "../services/stockService";
import {
  getNotifications,
  markAllAsRead as serviceMarkAllRead,
  markOneAsRead as serviceMarkOneRead,
  clearNotifications as serviceClearNotifs
} from "../services/notificationService";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const [isScrolled, setIsScrolled] = useState(false);
  const searchInputRef = useRef(null);
  const searchOverlayRef = useRef(null);

  // Notification Center State (Synced with localStorage & events)
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(() => getNotifications());

  const notifRef = useRef(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const isActive = (path) => {
    return location.pathname === path ? "nav-link active" : "nav-link";
  };

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("authToken");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const searchContainerRef = useRef(null);

  const POPULAR_SUGGESTIONS = [
    { symbol: "NVDA", name: "NVIDIA Corp.", category: "US Tech", tag: "AI Leader 🔥" },
    { symbol: "AAPL", name: "Apple Inc.", category: "US Tech", tag: "Most Active" },
    { symbol: "TSLA", name: "Tesla, Inc.", category: "US Tech", tag: "EV & Tech" },
    { symbol: "MSFT", name: "Microsoft Corp.", category: "US Tech", tag: "Cloud & AI" },
    { symbol: "RELIANCE", name: "Reliance Industries", category: "Indian Giant", tag: "Nifty 50 #1" },
    { symbol: "TCS", name: "Tata Consultancy Services", category: "Indian Giant", tag: "IT Giant" },
    { symbol: "INFY", name: "Infosys Ltd.", category: "Indian Giant", tag: "Global Tech" },
    { symbol: "HDFCBANK", name: "HDFC Bank Ltd.", category: "Indian Giant", tag: "Banking" }
  ];

  // Close search overlay on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchOverlayRef.current && !searchOverlayRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };

    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey && e.key === "k") || (e.key === "/" && document.activeElement?.tagName !== "INPUT")) {
        e.preventDefault();
        setIsSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 60);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, []);

  const handleSelectStock = (symbol) => {
    if (!symbol) return;
    const cleanSym = symbol.trim().toUpperCase();
    navigate(`/stock/${cleanSym}`);
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    const trimmed = query.trim();
    if (trimmed.length > 0) {
      // 1. Instant local matching so results appear in 0ms without delay
      const localMatches = ALL_TRACKED_SYMBOLS
        .filter((s) => s.toLowerCase().startsWith(trimmed.toLowerCase()) || s.toLowerCase().includes(trimmed.toLowerCase()))
        .slice(0, 6)
        .map((s) => ({ symbol: s, companyName: s }));

      if (localMatches.length > 0) {
        setSearchResults(localMatches);
      }

      // 2. Fetch rich backend database matches with real company names & live prices
      try {
        const remoteResults = await searchStocks(trimmed);
        if (remoteResults && Array.isArray(remoteResults) && remoteResults.length > 0) {
          setSearchResults(remoteResults.slice(0, 8));
        } else if (localMatches.length > 0) {
          setSearchResults(localMatches);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        if (localMatches.length > 0) {
          setSearchResults(localMatches);
        }
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (searchResults.length > 0 && searchResults[0].symbol) {
        handleSelectStock(searchResults[0].symbol);
      } else if (searchQuery.trim().length > 0) {
        handleSelectStock(searchQuery.trim());
      }
    } else if (e.key === "Escape") {
      setIsSearchOpen(false);
    }
  };

  const [currentUserName, setCurrentUserName] = useState(() => localStorage.getItem("userName") || "User");

  const getUserName = () => {
    return currentUserName;
  };

  const markAllAsRead = () => {
    serviceMarkAllRead();
  };

  const clearAllNotifications = () => {
    serviceClearNotifs();
  };

  const handleNotificationClick = (notif) => {
    serviceMarkOneRead(notif.id);
    setShowNotifications(false);
    if (notif.symbol) {
      navigate(`/stock/${notif.symbol}`);
    } else if (notif.type === "portfolio") {
      navigate("/portfolio");
    }
  };

  useEffect(() => {
    // Check saved theme preference
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);

    // Sync user name
    const handleAuthChange = () => {
      setCurrentUserName(localStorage.getItem("userName") || "User");
    };
    window.addEventListener("user_auth_changed", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    // Scroll handler for navbar shadow
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    // Notification updates listener
    const handleNotifUpdate = () => {
      setNotifications(getNotifications());
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("market_notifications_updated", handleNotifUpdate);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("market_notifications_updated", handleNotifUpdate);
      window.removeEventListener("user_auth_changed", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  return (
    <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
      {/* LEFT: Logo + Navigation */}
      <div className="nav-left">
        <Link to="/dashboard" className="nav-logo" style={{ textDecoration: "none", color: "inherit" }}>
          <BarChart3 size={28} />
          <span>StockAnalytics</span>
        </Link>

        <div className="nav-links">
          <Link to="/dashboard" className={isActive("/dashboard")}>
            <LayoutDashboard size={18} />
            Dash
          </Link>

          <Link to="/stocks" className={location.pathname === "/stocks" || location.pathname.startsWith("/stock/") ? "nav-link active" : "nav-link"}>
            <TrendingUp size={18} />
            Stocks
          </Link>

          <Link to="/prediction" className={isActive("/prediction")}>
            <Brain size={18} />
            Predictions
          </Link>

          <Link to="/portfolio" className={isActive("/portfolio")}>
            <Briefcase size={18} />
            Portfolio
          </Link>
        </div>
      </div>

      {/* CENTER: Single Clean Search Bar */}
      <div className="nav-center">
        <div
          className="prime-nav-trigger"
          onClick={() => {
            setIsSearchOpen(true);
            setTimeout(() => searchInputRef.current?.focus(), 60);
          }}
          role="button"
          tabIndex={0}
        >
          <Search size={16} className="prime-trigger-icon" />
          <span>Search stocks...</span>
          <kbd className="prime-trigger-kbd">Ctrl+K</kbd>
        </div>
      </div>

      {/* RIGHT: Notifications, User, Theme */}
      <div className="nav-right">
        {/* Interactive Notifications Container */}
        <div className="notifications-container" ref={notifRef}>
          <button
            className="nav-icon-button"
            title="Notifications"
            onClick={() => setShowNotifications((prev) => !prev)}
            aria-label="View notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="notifications-header">
                <h3>
                  <Bell size={16} /> Market Alerts
                  {unreadCount > 0 && (
                    <span style={{ fontSize: "11px", fontWeight: 500, color: "var(--primary)" }}>
                      ({unreadCount} new)
                    </span>
                  )}
                </h3>
                <div style={{ display: "flex", gap: "8px" }}>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} title="Mark all read">
                      <CheckCheck size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "3px" }} />
                      Mark read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button onClick={clearAllNotifications} title="Clear all alerts">
                      <Trash2 size={13} style={{ display: "inline", verticalAlign: "middle" }} />
                    </button>
                  )}
                </div>
              </div>

              <div className="notifications-list">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`notification-item ${!notif.read ? "unread" : ""}`}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <div className={`notification-icon-wrap ${notif.type}`}>
                        {notif.type === "prediction" && <Brain size={16} />}
                        {notif.type === "sentiment" && <Newspaper size={16} />}
                        {notif.type === "indicator" && <Activity size={16} />}
                        {notif.type === "system" && <Zap size={16} />}
                      </div>

                      <div className="notification-content">
                        <div className="notification-title">{notif.title}</div>
                        <div className="notification-desc">{notif.desc}</div>
                        <div className="notification-time">{notif.time}</div>
                      </div>

                      {!notif.read && <div className="notification-unread-dot" />}
                    </div>
                  ))
                ) : (
                  <div className="notifications-empty">
                    <p>No new notifications</p>
                    <small style={{ color: "var(--text-tertiary)" }}>All market alerts are up to date.</small>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="user-profile">
          <div className="user-avatar">
            <User size={20} />
          </div>
          <span className="user-name">{getUserName()}</span>
        </div>

        {/* Mobile Search Button (visible only <= 800px) */}
        <button
          className="nav-icon-button mobile-search-btn"
          title="Search Stocks"
          onClick={() => {
            setIsSearchOpen(true);
            setTimeout(() => searchInputRef.current?.focus(), 60);
          }}
          aria-label="Search stocks"
        >
          <Search size={18} />
        </button>

        <button
          className="nav-icon-button theme-toggle"
          onClick={toggleTheme}
          title={theme === "light" ? "Switch to dark" : "Switch to light"}
        >
          {theme === "light" ? (
            <Sun size={18} />
          ) : (
            <Moon size={18} />
          )}
        </button>

        <button onClick={handleLogout} className="logout-button">
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {/* PRIME VIDEO FLOATING SEARCH SYSTEM (MATCHING USER SCREENSHOT) */}
      {isSearchOpen && (
        <div className="prime-search-overlay">
          <div className="prime-search-card" ref={searchOverlayRef}>
            {/* The signature 2px white-bordered input box matching the user's photo */}
            <div className="prime-search-input-wrapper">
              <Search size={18} className="prime-search-icon" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                autoFocus
              />
              {searchQuery ? (
                <button
                  type="button"
                  className="prime-search-clear"
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                    searchInputRef.current?.focus();
                  }}
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              ) : (
                <span className="prime-shortcut-badge">ESC to close</span>
              )}
            </div>

            {/* Dropdown Suggestions & Results */}
            <div className="prime-search-body">
              {!searchQuery.trim() ? (
                <>
                  <div className="search-suggestions-header">
                    <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--accent, #38bdf8)" }}>
                      <Sparkles size={14} />
                      Suggested Equities
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                      Popular Market Leaders
                    </span>
                  </div>

                  <div className="search-category-chips">
                    <button
                      type="button"
                      className="search-chip"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        navigate("/stocks");
                        setIsSearchOpen(false);
                      }}
                    >
                      All 90 Equities Directory →
                    </button>
                    <button
                      type="button"
                      className="search-chip"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSearchQuery("Tech");
                        handleSearchChange({ target: { value: "Tech" } });
                      }}
                    >
                      US Tech
                    </button>
                    <button
                      type="button"
                      className="search-chip"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSearchQuery("Bank");
                        handleSearchChange({ target: { value: "Bank" } });
                      }}
                    >
                      Banking
                    </button>
                  </div>

                  {POPULAR_SUGGESTIONS.map((stock) => (
                    <div
                      key={stock.symbol}
                      className="search-item"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectStock(stock.symbol);
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                        <StockLogo symbol={stock.symbol} size={28} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span className="search-symbol">{stock.symbol}</span>
                            <span className="search-tag-badge">{stock.tag}</span>
                          </div>
                          <div className="search-name">{stock.name}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: "11px", color: "var(--text-tertiary)", display: "flex", alignItems: "center", gap: "4px" }}>
                        View
                        <ArrowUpRight size={13} />
                      </span>
                    </div>
                  ))}

                  <div className="search-footer-hint">
                    <span>💡 Type to search across 90 assets or click any suggestion</span>
                    <span>ESC to close</span>
                  </div>
                </>
              ) : searchResults.length > 0 ? (
                <>
                  <div className="search-suggestions-header">
                    <span>Matching Stocks ({searchResults.length})</span>
                    <span>Press Enter to select</span>
                  </div>
                  {searchResults.map((stock) => (
                    <div
                      key={stock.id || stock.symbol}
                      className="search-item"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectStock(stock.symbol);
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                        <StockLogo symbol={stock.symbol} size={26} />
                        <div style={{ minWidth: 0 }}>
                          <div className="search-symbol">{stock.symbol}</div>
                          <div
                            className="search-name"
                            style={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: "260px"
                            }}
                          >
                            {stock.companyName || stock.symbol}
                          </div>
                        </div>
                      </div>
                      {stock.price ? (
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: "700",
                            color: "#ffffff",
                            marginLeft: "8px",
                            whiteSpace: "nowrap"
                          }}
                        >
                          ${Number(stock.price).toFixed(2)}
                        </span>
                      ) : null}
                    </div>
                  ))}
                </>
              ) : (
                <div className="search-no-results">No stocks found matching "{searchQuery}"</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION BAR (Fixed at bottom for mobile screens) */}
      <div className="mobile-bottom-nav">
        <Link to="/dashboard" className={`mobile-nav-item ${location.pathname === "/dashboard" ? "active" : ""}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </Link>
        <Link to="/stocks" className={`mobile-nav-item ${location.pathname === "/stocks" || location.pathname.startsWith("/stock/") ? "active" : ""}`}>
          <TrendingUp size={20} />
          <span>Stocks</span>
        </Link>
        <Link to="/prediction" className={`mobile-nav-item ${location.pathname === "/prediction" ? "active" : ""}`}>
          <Brain size={20} />
          <span>Predict</span>
        </Link>
        <Link to="/portfolio" className={`mobile-nav-item ${location.pathname === "/portfolio" ? "active" : ""}`}>
          <Briefcase size={20} />
          <span>Portfolio</span>
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
