const STORAGE_KEY = "stockanalytics_notifications";

const DEFAULT_NOTIFICATIONS = [
  {
    id: "notif-welcome-1",
    title: "Market Feed Connected",
    desc: "Twelve Data real-time market stream active with API Key.",
    time: "Just now",
    timestamp: Date.now(),
    read: false,
    symbol: "AAPL",
    type: "system"
  },
  {
    id: "notif-welcome-2",
    title: "AI Forecast Engine Initialized",
    desc: "LSTM, XGBoost & Random Forest 5-day trajectory ready for portfolio analysis.",
    time: "5m ago",
    timestamp: Date.now() - 5 * 60 * 1000,
    read: false,
    symbol: null,
    type: "prediction"
  }
];

export const getNotifications = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
      return DEFAULT_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_NOTIFICATIONS;
  }
};

export const addNotification = ({
  title,
  desc,
  symbol = null,
  type = "system",
  action = null
}) => {
  try {
    const current = getNotifications();
    const newNotif = {
      id: "notif-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      title,
      desc,
      symbol,
      type,
      action,
      time: "Just now",
      timestamp: Date.now(),
      read: false
    };

    const updated = [newNotif, ...current].slice(0, 30); // keep last 30
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Dispatch global event for instant reactivity across all mounted components
    window.dispatchEvent(new CustomEvent("market_notifications_updated", { detail: updated }));
    return newNotif;
  } catch (e) {
    console.error("Failed to save notification", e);
  }
};

export const markAllAsRead = () => {
  try {
    const current = getNotifications();
    const updated = current.map((n) => ({ ...n, read: true }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("market_notifications_updated", { detail: updated }));
    return updated;
  } catch (e) {
    console.error("Failed to mark all read", e);
  }
};

export const markOneAsRead = (id) => {
  try {
    const current = getNotifications();
    const updated = current.map((n) => (n.id === id ? { ...n, read: true } : n));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("market_notifications_updated", { detail: updated }));
    return updated;
  } catch (e) {
    console.error("Failed to mark notification read", e);
  }
};

export const clearNotifications = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    window.dispatchEvent(new CustomEvent("market_notifications_updated", { detail: [] }));
    return [];
  } catch (e) {
    console.error("Failed to clear notifications", e);
  }
};
