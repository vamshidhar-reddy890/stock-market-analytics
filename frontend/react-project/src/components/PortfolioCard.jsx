import { useEffect, useState } from "react";
import { BriefcaseBusiness, TrendingUp, TrendingDown } from "lucide-react";
import { getPortfolio } from "../services/portfolioService";

function PortfolioCard({ portfolio: propPortfolio }) {
  const [portfolio, setPortfolio] = useState(propPortfolio || null);
  const [loading, setLoading] = useState(!propPortfolio);

  useEffect(() => {
    if (propPortfolio) {
      setPortfolio(propPortfolio);
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      setLoading(false);
      return;
    }

    getPortfolio()
      .then((data) => setPortfolio(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [propPortfolio]);

  const totalInvested = portfolio?.totalInvested ? Number(portfolio.totalInvested) : 0;
  const currentValue = portfolio?.currentValue ? Number(portfolio.currentValue) : 0;
  const totalProfitLoss = portfolio?.totalProfitLoss ? Number(portfolio.totalProfitLoss) : 0;
  const totalProfitLossPct = portfolio?.totalProfitLossPercentage ? Number(portfolio.totalProfitLossPercentage) : 0;
  const isPositive = totalProfitLoss >= 0;

  return (
    <div className="portfolio-card">
      <div className="portfolio-header">
        <div>
          <span>
            <BriefcaseBusiness size={18} />
            {portfolio?.name ? portfolio.name.toUpperCase() : "MY PORTFOLIO"}
          </span>
          <h2>
            ₹{currentValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
        </div>
        {isPositive ? (
          <TrendingUp size={25} className="positive-icon" />
        ) : (
          <TrendingDown size={25} className="negative-icon" />
        )}
      </div>

      <div className="portfolio-profit">
        <span>Total P/L</span>
        <strong className={isPositive ? "positive-text" : "negative-text"}>
          {isPositive ? "+₹" : "-₹"}
          {Math.abs(totalProfitLoss).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </strong>
        <small className={isPositive ? "positive-badge" : "negative-badge"}>
          {isPositive ? "+" : ""}
          {totalProfitLossPct.toFixed(2)}%
        </small>
      </div>

      <div className="portfolio-stats">
        <div>
          <span>Invested</span>
          <strong>
            ₹{totalInvested.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </strong>
        </div>
        <div>
          <span>Current Value</span>
          <strong>
            ₹{currentValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </strong>
        </div>
      </div>
    </div>
  );
}

export default PortfolioCard;