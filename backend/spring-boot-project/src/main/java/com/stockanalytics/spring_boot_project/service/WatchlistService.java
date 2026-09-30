package com.stockanalytics.spring_boot_project.service;

import com.stockanalytics.spring_boot_project.dto.WatchlistItemDto;
import com.stockanalytics.spring_boot_project.entity.Stock;
import com.stockanalytics.spring_boot_project.entity.User;
import com.stockanalytics.spring_boot_project.entity.Watchlist;
import com.stockanalytics.spring_boot_project.repository.WatchlistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class WatchlistService {

    private final WatchlistRepository watchlistRepository;
    private final TwelveDataService twelveDataService;

    public WatchlistService(WatchlistRepository watchlistRepository, TwelveDataService twelveDataService) {
        this.watchlistRepository = watchlistRepository;
        this.twelveDataService = twelveDataService;
    }

    private String normalizeSymbol(String rawSymbol) {
        if (rawSymbol == null || rawSymbol.trim().isEmpty()) {
            throw new IllegalArgumentException("Symbol is required");
        }
        String sym = rawSymbol.trim().toUpperCase();
        if ("APPL".equals(sym)) return "AAPL";
        if ("SBI".equals(sym)) return "SBIN";
        return sym;
    }

    @Transactional(readOnly = true)
    public List<WatchlistItemDto> getWatchlist(User user) {
        List<Watchlist> list = watchlistRepository.findByUserOrderByCreatedAtDesc(user);
        List<WatchlistItemDto> result = new ArrayList<>();

        for (Watchlist w : list) {
            String sym = w.getStockSymbol();
            Stock quote = null;
            try {
                quote = twelveDataService.getStockQuote(sym);
            } catch (Exception ignored) {
            }

            Double price = quote != null && quote.getPrice() != null ? quote.getPrice() : 150.0;
            Double open = quote != null && quote.getOpenPrice() != null ? quote.getOpenPrice() : price * 0.995;
            Double high = quote != null && quote.getHighPrice() != null ? quote.getHighPrice() : price * 1.01;
            Double low = quote != null && quote.getLowPrice() != null ? quote.getLowPrice() : price * 0.99;
            Long volume = quote != null && quote.getVolume() != null ? quote.getVolume() : 1200000L;
            String companyName = quote != null && quote.getCompanyName() != null ? quote.getCompanyName() : sym;

            Double change = Math.round((price - open) * 100.0) / 100.0;
            Double changePct = open > 0 ? Math.round((change / open) * 10000.0) / 100.0 : 0.0;

            WatchlistItemDto dto = new WatchlistItemDto(
                    w.getId(),
                    sym,
                    companyName,
                    price,
                    open,
                    high,
                    low,
                    change,
                    changePct,
                    volume,
                    w.getCreatedAt()
            );
            result.add(dto);
        }

        return result;
    }

    @Transactional
    public List<WatchlistItemDto> addToWatchlist(User user, String rawSymbol) {
        String sym = normalizeSymbol(rawSymbol);

        if (!watchlistRepository.existsByUserAndStockSymbol(user, sym)) {
            Watchlist w = new Watchlist(user, sym);
            watchlistRepository.save(w);
        }

        return getWatchlist(user);
    }

    @Transactional
    public List<WatchlistItemDto> removeFromWatchlist(User user, String rawSymbol) {
        String sym = normalizeSymbol(rawSymbol);
        Optional<Watchlist> opt = watchlistRepository.findByUserAndStockSymbol(user, sym);
        opt.ifPresent(watchlistRepository::delete);
        return getWatchlist(user);
    }

    @Transactional(readOnly = true)
    public boolean isInWatchlist(User user, String rawSymbol) {
        String sym = normalizeSymbol(rawSymbol);
        return watchlistRepository.existsByUserAndStockSymbol(user, sym);
    }
}
