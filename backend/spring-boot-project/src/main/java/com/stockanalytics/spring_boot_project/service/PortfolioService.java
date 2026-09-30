package com.stockanalytics.spring_boot_project.service;

import com.stockanalytics.spring_boot_project.dto.HoldingRequest;
import com.stockanalytics.spring_boot_project.dto.PortfolioResponse;
import com.stockanalytics.spring_boot_project.dto.SellHoldingRequest;
import com.stockanalytics.spring_boot_project.dto.TransactionDto;
import com.stockanalytics.spring_boot_project.entity.Holding;
import com.stockanalytics.spring_boot_project.entity.Portfolio;
import com.stockanalytics.spring_boot_project.entity.Stock;
import com.stockanalytics.spring_boot_project.entity.Transaction;
import com.stockanalytics.spring_boot_project.entity.User;
import com.stockanalytics.spring_boot_project.repository.HoldingRepository;
import com.stockanalytics.spring_boot_project.repository.PortfolioRepository;
import com.stockanalytics.spring_boot_project.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class PortfolioService {

    private final PortfolioRepository portfolioRepository;
    private final HoldingRepository holdingRepository;
    private final TransactionRepository transactionRepository;
    private final TwelveDataService twelveDataService;

    public PortfolioService(
            PortfolioRepository portfolioRepository,
            HoldingRepository holdingRepository,
            TransactionRepository transactionRepository,
            TwelveDataService twelveDataService) {
        this.portfolioRepository = portfolioRepository;
        this.holdingRepository = holdingRepository;
        this.transactionRepository = transactionRepository;
        this.twelveDataService = twelveDataService;
    }

    private String normalizeSymbol(String raw) {
        if (raw == null || raw.trim().isEmpty()) {
            throw new IllegalArgumentException("Stock symbol is required");
        }
        String sym = raw.trim().toUpperCase();
        if ("APPL".equals(sym)) return "AAPL";
        if ("SBI".equals(sym)) return "SBIN";
        return sym;
    }

    public Portfolio getOrCreateUserPortfolio(User user) {
        List<Portfolio> portfolios = portfolioRepository.findByUser(user);
        if (!portfolios.isEmpty()) {
            return portfolios.get(0);
        }

        Portfolio newPortfolio = new Portfolio("My Investment Portfolio", user);
        return portfolioRepository.save(newPortfolio);
    }

    @Transactional
    public PortfolioResponse getPortfolioResponse(User user) {
        Portfolio portfolio = getOrCreateUserPortfolio(user);
        List<Holding> holdings = holdingRepository.findByPortfolio(portfolio);

        BigDecimal totalInvested = BigDecimal.ZERO;
        BigDecimal totalCurrentValue = BigDecimal.ZERO;

        for (Holding holding : holdings) {
            // Try fetching live price
            try {
                Stock liveQuote = twelveDataService.getStockQuote(holding.getSymbol().toUpperCase());
                if (liveQuote != null && liveQuote.getPrice() != null) {
                    holding.setCurrentPrice(BigDecimal.valueOf(liveQuote.getPrice()));
                }
            } catch (Exception ignored) {
            }

            if (holding.getCurrentPrice() == null) {
                holding.setCurrentPrice(holding.getAverageBuyPrice());
            }

            holding.calculateInvestedAmount();
            holding.calculateCurrentValue();
            holding.calculateProfitLoss();

            if (holding.getInvestedAmount() != null) {
                totalInvested = totalInvested.add(holding.getInvestedAmount());
            }
            if (holding.getCurrentValue() != null) {
                totalCurrentValue = totalCurrentValue.add(holding.getCurrentValue());
            }

            holdingRepository.save(holding);
        }

        portfolio.setTotalInvested(totalInvested);
        portfolio.setCurrentValue(totalCurrentValue);
        BigDecimal totalProfitLoss = totalCurrentValue.subtract(totalInvested);
        portfolio.setTotalProfitLoss(totalProfitLoss);
        portfolioRepository.save(portfolio);

        return mapToResponse(portfolio, holdings);
    }

    @Transactional
    public PortfolioResponse addHolding(User user, HoldingRequest request) {
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero");
        }
        if (request.getBuyPrice() == null || request.getBuyPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Buy price must be greater than zero");
        }

        Portfolio portfolio = getOrCreateUserPortfolio(user);
        String symbol = normalizeSymbol(request.getSymbol());

        Optional<Holding> existingOpt = holdingRepository.findByPortfolioAndSymbol(portfolio, symbol);

        if (existingOpt.isPresent()) {
            Holding existing = existingOpt.get();
            int oldQty = existing.getQuantity() != null ? existing.getQuantity() : 0;
            int addQty = request.getQuantity();
            int newQty = oldQty + addQty;

            BigDecimal oldInvested = existing.getAverageBuyPrice().multiply(BigDecimal.valueOf(oldQty));
            BigDecimal addInvested = request.getBuyPrice().multiply(BigDecimal.valueOf(addQty));
            BigDecimal newInvested = oldInvested.add(addInvested);

            BigDecimal newAveragePrice = newInvested.divide(BigDecimal.valueOf(newQty), 4, RoundingMode.HALF_UP);

            existing.setQuantity(newQty);
            existing.setAverageBuyPrice(newAveragePrice);
            existing.calculateInvestedAmount();
            existing.calculateCurrentValue();
            existing.calculateProfitLoss();

            holdingRepository.save(existing);
        } else {
            Holding newHolding = new Holding(symbol, request.getQuantity(), request.getBuyPrice(), portfolio);

            // Fetch live price immediately if available
            try {
                Stock liveQuote = twelveDataService.getStockQuote(symbol);
                if (liveQuote != null && liveQuote.getPrice() != null) {
                    newHolding.setCurrentPrice(BigDecimal.valueOf(liveQuote.getPrice()));
                }
            } catch (Exception ignored) {
            }

            newHolding.calculateCurrentValue();
            newHolding.calculateProfitLoss();
            holdingRepository.save(newHolding);
        }

        // RECORD TRANSACTION IN MYSQL TRANSACTIONS TABLE
        try {
            BigDecimal qty = BigDecimal.valueOf(request.getQuantity());
            BigDecimal pr = request.getBuyPrice();
            BigDecimal totalVal = pr.multiply(qty);

            Transaction buyTx = new Transaction(
                    portfolio,
                    symbol,
                    Transaction.TransactionType.BUY,
                    qty,
                    pr,
                    totalVal
            );
            transactionRepository.save(buyTx);
        } catch (Exception e) {
            System.err.println("Notice: Could not persist transaction record: " + e.getMessage());
        }

        return getPortfolioResponse(user);
    }

    @Transactional
    public PortfolioResponse sellHolding(User user, SellHoldingRequest request) {
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new IllegalArgumentException("Quantity to sell must be greater than zero");
        }
        if (request.getSellPrice() == null || request.getSellPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Selling price must be greater than zero");
        }

        Portfolio portfolio = getOrCreateUserPortfolio(user);
        Holding holding = null;

        if (request.getHoldingId() != null) {
            holding = holdingRepository.findByIdAndPortfolio(request.getHoldingId(), portfolio).orElse(null);
        }

        if (holding == null && request.getSymbol() != null) {
            String sym = normalizeSymbol(request.getSymbol());
            holding = holdingRepository.findByPortfolioAndSymbol(portfolio, sym).orElse(null);
        }

        if (holding == null) {
            throw new IllegalArgumentException("No matching stock position found in your portfolio to sell");
        }

        int currentQty = holding.getQuantity() != null ? holding.getQuantity() : 0;
        int sellQty = request.getQuantity();

        if (sellQty > currentQty) {
            throw new IllegalArgumentException("Cannot sell more shares than currently owned. You own " + currentQty + " shares.");
        }

        // Record SELL Transaction in MySQL transactions table
        try {
            BigDecimal qty = BigDecimal.valueOf(sellQty);
            BigDecimal pr = request.getSellPrice();
            BigDecimal totalVal = pr.multiply(qty);

            Transaction sellTx = new Transaction(
                    portfolio,
                    holding.getSymbol(),
                    Transaction.TransactionType.SELL,
                    qty,
                    pr,
                    totalVal
            );
            transactionRepository.save(sellTx);
        } catch (Exception e) {
            System.err.println("Notice: Could not record sell transaction: " + e.getMessage());
        }

        if (sellQty == currentQty) {
            // Sold entire holding position
            holdingRepository.delete(holding);
        } else {
            // Partial sale: update remaining quantity
            holding.setQuantity(currentQty - sellQty);
            holding.calculateInvestedAmount();
            holding.calculateCurrentValue();
            holding.calculateProfitLoss();
            holdingRepository.save(holding);
        }

        return getPortfolioResponse(user);
    }

    @Transactional
    public PortfolioResponse deleteHolding(User user, Long holdingId) {
        Portfolio portfolio = getOrCreateUserPortfolio(user);
        Holding holding = holdingRepository.findByIdAndPortfolio(holdingId, portfolio)
                .orElseThrow(() -> new RuntimeException("Holding not found or does not belong to user"));

        // Record liquidation SELL transaction
        try {
            if (holding.getQuantity() != null && holding.getQuantity() > 0) {
                BigDecimal qty = BigDecimal.valueOf(holding.getQuantity());
                BigDecimal pr = holding.getCurrentPrice() != null ? holding.getCurrentPrice() : holding.getAverageBuyPrice();
                BigDecimal totalVal = pr.multiply(qty);

                Transaction sellTx = new Transaction(
                        portfolio,
                        holding.getSymbol(),
                        Transaction.TransactionType.SELL,
                        qty,
                        pr,
                        totalVal
                );
                transactionRepository.save(sellTx);
            }
        } catch (Exception ignored) {
        }

        holdingRepository.delete(holding);
        return getPortfolioResponse(user);
    }

    @Transactional(readOnly = true)
    public List<TransactionDto> getTransactions(User user) {
        Portfolio portfolio = getOrCreateUserPortfolio(user);
        List<Transaction> txList = transactionRepository.findByPortfolioOrderByTransactionDateDesc(portfolio);
        List<TransactionDto> dtos = new ArrayList<>();
        for (Transaction t : txList) {
            dtos.add(new TransactionDto(
                    t.getId(),
                    t.getStockSymbol(),
                    t.getTransactionType().name(),
                    t.getQuantity(),
                    t.getPrice(),
                    t.getTotalValue(),
                    t.getTransactionDate()
            ));
        }
        return dtos;
    }

    private PortfolioResponse mapToResponse(Portfolio portfolio, List<Holding> holdings) {
        PortfolioResponse response = new PortfolioResponse();
        response.setId(portfolio.getId());
        response.setName(portfolio.getName());
        response.setTotalInvested(portfolio.getTotalInvested() != null ? portfolio.getTotalInvested() : BigDecimal.ZERO);
        response.setCurrentValue(portfolio.getCurrentValue() != null ? portfolio.getCurrentValue() : BigDecimal.ZERO);
        response.setTotalProfitLoss(portfolio.getTotalProfitLoss() != null ? portfolio.getTotalProfitLoss() : BigDecimal.ZERO);

        if (response.getTotalInvested().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal plPct = response.getTotalProfitLoss()
                    .divide(response.getTotalInvested(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
            response.setTotalProfitLossPercentage(plPct);
        } else {
            response.setTotalProfitLossPercentage(BigDecimal.ZERO);
        }

        for (Holding h : holdings) {
            PortfolioResponse.HoldingItem item = new PortfolioResponse.HoldingItem();
            item.setId(h.getId());
            item.setSymbol(h.getSymbol());
            item.setQuantity(h.getQuantity());
            item.setAverageBuyPrice(h.getAverageBuyPrice());
            item.setCurrentPrice(h.getCurrentPrice());
            item.setInvestedAmount(h.getInvestedAmount());
            item.setCurrentValue(h.getCurrentValue());
            item.setProfitLoss(h.getProfitLoss());
            item.setProfitLossPercentage(h.getProfitLossPercentage());
            response.getHoldings().add(item);
        }

        // Attach transactions
        try {
            List<Transaction> txList = transactionRepository.findByPortfolioOrderByTransactionDateDesc(portfolio);
            List<TransactionDto> txDtos = new ArrayList<>();
            for (Transaction t : txList) {
                txDtos.add(new TransactionDto(
                        t.getId(),
                        t.getStockSymbol(),
                        t.getTransactionType().name(),
                        t.getQuantity(),
                        t.getPrice(),
                        t.getTotalValue(),
                        t.getTransactionDate()
                ));
            }
            response.setTransactions(txDtos);
        } catch (Exception ignored) {
        }

        return response;
    }
}
