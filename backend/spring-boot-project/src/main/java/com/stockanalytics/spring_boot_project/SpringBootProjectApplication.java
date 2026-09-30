package com.stockanalytics.spring_boot_project;

import com.stockanalytics.spring_boot_project.repository.StockRepository;
import com.stockanalytics.spring_boot_project.service.TwelveDataService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

import java.util.concurrent.CompletableFuture;

@SpringBootApplication
public class SpringBootProjectApplication {

	@Bean
	public RestTemplate restTemplate() {
		return new RestTemplate();
	}

	@Bean
	public CommandLineRunner initializeStockUniverse(StockRepository stockRepository, TwelveDataService twelveDataService) {
		return args -> {
			String[] symbols = {
				// US Tech & Growth (25)
				"AAPL", "MSFT", "AMZN", "GOOGL", "GOOG", "META", "TSLA", "NVDA", "NFLX", "AMD",
				"INTC", "AVGO", "ADBE", "ORCL", "CRM", "CSCO", "QCOM", "TXN", "IBM", "AMAT",
				"MU", "PYPL", "UBER", "ABNB", "SHOP",
				// US Financials (9)
				"JPM", "BAC", "WFC", "GS", "MS", "C", "V", "MA", "AXP",
				// US Healthcare (7)
				"JNJ", "PFE", "MRK", "ABBV", "LLY", "UNH", "CVS",
				// US Consumer & Industrials (18)
				"WMT", "COST", "HD", "MCD", "KO", "PEP", "NKE", "DIS",
				"XOM", "CVX", "COP", "CAT", "BA", "GE", "F", "GM", "T", "VZ",
				// Crypto (2)
				"BTC", "ETH",
				// Indian Equities (30)
				"RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK", "SBIN", "BHARTIARTL", "ITC", "LT", "AXISBANK",
				"KOTAKBANK", "HINDUNILVR", "MARUTI", "TATAMOTORS", "M&M", "SUNPHARMA", "NTPC", "POWERGRID", "ADANIENT", "ADANIPORTS",
				"TATASTEEL", "JSWSTEEL", "WIPRO", "TECHM", "HCLTECH", "ASIANPAINT", "BAJFINANCE", "BAJAJFINSV", "ULTRACEMCO", "TITAN"
			};

			CompletableFuture.runAsync(() -> {
				for (String sym : symbols) {
					try {
						if (stockRepository.findBySymbol(sym).isEmpty()) {
							twelveDataService.getStockQuote(sym);
							Thread.sleep(120); // Gentle pacing
						}
					} catch (Exception ignored) {}
				}
			});
		};
	}

	public static void main(String[] args) {
		SpringApplication.run(SpringBootProjectApplication.class, args);
	}

}
