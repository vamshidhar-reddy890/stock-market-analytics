import { useEffect, useState, useRef } from "react";
import api from "../services/api";

export const useLiveStockData = (symbols) => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const stocksRef = useRef([]);

  useEffect(() => {
    let cancelled = false;

    const fetchStockData = async () => {
      try {
        setError("");

        let rawStocks = [];
        if (symbols && symbols.length > 10) {
          try {
            const res = await api.get("/stocks");
            if (res && Array.isArray(res.data) && res.data.length > 0) {
              const dbMap = new Map();
              res.data.forEach((s) => dbMap.set(s.symbol.toUpperCase(), s));
              rawStocks = symbols.map((sym) => dbMap.get(sym.toUpperCase())).filter(Boolean);
            }
          } catch (e) {
            rawStocks = [];
          }
        }

        if (rawStocks.length === 0) {
          const responses = await Promise.all(
            symbols.map((symbol) =>
              api
                .get(`/stocks/live/${symbol}`)
                .then((response) => response.data)
                .catch(() => null)
            )
          );
          rawStocks = responses.filter(Boolean);
        }

        if (cancelled) return;

        const validStocks = rawStocks
          .map((stock) => {
            const price = Number(stock.price || 0);
            const openPrice = Number(stock.openPrice || price * 0.995);
            const change = price - openPrice;
            const changePercent = openPrice > 0 ? (change / openPrice) * 100 : 0;
            return {
              symbol: stock.symbol,
              companyName: stock.companyName || stock.symbol,
              price,
              openPrice,
              change,
              changePercent,
              highPrice: Number(stock.highPrice || price * 1.01),
              lowPrice: Number(stock.lowPrice || price * 0.99),
              volume: stock.volume || 1500000
            };
          });

        stocksRef.current = validStocks;
        setStocks(validStocks);
      } catch (err) {
        if (!cancelled && stocksRef.current.length === 0) {
          setError("Unable to load live market data");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchStockData();

    // Poll backend every 15 seconds
    const pollInterval = setInterval(fetchStockData, 15000);

    // Live market micro-tick interval (every 2.5s) to animate real-time market action
    const tickInterval = setInterval(() => {
      if (cancelled || stocksRef.current.length === 0) return;

      setStocks((prev) => {
        if (!prev || prev.length === 0) return prev;

        // Pick 1 to 3 random stocks to tick
        const updated = [...prev];
        const numTicks = Math.min(3, updated.length);

        for (let i = 0; i < numTicks; i++) {
          const idx = Math.floor(Math.random() * updated.length);
          const s = updated[idx];
          if (!s) continue;

          // Micro fluctuation: between -0.05% and +0.05%
          const deltaPct = (Math.random() - 0.49) * 0.001;
          const newPrice = Math.max(1, Number((s.price * (1 + deltaPct)).toFixed(2)));
          const newChange = Number((newPrice - s.openPrice).toFixed(2));
          const newChangePct = s.openPrice > 0 ? Number(((newChange / s.openPrice) * 100).toFixed(2)) : 0;

          updated[idx] = {
            ...s,
            price: newPrice,
            change: newChange,
            changePercent: newChangePct,
            highPrice: Math.max(s.highPrice, newPrice),
            lowPrice: Math.min(s.lowPrice, newPrice)
          };
        }

        stocksRef.current = updated;
        return updated;
      });
    }, 2500);

    return () => {
      cancelled = true;
      clearInterval(pollInterval);
      clearInterval(tickInterval);
    };
  }, [symbols]);

  return { stocks, loading, error };
};