import React from "react";

/**
 * High-fidelity SVG Logos and Badges for Global & Indian Stocks and Cryptocurrencies
 * Matches exact reference style (circular badge or crisp brand silhouette)
 */
export function StockLogo({ symbol, size = 36, className = "" }) {
  const cleanSymbol = symbol ? symbol.toUpperCase() : "AAPL";

  // Dedicated brand visual styling
  const renderLogo = () => {
    switch (cleanSymbol) {
      case "AAPL":
        return (
          <svg viewBox="0 0 170 170" width={size} height={size}>
            <path
              fill="currentColor"
              d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.96-14.34-5.77-8.91-10.45-19.34-14.04-31.29-3.59-11.96-5.39-23.4-5.39-34.33 0-14.35 3.6-26.4 10.79-36.14 7.2-9.74 16.29-14.73 27.27-14.97 4.58 0 9.8 1.2 15.66 3.61 5.86 2.42 9.8 3.67 11.81 3.77 1.63 0 5.8-1.33 12.51-3.99 6.72-2.67 12.42-3.88 17.1-3.63 12.63.63 22.84 5.39 30.63 14.28-11.09 6.74-16.52 16.19-16.29 28.34.22 9.58 3.91 17.52 11.07 23.82 7.15 6.31 15.66 9.9 25.53 10.79-2.44 7.42-5.4 14.8-8.88 22.14zM119.22 31.84c0-7.29 2.67-14.19 8.01-20.7 5.34-6.52 12.08-10.74 20.22-12.67.65 1.52.98 3.15.98 4.89 0 7.29-2.78 14.35-8.34 21.18-5.55 6.83-12.39 10.87-20.52 12.12-.22-1.52-.35-3.13-.35-4.82z"
            />
          </svg>
        );

      case "MSFT":
        return (
          <svg viewBox="0 0 24 24" width={size} height={size}>
            <rect x="1" y="1" width="10" height="10" fill="#f25022" rx="1.5" />
            <rect x="13" y="1" width="10" height="10" fill="#7fba00" rx="1.5" />
            <rect x="1" y="13" width="10" height="10" fill="#00a4ef" rx="1.5" />
            <rect x="13" y="13" width="10" height="10" fill="#ffb900" rx="1.5" />
          </svg>
        );

      case "GOOGL":
      case "GOOG":
        return (
          <svg viewBox="0 0 24 24" width={size} height={size}>
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
        );

      case "AMZN":
        return (
          <svg viewBox="0 0 24 24" width={size} height={size}>
            <circle cx="12" cy="12" r="11" fill="#FF9900" />
            <path
              d="M6 13.5c3.5 3 8.5 3 12 0"
              stroke="#111"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            <path d="M16.5 14.5l2-.5-.5-2" fill="#111" />
          </svg>
        );

      case "TSLA":
        return (
          <svg viewBox="0 0 24 24" width={size} height={size}>
            <rect width="24" height="24" rx="5" fill="#E82127" />
            <path
              d="M12 7.5c-2.4 0-4.5.6-6 1.5l.8 1.8c1.3-.7 3.1-1.2 5.2-1.2 2.1 0 3.9.5 5.2 1.2l.8-1.8c-1.5-.9-3.6-1.5-6-1.5zm0 3.2c-1.8 0-3.3.4-4.5 1l.5 1.5c1.1-.5 2.4-.8 4-.8 1.6 0 2.9.3 4 .8l.5-1.5c-1.2-.6-2.7-1-4.5-1zm-.8 3.5v6.5h1.6v-6.5h-1.6z"
              fill="#FFFFFF"
            />
          </svg>
        );

      case "NVDA":
        return (
          <svg viewBox="0 0 24 24" width={size} height={size}>
            <rect width="24" height="24" rx="5" fill="#76B900" />
            <path
              d="M6 15c2.5-4 9.5-4 12 0-2.5 4-9.5 4-12 0zm6-2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"
              fill="#FFFFFF"
            />
          </svg>
        );

      case "META":
        return (
          <svg viewBox="0 0 24 24" width={size} height={size}>
            <rect width="24" height="24" rx="5" fill="#0081FB" />
            <path
              d="M6.2 8.5C4 8.5 2 10.2 2 12.8c0 3.2 2.8 5.7 6.1 5.7 2.2 0 4-1.2 5.1-3 1.1 1.8 2.9 3 5.1 3 3.3 0 6.1-2.5 6.1-5.7 0-2.6-2-4.3-4.2-4.3-2.1 0-3.9 1.4-4.9 3.5-1-2.1-2.8-3.5-4.9-3.5z"
              fill="#FFFFFF"
            />
          </svg>
        );

      case "NFLX":
        return (
          <svg viewBox="0 0 24 24" width={size} height={size}>
            <rect width="24" height="24" rx="5" fill="#141414" />
            <path
              d="M6 4h3.5l5.5 13.5V4h3v16h-3.5L8.5 6.5V20H6V4z"
              fill="#E50914"
            />
          </svg>
        );

      case "AMD":
        return (
          <svg viewBox="0 0 24 24" width={size} height={size}>
            <rect width="24" height="24" rx="5" fill="#000000" />
            <path
              d="M5 6h9l-4 4H5zM5 14h9l-4 4H5zM15 6h4v12h-4z"
              fill="#ED1C24"
            />
          </svg>
        );

      case "INTC":
        return (
          <svg viewBox="0 0 24 24" width={size} height={size}>
            <circle cx="12" cy="12" r="11" fill="#0068B5" />
            <text x="12" y="15" fill="#FFF" fontSize="8" fontWeight="900" textAnchor="middle">intel</text>
          </svg>
        );

      case "BTC":
        return (
          <svg viewBox="0 0 24 24" width={size} height={size}>
            <circle cx="12" cy="12" r="11" fill="#F7931A" />
            <path
              d="M14.5 10.5c.5-.4.8-1 .8-1.7 0-1.5-1.2-2.3-2.8-2.3H9v9h3.8c1.7 0 3-.9 3-2.6 0-1-.5-1.9-1.3-2.4zm-3.5-2.2h1.5c.8 0 1.3.4 1.3 1.1s-.5 1.1-1.3 1.1H11v-2.2zm1.8 5.7H11v-2.3h1.8c.9 0 1.5.5 1.5 1.1 0 .7-.6 1.2-1.5 1.2z"
              fill="#FFFFFF"
            />
          </svg>
        );

      case "ETH":
        return (
          <svg viewBox="0 0 24 24" width={size} height={size}>
            <circle cx="12" cy="12" r="11" fill="#627EEA" />
            <path d="M12 4l-5 8.2 5 2.8 5-2.8L12 4z" fill="#FFFFFF" fillOpacity="0.8" />
            <path d="M12 15l-5-2.8 5 7.8 5-7.8L12 15z" fill="#FFFFFF" />
          </svg>
        );

      // Financials
      case "JPM":
        return (
          <svg viewBox="0 0 24 24" width={size} height={size}>
            <rect width="24" height="24" rx="5" fill="#003B70" />
            <text x="12" y="15" fill="#FFF" fontSize="8" fontWeight="800" textAnchor="middle">JPM</text>
          </svg>
        );

      case "V":
        return (
          <svg viewBox="0 0 24 24" width={size} height={size}>
            <rect width="24" height="24" rx="5" fill="#1A1F71" />
            <text x="12" y="16" fill="#F7B600" fontSize="11" fontStyle="italic" fontWeight="900" textAnchor="middle">VISA</text>
          </svg>
        );

      case "MA":
        return (
          <svg viewBox="0 0 24 24" width={size} height={size}>
            <rect width="24" height="24" rx="5" fill="#222" />
            <circle cx="9" cy="12" r="5" fill="#EB001B" />
            <circle cx="15" cy="12" r="5" fill="#F79E1B" fillOpacity="0.8" />
          </svg>
        );

      case "DIS":
        return (
          <svg viewBox="0 0 24 24" width={size} height={size}>
            <circle cx="12" cy="12" r="11" fill="#113CCF" />
            <text x="12" y="15" fill="#FFF" fontSize="8" fontWeight="900" textAnchor="middle">DIS</text>
          </svg>
        );

      case "WMT":
        return (
          <svg viewBox="0 0 24 24" width={size} height={size}>
            <rect width="24" height="24" rx="5" fill="#0071CE" />
            <circle cx="12" cy="12" r="3" fill="#FFC220" />
          </svg>
        );

      case "MCD":
        return (
          <svg viewBox="0 0 24 24" width={size} height={size}>
            <rect width="24" height="24" rx="5" fill="#DA291C" />
            <text x="12" y="17" fill="#FFC72C" fontSize="13" fontWeight="900" textAnchor="middle">M</text>
          </svg>
        );

      case "KO":
        return (
          <svg viewBox="0 0 24 24" width={size} height={size}>
            <rect width="24" height="24" rx="5" fill="#F40009" />
            <text x="12" y="16" fill="#FFF" fontSize="9" fontWeight="900" fontStyle="italic" textAnchor="middle">Coke</text>
          </svg>
        );

      case "NKE":
        return (
          <svg viewBox="0 0 24 24" width={size} height={size}>
            <rect width="24" height="24" rx="5" fill="#111" />
            <path d="M4 14c4 1 8-2 15-8-6 5-11 7-15 8z" fill="#FFF" />
          </svg>
        );

      case "UBER":
        return (
          <svg viewBox="0 0 24 24" width={size} height={size}>
            <circle cx="12" cy="12" r="11" fill="#000" />
            <text x="12" y="15" fill="#FFF" fontSize="6.5" fontWeight="900" textAnchor="middle">UBER</text>
          </svg>
        );

      // Indian Icons
      case "TCS":
        return (
          <svg viewBox="0 0 24 24" width={size} height={size}>
            <rect width="24" height="24" rx="5" fill="#004A99" />
            <text x="12" y="15" fill="#FFF" fontSize="8" fontWeight="900" textAnchor="middle">TCS</text>
          </svg>
        );

      case "INFY":
        return (
          <svg viewBox="0 0 24 24" width={size} height={size}>
            <rect width="24" height="24" rx="5" fill="#007CC3" />
            <text x="12" y="15" fill="#FFF" fontSize="7.5" fontWeight="800" textAnchor="middle">infy</text>
          </svg>
        );

      case "RELIANCE":
        return (
          <svg viewBox="0 0 24 24" width={size} height={size}>
            <circle cx="12" cy="12" r="11" fill="#002D62" />
            <text x="12" y="15" fill="#FFF" fontSize="7" fontWeight="900" textAnchor="middle">RIL</text>
          </svg>
        );

      case "HDFCBANK":
        return (
          <svg viewBox="0 0 24 24" width={size} height={size}>
            <rect width="24" height="24" rx="5" fill="#004C8F" />
            <rect x="7" y="7" width="10" height="10" fill="#ED1C24" rx="1" />
            <rect x="10" y="5" width="4" height="14" fill="#004C8F" />
            <rect x="5" y="10" width="14" height="4" fill="#004C8F" />
          </svg>
        );

      case "ICICIBANK":
        return (
          <svg viewBox="0 0 24 24" width={size} height={size}>
            <rect width="24" height="24" rx="5" fill="#A42025" />
            <text x="12" y="15" fill="#F47920" fontSize="7.5" fontWeight="900" textAnchor="middle">ICICI</text>
          </svg>
        );

      case "SBIN":
        return (
          <svg viewBox="0 0 24 24" width={size} height={size}>
            <circle cx="12" cy="12" r="11" fill="#280071" />
            <circle cx="12" cy="11" r="5" fill="#00A5DF" />
            <circle cx="12" cy="11" r="2.5" fill="#280071" />
            <rect x="11" y="11" width="2" height="6" fill="#280071" />
          </svg>
        );

      case "TATAMOTORS":
      case "TATASTEEL":
        return (
          <svg viewBox="0 0 24 24" width={size} height={size}>
            <circle cx="12" cy="12" r="11" fill="#004080" />
            <text x="12" y="15" fill="#FFF" fontSize="6.5" fontWeight="900" textAnchor="middle">TATA</text>
          </svg>
        );

      case "BHARTIARTL":
        return (
          <svg viewBox="0 0 24 24" width={size} height={size}>
            <circle cx="12" cy="12" r="11" fill="#E60000" />
            <text x="12" y="15" fill="#FFF" fontSize="6" fontWeight="900" textAnchor="middle">airtel</text>
          </svg>
        );

      case "ITC":
        return (
          <svg viewBox="0 0 24 24" width={size} height={size}>
            <rect width="24" height="24" rx="5" fill="#005B94" />
            <text x="12" y="15" fill="#FFF" fontSize="8" fontWeight="900" textAnchor="middle">ITC</text>
          </svg>
        );

      case "WIPRO":
        return (
          <svg viewBox="0 0 24 24" width={size} height={size}>
            <circle cx="12" cy="12" r="11" fill="#1B365D" />
            <circle cx="8" cy="10" r="1.5" fill="#69BE28" />
            <circle cx="12" cy="8" r="1.5" fill="#F3901D" />
            <circle cx="16" cy="10" r="1.5" fill="#E51937" />
          </svg>
        );

      default: {
        // High quality stylized monogram badge tailored for any stock ticker
        const corporatePalettes = {
          // Tech
          ORCL: "#C74634", CRM: "#00A1E0", CSCO: "#1BA0D7", ADBE: "#FA0F00", IBM: "#052FAD",
          AVGO: "#CC092F", QCOM: "#003366", TXN: "#CC0000", MU: "#003B71", PYPL: "#003087",
          ABNB: "#FF5A5F", SHOP: "#96bf48",
          // Financials
          BAC: "#012169", WFC: "#D71E28", GS: "#7399C6", MS: "#002B49", C: "#002D72", AXP: "#006FCF",
          // Healthcare
          JNJ: "#D51900", PFE: "#000080", MRK: "#00857C", ABBV: "#001E38", LLY: "#D12630", UNH: "#002677", CVS: "#CC0000",
          // Consumer & Energy
          COST: "#005DAA", HD: "#F96302", PEP: "#004B93", XOM: "#EE1C25", CVX: "#005480", COP: "#D62027",
          CAT: "#FFCD00", BA: "#0033A0", GE: "#005587", F: "#003478", GM: "#00539B", T: "#00A8E0", VZ: "#CD040B",
          // Indian
          LT: "#005A9C", AXISBANK: "#97144D", KOTAKBANK: "#ED1C24", HINDUNILVR: "#1F36C7", MARUTI: "#1C355E",
          "M&M": "#E31837", SUNPHARMA: "#E35205", NTPC: "#00529B", POWERGRID: "#0072BC", ADANIENT: "#2A2E6E",
          ADANIPORTS: "#007799", JSWSTEEL: "#003366", TECHM: "#ED1B24", HCLTECH: "#0072CE", ASIANPAINT: "#D9251D",
          BAJFINANCE: "#004B87", BAJAJFINSV: "#005B94", ULTRACEMCO: "#FFC220", TITAN: "#002B49"
        };

        const bg = corporatePalettes[cleanSymbol] || "#2563eb";
        const isLight = bg === "#FFCD00" || bg === "#FFC220";
        const textColor = isLight ? "#111" : "#fff";

        return (
          <div
            style={{
              width: size,
              height: size,
              borderRadius: "50%",
              backgroundColor: bg,
              color: textColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: size * 0.38,
              letterSpacing: -0.5,
              boxShadow: "0 2px 6px rgba(0,0,0,0.18)"
            }}
          >
            {cleanSymbol.length > 4 ? cleanSymbol.slice(0, 3) : cleanSymbol.slice(0, 2)}
          </div>
        );
      }
    }
  };

  return (
    <div
      className={`stock-logo-wrap ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0
      }}
    >
      {renderLogo()}
    </div>
  );
}

export default StockLogo;
