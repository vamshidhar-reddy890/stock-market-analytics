package com.stockanalytics.spring_boot_project.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stockanalytics.spring_boot_project.dto.HistoricalPointDto;
import com.stockanalytics.spring_boot_project.entity.Stock;
import com.stockanalytics.spring_boot_project.repository.StockRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class TwelveDataService {

    private final RestTemplate restTemplate;
    private final StockRepository stockRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${twelvedata.base.url:https://api.twelvedata.com}")
    private String baseUrl;

    @Value("${twelvedata.api.key:demo}")
    private String apiKey;

    public TwelveDataService(RestTemplate restTemplate, StockRepository stockRepository) {
        this.restTemplate = restTemplate;
        this.stockRepository = stockRepository;
    }

    /**
     * Get real-time stock quote.
     * 1. Tries configured Twelve Data API key first.
     * 2. If Twelve Data returns quota limit (429) or error, seamlessly fetches natural live prices from live market feed.
     * 3. Falls back to cached data or dynamically resolved natural stock.
     */
    public Stock getStockQuote(String symbol) {
        if (symbol == null || symbol.trim().isEmpty()) {
            return null;
        }
        String cleanSymbol = symbol.trim().toUpperCase();

        // Check if fresh cached stock (updated within last 30 seconds) exists
        Optional<Stock> cachedOpt = stockRepository.findBySymbol(cleanSymbol);
        if (cachedOpt.isPresent()) {
            Stock cached = cachedOpt.get();
            if (cached.getTimestamp() != null && cached.getTimestamp().isAfter(LocalDateTime.now().minusSeconds(30))) {
                return cached;
            }
        }

        // 1. Try Twelve Data API with configured API key
        String url = baseUrl + "/quote?symbol=" + cleanSymbol + "&apikey=" + apiKey;
        try {
            StockResponse response = restTemplate.getForObject(url, StockResponse.class);

            if (response != null && response.getCode() == null && !"error".equalsIgnoreCase(response.getStatus())) {
                Double price = null;
                try {
                    if (response.getClose() != null && !response.getClose().trim().isEmpty()) {
                        price = Double.parseDouble(response.getClose().trim());
                    } else if (response.getPrice() != null && !response.getPrice().trim().isEmpty()) {
                        price = Double.parseDouble(response.getPrice().trim());
                    }
                } catch (Exception ignored) {}

                if (price != null && price > 0) {
                    Stock stock = cachedOpt.orElseGet(() -> {
                        Stock s = new Stock();
                        s.setSymbol(cleanSymbol);
                        return s;
                    });

                    Double open = null;
                    Double high = null;
                    Double low = null;
                    Long volume = null;
                    try {
                        if (response.getOpen() != null) open = Double.parseDouble(response.getOpen().trim());
                        if (response.getHigh() != null) high = Double.parseDouble(response.getHigh().trim());
                        if (response.getLow() != null) low = Double.parseDouble(response.getLow().trim());
                        if (response.getVolume() != null) volume = Long.parseLong(response.getVolume().trim());
                    } catch (Exception ignored) {}

                    stock.setPrice(price);
                    stock.setOpenPrice(open != null ? open : price * 0.995);
                    stock.setHighPrice(high != null ? high : price * 1.01);
                    stock.setLowPrice(low != null ? low : price * 0.99);
                    stock.setVolume(volume != null ? volume : 1500000L);
                    stock.setCompanyName(response.getName() != null && !response.getName().trim().isEmpty() ? response.getName() : resolveCompanyName(cleanSymbol));
                    stock.setTimestamp(LocalDateTime.now());

                    return stockRepository.save(stock);
                }
            }
        } catch (Exception e) {
            System.out.println("TwelveData quote fetch note for " + cleanSymbol + ": " + e.getMessage());
        }

        // 2. Natural live market feed fallback (gives real, natural live market prices)
        Stock naturalStock = fetchNaturalMarketQuote(cleanSymbol);
        if (naturalStock != null) {
            return naturalStock;
        }

        // 3. Fallback: check cached stock in DB or initialize
        return cachedOpt.orElseGet(() -> initializeDefaultStock(cleanSymbol));
    }

    /**
     * Fetch natural, live market quotes from global live financial feeds.
     */
    private Stock fetchNaturalMarketQuote(String symbol) {
        String cleanSymbol = symbol.trim().toUpperCase();
        String querySymbol = mapToMarketSymbol(cleanSymbol);
        String url = "https://query1.finance.yahoo.com/v8/finance/chart/" + querySymbol + "?interval=1d&range=1d";

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode results = root.path("chart").path("result");
                if (results.isArray() && results.size() > 0) {
                    JsonNode meta = results.get(0).path("meta");
                    double price = meta.path("regularMarketPrice").asDouble(0.0);
                    if (price > 0) {
                        Stock stock = stockRepository.findBySymbol(cleanSymbol)
                                .orElseGet(() -> {
                                    Stock s = new Stock();
                                    s.setSymbol(cleanSymbol);
                                    return s;
                                });

                        double prevClose = meta.path("chartPreviousClose").asDouble(price * 0.995);
                        double high = meta.path("regularMarketDayHigh").asDouble(price * 1.01);
                        double low = meta.path("regularMarketDayLow").asDouble(price * 0.99);
                        long volume = meta.path("regularMarketVolume").asLong(1500000L);
                        String companyName = resolveCompanyName(cleanSymbol);

                        stock.setPrice(Math.round(price * 100.0) / 100.0);
                        stock.setOpenPrice(Math.round(prevClose * 100.0) / 100.0);
                        stock.setHighPrice(Math.round(high * 100.0) / 100.0);
                        stock.setLowPrice(Math.round(low * 100.0) / 100.0);
                        stock.setVolume(volume > 0 ? volume : 1500000L);
                        stock.setCompanyName(companyName);
                        stock.setTimestamp(LocalDateTime.now());

                        return stockRepository.save(stock);
                    }
                }
            }
        } catch (Exception e) {
            System.out.println("Live natural market quote notice for " + cleanSymbol + ": " + e.getMessage());
        }
        return null;
    }

    /**
     * Get historical chart data for 1D, 1W, 1M, 1Y.
     * 1. Tries Twelve Data time_series first.
     * 2. If Twelve Data has exhausted credits, fetches natural real-world historical candles.
     * 3. Falls back to realistic continuous trend anchored to live price.
     */
    public List<HistoricalPointDto> getHistoricalData(String symbol, String timeframe) {
        String cleanSymbol = (symbol != null) ? symbol.trim().toUpperCase() : "AAPL";
        String interval = "1day";
        int outputsize = 30;

        if ("1D".equalsIgnoreCase(timeframe)) {
            interval = "5min";
            outputsize = 30;
        } else if ("1W".equalsIgnoreCase(timeframe)) {
            interval = "1h";
            outputsize = 35;
        } else if ("1M".equalsIgnoreCase(timeframe)) {
            interval = "1day";
            outputsize = 30;
        } else if ("1Y".equalsIgnoreCase(timeframe)) {
            interval = "1week";
            outputsize = 52;
        }

        String url = baseUrl + "/time_series?symbol=" + cleanSymbol
                + "&interval=" + interval
                + "&outputsize=" + outputsize
                + "&apikey=" + apiKey;

        try {
            TimeSeriesResponse response = restTemplate.getForObject(url, TimeSeriesResponse.class);

            if (response != null && response.getValues() != null && !response.getValues().isEmpty()) {
                List<HistoricalPointDto> list = new ArrayList<>();
                for (TimeSeriesValue val : response.getValues()) {
                    try {
                        String timeLabel = formatDateTime(val.getDatetime(), timeframe);
                        Double close = Double.parseDouble(val.getClose());
                        Double open = val.getOpen() != null ? Double.parseDouble(val.getOpen()) : close;
                        Double high = val.getHigh() != null ? Double.parseDouble(val.getHigh()) : close;
                        Double low = val.getLow() != null ? Double.parseDouble(val.getLow()) : close;
                        Long vol = val.getVolume() != null ? Long.parseLong(val.getVolume()) : 0L;

                        list.add(new HistoricalPointDto(timeLabel, close, open, high, low, vol));
                    } catch (Exception ignored) {
                    }
                }
                // Reverse so oldest is first, newest is last (left-to-right chart)
                Collections.reverse(list);
                if (!list.isEmpty()) {
                    return list;
                }
            }
        } catch (Exception e) {
            System.out.println("TwelveData time_series notice for " + cleanSymbol + ": " + e.getMessage());
        }

        // 2. Try fetching natural real-world candles from live market feed
        List<HistoricalPointDto> naturalHistory = fetchNaturalHistoricalData(cleanSymbol, timeframe);
        if (naturalHistory != null && !naturalHistory.isEmpty()) {
            return naturalHistory;
        }

        // 3. Fallback to realistic continuous historical trend based on current stock quote
        Stock stock = getStockQuote(cleanSymbol);
        return generateSyntheticHistory(stock, timeframe);
    }

    /**
     * Fetch natural, real-world historical chart candles from market feeds.
     */
    private List<HistoricalPointDto> fetchNaturalHistoricalData(String symbol, String timeframe) {
        String cleanSymbol = (symbol != null) ? symbol.trim().toUpperCase() : "AAPL";
        String querySymbol = mapToMarketSymbol(cleanSymbol);
        String range = "1mo";
        String interval = "1d";

        if ("1D".equalsIgnoreCase(timeframe)) {
            range = "1d";
            interval = "5m";
        } else if ("1W".equalsIgnoreCase(timeframe)) {
            range = "5d";
            interval = "15m";
        } else if ("1M".equalsIgnoreCase(timeframe)) {
            range = "1mo";
            interval = "1d";
        } else if ("1Y".equalsIgnoreCase(timeframe)) {
            range = "1y";
            interval = "1wk";
        }

        String url = "https://query1.finance.yahoo.com/v8/finance/chart/" + querySymbol
                + "?range=" + range + "&interval=" + interval;

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode results = root.path("chart").path("result");
                if (results.isArray() && results.size() > 0) {
                    JsonNode r = results.get(0);
                    JsonNode timestamps = r.path("timestamp");
                    JsonNode quotes = r.path("indicators").path("quote");

                    if (timestamps.isArray() && quotes.isArray() && quotes.size() > 0) {
                        JsonNode q = quotes.get(0);
                        JsonNode closeArr = q.path("close");
                        JsonNode openArr = q.path("open");
                        JsonNode highArr = q.path("high");
                        JsonNode lowArr = q.path("low");
                        JsonNode volArr = q.path("volume");

                        DateTimeFormatter timeFmt = DateTimeFormatter.ofPattern("HH:mm");
                        DateTimeFormatter dayFmt = DateTimeFormatter.ofPattern("MMM dd");
                        DateTimeFormatter monthFmt = DateTimeFormatter.ofPattern("MMM yy");

                        List<HistoricalPointDto> list = new ArrayList<>();
                        int count = timestamps.size();
                        for (int i = 0; i < count; i++) {
                            JsonNode cVal = closeArr.get(i);
                            if (cVal == null || cVal.isNull() || !cVal.isNumber()) continue;
                            double close = cVal.asDouble();
                            if (close <= 0) continue;

                            long epoch = timestamps.get(i).asLong();
                            LocalDateTime dt = LocalDateTime.ofInstant(Instant.ofEpochSecond(epoch), ZoneId.systemDefault());
                            String label;
                            if ("1D".equalsIgnoreCase(timeframe)) {
                                label = dt.format(timeFmt);
                            } else if ("1Y".equalsIgnoreCase(timeframe)) {
                                label = dt.format(monthFmt);
                            } else {
                                label = dt.format(dayFmt);
                            }

                            double open = (openArr != null && openArr.get(i) != null && !openArr.get(i).isNull())
                                    ? openArr.get(i).asDouble(close) : close;
                            double high = (highArr != null && highArr.get(i) != null && !highArr.get(i).isNull())
                                    ? highArr.get(i).asDouble(close * 1.002) : close * 1.002;
                            double low = (lowArr != null && lowArr.get(i) != null && !lowArr.get(i).isNull())
                                    ? lowArr.get(i).asDouble(close * 0.998) : close * 0.998;
                            long vol = (volArr != null && volArr.get(i) != null && !volArr.get(i).isNull())
                                    ? volArr.get(i).asLong(100000L) : 100000L;

                            double roundedClose = Math.round(close * 100.0) / 100.0;
                            double roundedOpen = Math.round(open * 100.0) / 100.0;
                            double roundedHigh = Math.round(high * 100.0) / 100.0;
                            double roundedLow = Math.round(low * 100.0) / 100.0;

                            list.add(new HistoricalPointDto(label, roundedClose, roundedOpen, roundedHigh, roundedLow, vol));
                        }

                        if (!list.isEmpty()) {
                            return list;
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.out.println("Live natural historical feed notice for " + cleanSymbol + ": " + e.getMessage());
        }
        return null;
    }

    private String formatDateTime(String dt, String timeframe) {
        if (dt == null) return "";
        try {
            if ("1D".equalsIgnoreCase(timeframe) && dt.contains(" ")) {
                return dt.substring(11, 16); // "HH:mm"
            }
            if (dt.contains(" ")) {
                return dt.substring(5, 16); // "MM-dd HH:mm"
            }
            return dt.substring(5); // "MM-dd"
        } catch (Exception e) {
            return dt;
        }
    }

    private List<HistoricalPointDto> generateSyntheticHistory(Stock stock, String timeframe) {
        List<HistoricalPointDto> list = new ArrayList<>();
        double currentPrice = (stock != null && stock.getPrice() != null) ? stock.getPrice() : 250.0;

        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter timeFmt = DateTimeFormatter.ofPattern("HH:mm");
        DateTimeFormatter dayFmt = DateTimeFormatter.ofPattern("MMM dd");
        DateTimeFormatter monthFmt = DateTimeFormatter.ofPattern("MMM yy");

        Random random = new Random(stock != null ? stock.getSymbol().hashCode() : 42);

        if ("1D".equalsIgnoreCase(timeframe)) {
            int points = 20;
            double walk = currentPrice * 0.992;
            for (int i = 0; i < points; i++) {
                double changePct = (random.nextDouble() - 0.48) * 0.005;
                walk = walk * (1 + changePct);
                String label = now.minusMinutes((points - i) * 18L).format(timeFmt);
                double p = Math.round(walk * 100.0) / 100.0;
                list.add(new HistoricalPointDto(label, p, p * 0.999, p * 1.002, p * 0.998, 45000L));
            }
        } else if ("1W".equalsIgnoreCase(timeframe)) {
            int points = 7;
            double walk = currentPrice * 0.975;
            for (int i = 0; i < points; i++) {
                double changePct = (random.nextDouble() - 0.47) * 0.012;
                walk = walk * (1 + changePct);
                String label = now.minusDays(points - i).format(dayFmt);
                double p = Math.round(walk * 100.0) / 100.0;
                list.add(new HistoricalPointDto(label, p, p * 0.995, p * 1.008, p * 0.992, 180000L));
            }
        } else if ("1Y".equalsIgnoreCase(timeframe)) {
            int points = 12;
            double walk = currentPrice * 0.78;
            for (int i = 0; i < points; i++) {
                double monthlyDrift = 0.022 + (random.nextDouble() - 0.42) * 0.04;
                walk = walk * (1 + monthlyDrift);
                String label = now.minusMonths(points - i).format(monthFmt);
                double p = Math.round(walk * 100.0) / 100.0;
                list.add(new HistoricalPointDto(label, p, p * 0.985, p * 1.025, p * 0.978, 1200000L));
            }
        } else {
            // 1 Month
            int points = 30;
            double walk = currentPrice * 0.95;
            for (int i = 0; i < points; i++) {
                double changePct = (random.nextDouble() - 0.48) * 0.015;
                walk = walk * (1 + changePct);
                String label = now.minusDays(points - i).format(dayFmt);
                double p = Math.round(walk * 100.0) / 100.0;
                list.add(new HistoricalPointDto(label, p, p * 0.998, p * 1.005, p * 0.995, 250000L));
            }
        }

        if (!list.isEmpty() && stock != null && stock.getPrice() != null) {
            HistoricalPointDto last = list.get(list.size() - 1);
            last.setPrice(stock.getPrice());
        }

        return list;
    }

    /**
     * Dynamically initializes stock by fetching its natural market price.
     * Only falls back to basic values if network is completely unreachable.
     */
    private Stock initializeDefaultStock(String symbol) {
        // Attempt to fetch natural live market quote first
        Stock liveStock = fetchNaturalMarketQuote(symbol);
        if (liveStock != null) {
            return liveStock;
        }

        // Emergency offline baseline failsafe if internet connection is down
        Stock s = new Stock();
        s.setSymbol(symbol);
        s.setCompanyName(resolveCompanyName(symbol));
        s.setTimestamp(LocalDateTime.now());
        s.setPrice(150.0);
        s.setOpenPrice(148.0);
        s.setHighPrice(152.0);
        s.setLowPrice(147.0);
        s.setVolume(1000000L);

        return stockRepository.save(s);
    }

    /**
     * Map symbol to global market symbol.
     */
    private String mapToMarketSymbol(String symbol) {
        if (symbol == null) return "AAPL";
        String s = symbol.trim().toUpperCase();
        switch (s) {
            case "BTC":
            case "BTC/USD":
                return "BTC-USD";
            case "ETH":
            case "ETH/USD":
                return "ETH-USD";
            case "RELIANCE":
                return "RELIANCE.NS";
            case "TCS":
                return "TCS.NS";
            case "INFY":
                return "INFY.NS";
            case "HDFCBANK":
                return "HDFCBANK.NS";
            case "ICICIBANK":
                return "ICICIBANK.NS";
            case "SBIN":
                return "SBIN.NS";
            case "BHARTIARTL":
                return "BHARTIARTL.NS";
            case "ITC":
                return "ITC.NS";
            case "LT":
                return "LT.NS";
            case "AXISBANK":
                return "AXISBANK.NS";
            case "KOTAKBANK":
                return "KOTAKBANK.NS";
            case "HINDUNILVR":
                return "HINDUNILVR.NS";
            case "MARUTI":
                return "MARUTI.NS";
            case "TATAMOTORS":
                return "TMCV.NS";
            case "M&M":
                return "M%26M.NS";
            case "SUNPHARMA":
                return "SUNPHARMA.NS";
            case "NTPC":
                return "NTPC.NS";
            case "POWERGRID":
                return "POWERGRID.NS";
            case "ADANIENT":
                return "ADANIENT.NS";
            case "ADANIPORTS":
                return "ADANIPORTS.NS";
            case "TATASTEEL":
                return "TATASTEEL.NS";
            case "JSWSTEEL":
                return "JSWSTEEL.NS";
            case "WIPRO":
                return "WIPRO.NS";
            case "TECHM":
                return "TECHM.NS";
            case "HCLTECH":
                return "HCLTECH.NS";
            case "ASIANPAINT":
                return "ASIANPAINT.NS";
            case "BAJFINANCE":
                return "BAJFINANCE.NS";
            case "BAJAJFINSV":
                return "BAJAJFINSV.NS";
            case "ULTRACEMCO":
                return "ULTRACEMCO.NS";
            case "TITAN":
                return "TITAN.NS";
            default:
                return s;
        }
    }

    /**
     * Get clean official company name for symbol.
     */
    private String resolveCompanyName(String symbol) {
        if (symbol == null) return "Unknown Corp";
        switch (symbol.trim().toUpperCase()) {
            // US Tech & Growth
            case "AAPL": return "Apple Inc.";
            case "MSFT": return "Microsoft Corporation";
            case "AMZN": return "Amazon.com Inc.";
            case "GOOGL": return "Alphabet Inc. (Class A)";
            case "GOOG": return "Alphabet Inc. (Class C)";
            case "META": return "Meta Platforms, Inc.";
            case "TSLA": return "Tesla Inc.";
            case "NVDA": return "NVIDIA Corporation";
            case "NFLX": return "Netflix Inc.";
            case "AMD": return "Advanced Micro Devices, Inc.";
            case "INTC": return "Intel Corporation";
            case "AVGO": return "Broadcom Inc.";
            case "ADBE": return "Adobe Inc.";
            case "ORCL": return "Oracle Corporation";
            case "CRM": return "Salesforce, Inc.";
            case "CSCO": return "Cisco Systems, Inc.";
            case "QCOM": return "QUALCOMM Incorporated";
            case "TXN": return "Texas Instruments Inc.";
            case "IBM": return "International Business Machines";
            case "AMAT": return "Applied Materials, Inc.";
            case "MU": return "Micron Technology, Inc.";
            case "PYPL": return "PayPal Holdings, Inc.";
            case "UBER": return "Uber Technologies, Inc.";
            case "ABNB": return "Airbnb, Inc.";
            case "SHOP": return "Shopify Inc.";

            // US Financials
            case "JPM": return "JPMorgan Chase & Co.";
            case "BAC": return "Bank of America Corporation";
            case "WFC": return "Wells Fargo & Company";
            case "GS": return "The Goldman Sachs Group, Inc.";
            case "MS": return "Morgan Stanley";
            case "C": return "Citigroup Inc.";
            case "V": return "Visa Inc.";
            case "MA": return "Mastercard Incorporated";
            case "AXP": return "American Express Company";

            // US Healthcare
            case "JNJ": return "Johnson & Johnson";
            case "PFE": return "Pfizer Inc.";
            case "MRK": return "Merck & Co., Inc.";
            case "ABBV": return "AbbVie Inc.";
            case "LLY": return "Eli Lilly and Company";
            case "UNH": return "UnitedHealth Group Inc.";
            case "CVS": return "CVS Health Corporation";

            // US Consumer & Retail
            case "WMT": return "Walmart Inc.";
            case "COST": return "Costco Wholesale Corporation";
            case "HD": return "The Home Depot, Inc.";
            case "MCD": return "McDonald's Corporation";
            case "KO": return "The Coca-Cola Company";
            case "PEP": return "PepsiCo, Inc.";
            case "NKE": return "NIKE, Inc.";
            case "DIS": return "The Walt Disney Company";

            // US Energy & Industrials
            case "XOM": return "Exxon Mobil Corporation";
            case "CVX": return "Chevron Corporation";
            case "COP": return "ConocoPhillips";
            case "CAT": return "Caterpillar Inc.";
            case "BA": return "The Boeing Company";
            case "GE": return "GE Aerospace";
            case "F": return "Ford Motor Company";
            case "GM": return "General Motors Company";
            case "T": return "AT&T Inc.";
            case "VZ": return "Verizon Communications Inc.";

            // Crypto
            case "BTC":
            case "BTC/USD": return "Bitcoin - Binance";
            case "ETH":
            case "ETH/USD": return "Ethereum";

            // Indian Stocks
            case "RELIANCE": return "Reliance Industries Ltd.";
            case "TCS": return "Tata Consultancy Services Ltd.";
            case "INFY": return "Infosys Ltd.";
            case "HDFCBANK": return "HDFC Bank Ltd.";
            case "ICICIBANK": return "ICICI Bank Ltd.";
            case "SBIN": return "State Bank of India";
            case "BHARTIARTL": return "Bharti Airtel Ltd.";
            case "ITC": return "ITC Limited";
            case "LT": return "Larsen & Toubro Ltd.";
            case "AXISBANK": return "Axis Bank Ltd.";
            case "KOTAKBANK": return "Kotak Mahindra Bank Ltd.";
            case "HINDUNILVR": return "Hindustan Unilever Ltd.";
            case "MARUTI": return "Maruti Suzuki India Ltd.";
            case "TATAMOTORS": return "Tata Motors Ltd.";
            case "M&M": return "Mahindra & Mahindra Ltd.";
            case "SUNPHARMA": return "Sun Pharmaceutical Industries";
            case "NTPC": return "NTPC Limited";
            case "POWERGRID": return "Power Grid Corporation of India";
            case "ADANIENT": return "Adani Enterprises Ltd.";
            case "ADANIPORTS": return "Adani Ports and SEZ Ltd.";
            case "TATASTEEL": return "Tata Steel Ltd.";
            case "JSWSTEEL": return "JSW Steel Ltd.";
            case "WIPRO": return "Wipro Ltd.";
            case "TECHM": return "Tech Mahindra Ltd.";
            case "HCLTECH": return "HCL Technologies Ltd.";
            case "ASIANPAINT": return "Asian Paints Ltd.";
            case "BAJFINANCE": return "Bajaj Finance Ltd.";
            case "BAJAJFINSV": return "Bajaj Finserv Ltd.";
            case "ULTRACEMCO": return "UltraTech Cement Ltd.";
            case "TITAN": return "Titan Company Ltd.";

            default: return symbol.toUpperCase() + " Corp";
        }
    }

    public List<Stock> getAllLiveStocks() {
        return stockRepository.findAll();
    }

    // DTO for Twelve Data quote response
    private static class StockResponse {
        private String symbol;
        private String name;
        private String price;
        private String open;
        private String high;
        private String low;
        private String close;
        private String volume;
        private String code;
        private String message;
        private String status;

        public String getSymbol() { return symbol; }
        public void setSymbol(String symbol) { this.symbol = symbol; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getPrice() { return price; }
        public void setPrice(String price) { this.price = price; }
        public String getOpen() { return open; }
        public void setOpen(String open) { this.open = open; }
        public String getHigh() { return high; }
        public void setHigh(String high) { this.high = high; }
        public String getLow() { return low; }
        public void setLow(String low) { this.low = low; }
        public String getClose() { return close; }
        public void setClose(String close) { this.close = close; }
        public String getVolume() { return volume; }
        public void setVolume(String volume) { this.volume = volume; }
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    // DTO for Twelve Data time_series response
    private static class TimeSeriesResponse {
        private String status;
        private List<TimeSeriesValue> values;
        private String code;
        private String message;

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public List<TimeSeriesValue> getValues() { return values; }
        public void setValues(List<TimeSeriesValue> values) { this.values = values; }
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    private static class TimeSeriesValue {
        private String datetime;
        private String open;
        private String high;
        private String low;
        private String close;
        private String volume;

        public String getDatetime() { return datetime; }
        public void setDatetime(String datetime) { this.datetime = datetime; }
        public String getOpen() { return open; }
        public void setOpen(String open) { this.open = open; }
        public String getHigh() { return high; }
        public void setHigh(String high) { this.high = high; }
        public String getLow() { return low; }
        public void setLow(String low) { this.low = low; }
        public String getClose() { return close; }
        public void setClose(String close) { this.close = close; }
        public String getVolume() { return volume; }
        public void setVolume(String volume) { this.volume = volume; }
    }
}
