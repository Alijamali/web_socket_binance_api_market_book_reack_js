/*

https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams#individual-symbol-rolling-window-statistics-streams


*/

import React, { useEffect, useState, useRef } from "react";

// Fetch top 20 coins from Binance API
const fetchTopCoins = async () => {
  const response = await fetch("https://api.binance.com/api/v3/ticker/24hr");
  const data = await response.json();
  return data
    .filter((coin) => coin.symbol.endsWith("USDT"))
    .map((coin) => ({
      symbol: coin.symbol,
      lastPrice: Number(coin.lastPrice),
      volume: Number(coin.volume),
      marketCap: Number(coin.lastPrice) * Number(coin.volume),
    }))
    .sort((a, b) => b.marketCap - a.marketCap)
    .slice(0, 20);
};

// Format price
const formatPrice = (price) => {
  const numberPrice = Number(price);
  if (numberPrice >= 100) return numberPrice.toFixed(2);
  if (numberPrice >= 0.1) return numberPrice.toFixed(4);
  return numberPrice.toFixed(6);
};

// Format market cap
const formatMarketCap = (marketCap) => {
  const million = marketCap / 1e6;
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(million);
};

// Price row component
const PriceRow = React.memo(({ item, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const rowColor = index % 2 === 0 ? "bg-gray-900" : "bg-gray-800";

  return (
    <tr
      className={`${rowColor} transition-transform duration-300 ${
        isHovered ? "scale-105" : "scale-100"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <td className="whitespace-nowrap px-1 py-1 sm:px-2 sm:py-2 font-bold text-base sm:text-lg text-white">
        {index + 1}
      </td>
      <td className="whitespace-nowrap px-1 py-1 sm:px-2 sm:py-2 font-semibold text-base sm:text-lg text-white">
        {item.symbol}
      </td>
      <td className="whitespace-nowrap px-1 py-1 sm:px-2 sm:py-2 font-semibold text-base sm:text-lg text-white">
        {`$ ${formatPrice(item.lastPrice)}`}
      </td>
      <td
        className={`whitespace-nowrap px-1 py-1 sm:px-2 sm:py-2 font-semibold text-base sm:text-lg ${
          item.priceChange >= 0 ? "text-green-400" : "text-red-400"
        }`}
      >
        {`$ ${item.priceChange.toFixed(2)}`}
      </td>
      <td
        className={`whitespace-nowrap px-1 py-1 sm:px-2 sm:py-2 font-semibold text-base sm:text-lg ${
          item.priceChangePercent >= 0 ? "text-green-400" : "text-red-400"
        }`}
      >
        {`${item.priceChangePercent}%`}
      </td>
      <td className="whitespace-nowrap px-1 py-1 sm:px-2 sm:py-2 font-semibold text-base sm:text-lg text-white">
        {`${formatMarketCap(item.marketCap)} M`}
      </td>
    </tr>
  );
});

// Main component to fetch and display top 20 cryptocurrencies
const CryptoTop20 = () => {
  const [prices, setPrices] = useState([]);
  const ws = useRef(null);
  const pendingMessages = useRef([]);

  useEffect(() => {
    const fetchData = async () => {
      const coins = await fetchTopCoins();
      const initialPrices = await Promise.all(
        coins.map((coin) =>
          fetch(
            `https://api.binance.com/api/v3/ticker/24hr?symbol=${coin.symbol}`
          )
            .then((response) => response.json())
            .then((data) => ({
              symbol: data.symbol,
              lastPrice: Number(data.lastPrice),
              priceChange: Number(data.priceChange),
              priceChangePercent: Number(data.priceChangePercent),
              marketCap: Number(data.lastPrice) * Number(data.volume),
            }))
        )
      );

      setPrices(initialPrices);
      fetchPriceData(coins);
    };

    fetchData();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const fetchPriceData = (symbols) => {
    ws.current = new WebSocket(`wss://stream.binance.com:9443/ws`);

    ws.current.onopen = () => {
      console.log("WebSocket connected");
      const symbolsParam = symbols
        .map((symbol) => `${symbol.symbol.toLowerCase()}@ticker`)
        .join("/");

      // Send subscription messages only when WebSocket is open
      const message = JSON.stringify({
        method: "SUBSCRIBE",
        params: symbolsParam.split("/"),
        id: 1,
      });

      if (ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(message);
      } else {
        // Add message to pending messages if WebSocket is not open
        pendingMessages.current.push(message);
      }
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const updatedPrice = {
        symbol: data.s,
        lastPrice: Number(data.c),
        priceChange: Number(data.p),
        priceChangePercent: Number(data.P),
        marketCap: Number(data.c) * Number(data.v),
      };
      setPrices((prevPrices) =>
        prevPrices.map((item) =>
          item.symbol === updatedPrice.symbol ? updatedPrice : item
        )
      );
    };

    ws.current.onclose = () => {
      console.log("WebSocket closed");
    };

    ws.current.onerror = (error) => console.error("WebSocket error:", error);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-600 text-white">
      <div className="flex flex-col m-2 sm:m-5 justify-center items-center font-bold">
        <h2 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-4 text-white">
          Top 20 Cryptos by Market Cap
        </h2>
        <div className="overflow-x-auto w-full p-20">
          <table className="min-w-full text-left text-xs sm:text-sm font-light text-gray-300">
            <thead className="bg-gray-800 font-medium">
              <tr>
                <th
                  scope="col"
                  className="px-1 py-2 text-xs sm:text-lg text-white"
                >
                  #
                </th>
                <th
                  scope="col"
                  className="px-1 py-2 text-xs sm:text-lg text-white"
                >
                  Symbol
                </th>
                <th
                  scope="col"
                  className="px-1 py-2 text-xs sm:text-lg text-white"
                >
                  Current Price (USDT)
                </th>
                <th
                  scope="col"
                  className="px-1 py-2 text-xs sm:text-lg text-white"
                >
                  Price Change (24H)
                </th>
                <th
                  scope="col"
                  className="px-1 py-2 text-xs sm:text-lg text-white"
                >
                  Change (% 24H)
                </th>
                <th
                  scope="col"
                  className="px-1 py-2 text-xs sm:text-lg text-white"
                >
                  Market Cap (M USDT)
                </th>
              </tr>
            </thead>
            <tbody>
              {prices.map((item, index) => (
                <PriceRow key={index} item={item} index={index} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CryptoTop20;
