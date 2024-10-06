import React, { useEffect, useState, useRef, useMemo } from "react";
import CryptoTable from "../CryptoTable";

// Define your API key
const API_KEY = "CG-mMKZ7BqTcVKCNzZCoxgiGbKm"; // Replace with your actual API key

// Fetch top 20 coins from CoinGecko API
const fetchTopCoins = async () => {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&api_key=${API_KEY}`
    );
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
    return data
      .map((coin) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase() + "USDT", // Change symbol to match Binance format
        name: coin.name,
        lastPrice: coin.current_price,
        volume: coin.total_volume,
        marketCap: coin.market_cap,
        icon: coin.image,
      }))
      .sort((a, b) => b.marketCap - a.marketCap)
      .slice(0, 20);
  } catch (error) {
    console.error("Error fetching coins:", error);
    return [];
  }
};

// Main component to fetch and display top 20 cryptocurrencies
const MarketBook = () => {
  const [prices, setPrices] = useState([]);
  const [filter, setFilter] = useState("all");
  const [sortOrder1h, setSortOrder1h] = useState("none"); // برای 1 ساعت
  const [sortOrder24h, setSortOrder24h] = useState("none"); // برای 24 ساعت
  const [loading, setLoading] = useState(true);
  const ws = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const coins = await fetchTopCoins();
      const initialPrices = coins.map((coin) => ({
        symbol: coin.symbol,
        lastPrice: coin.lastPrice,
        priceChangePercent1h: 0,
        priceChangePercent24h: 0,
        marketCap: coin.marketCap,
        icon: coin.icon,
      }));

      setPrices(initialPrices);
      fetchPriceData(coins);
      setLoading(false);
    };

    fetchData();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const fetchPriceData = (coins) => {
    const symbols = coins.map((coin) => coin.symbol);
    ws.current = new WebSocket(`wss://stream.binance.com:9443/ws`);

    ws.current.onopen = () => {
      console.log("WebSocket connected");
      const streams = symbols.flatMap((symbol) => [
        `${symbol.toLowerCase()}@ticker_1h`,
        `${symbol.toLowerCase()}@ticker`,
      ]);

      const message = JSON.stringify({
        method: "SUBSCRIBE",
        params: streams,
        id: 1,
      });

      ws.current.send(message);
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.e === "24hrTicker" || data.e === "1hTicker") {
        setPrices((prevPrices) =>
          prevPrices.map((item) => {
            if (item.symbol === data.s) {
              const updatedPrice = {
                lastPrice:
                  data.e === "24hrTicker" ? Number(data.c) : item.lastPrice,
                priceChangePercent1h:
                  data.e === "1hTicker"
                    ? Number(data.P)
                    : item.priceChangePercent1h,
                priceChangePercent24h:
                  data.e === "24hrTicker"
                    ? Number(data.P)
                    : item.priceChangePercent24h,
                marketCap: item.marketCap,
                icon: item.icon,
              };
              return { ...item, ...updatedPrice };
            }
            return item;
          })
        );
      }
    };
  };

  const filteredPrices = useMemo(() => {
    return prices.filter((item) => {
      if (filter === "up") {
        return item.priceChangePercent24h > 0;
      } else if (filter === "down") {
        return item.priceChangePercent24h < 0;
      }
      return true;
    });
  }, [prices, filter]);

  const sortedPrices = useMemo(() => {
    let sorted = [...filteredPrices];

    // مرتب‌سازی بر اساس 1 ساعت
    if (sortOrder1h !== "none") {
      sorted.sort((a, b) => {
        if (sortOrder1h === "asc") {
          return a.priceChangePercent1h - b.priceChangePercent1h;
        } else if (sortOrder1h === "desc") {
          return b.priceChangePercent1h - a.priceChangePercent1h;
        }
        return 0;
      });
    } else if (sortOrder24h !== "none") {
      // اگر مرتب‌سازی 24 ساعت فعال است
      // مرتب‌سازی بر اساس 24 ساعت
      sorted.sort((a, b) => {
        if (sortOrder24h === "asc") {
          return a.priceChangePercent24h - b.priceChangePercent24h;
        } else if (sortOrder24h === "desc") {
          return b.priceChangePercent24h - a.priceChangePercent24h;
        }
        return 0;
      });
    }

    return sorted;
  }, [filteredPrices, sortOrder1h, sortOrder24h]);

  const handleHourlySort = () => {
    setSortOrder1h((prevSort) => {
      if (prevSort === "asc") return "desc";
      if (prevSort === "desc") return "none"; // غیرفعال کردن
      setSortOrder24h("none"); // غیرفعال کردن مرتب‌سازی 24 ساعته
      return "asc";
    });
  };

  const handleDailySort = () => {
    setSortOrder24h((prevSort) => {
      if (prevSort === "asc") return "desc";
      if (prevSort === "desc") return "none"; // غیرفعال کردن
      setSortOrder1h("none"); // غیرفعال کردن مرتب‌سازی 1 ساعته
      return "asc";
    });
  };

  return (
    <div className="overflow-hidden bg-gray-100 shadow-lg p-40">
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <CryptoTable
          sortedPrices={sortedPrices.map((price) => ({
            ...price,
            icon: price.icon,
          }))}
          handleHourlySort={handleHourlySort}
          handleDailySort={handleDailySort}
          sortOrder1h={sortOrder1h}
          sortOrder24h={sortOrder24h}
        />
      )}
    </div>
  );
};

export default MarketBook;
