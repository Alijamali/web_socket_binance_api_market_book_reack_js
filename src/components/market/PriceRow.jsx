import React, { useState } from "react";

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
  return (
    new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(million) + " M"
  ); // Adding 'M' for millions
};

// Price row component
const PriceRow = React.memo(({ item, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const rowColor = index % 2 === 0 ? "bg-gray-900" : "bg-gray-800";

  return (
    <tr
      className={`${rowColor} transition-transform duration-300 ${
        isHovered ? "scale-105 bg-amber-950" : "scale-100"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <td className="whitespace-nowrap px-1 py-1 sm:px-2 sm:py-2 font-bold text-base sm:text-lg text-white">
        {index + 1}
      </td>
      <td className="whitespace-nowrap px-1 py-1 sm:px-2 sm:py-2 font-semibold text-base sm:text-lg text-white text-start">
        <img
          src={item.icon}
          alt={item.name}
          className="w-8 h-8 inline rounded-full object-cover m-2 p-0"
        />
        {item.symbol}
      </td>
      <td className="whitespace-nowrap px-1 py-1 sm:px-2 sm:py-2 font-semibold text-base sm:text-lg text-white">
        {`$ ${formatPrice(item.lastPrice)}`}
      </td>
      {/* 1-hour price change percent with icon */}
      <td className="px-1 py-1 sm:px-2 sm:py-2 font-semibold text-base sm:text-lg text-white items-center">
        {item.priceChangePercent1h < 0 ? (
          <>
            <span className="inline-block mr-1 text-red-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 20l-8-8h16l-8 8z" // Arrow down
                />
              </svg>
            </span>
            <span className="inline-block text-red-400">
              {Math.abs(item.priceChangePercent1h)}%
            </span>
          </>
        ) : (
          <>
            <span className="inline-block mr-1 text-green-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4l8 8H4l8-8z" // Arrow up
                />
              </svg>
            </span>
            <span className="inline-block text-green-400">
              {Math.abs(item.priceChangePercent1h)}%
            </span>
          </>
        )}
      </td>

      {/* 24-hour price change percent with icon */}
      <td className="px-1 py-1 sm:px-2 sm:py-2 font-semibold text-base sm:text-lg text-white items-center">
        {item.priceChangePercent24h < 0 ? (
          <>
            <span className="inline-block mr-1 text-red-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 20l-8-8h16l-8 8z" // Arrow down
                />
              </svg>
            </span>
            <span className="inline-block text-red-400">
              {Math.abs(item.priceChangePercent24h)}%
            </span>
          </>
        ) : (
          <>
            <span className="inline-block mr-1 text-green-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4l8 8H4l8-8z" // Arrow up
                />
              </svg>
            </span>
            <span className="inline-block text-green-400">
              {Math.abs(item.priceChangePercent24h)}%
            </span>
          </>
        )}
      </td>

      {/* Market Cap Column */}
      <td className="whitespace-nowrap px-1 py-1 sm:px-2 sm:py-2 font-semibold text-base sm:text-lg text-white">
        {`$ ${formatMarketCap(item.marketCap)} `}
      </td>

      {/* Add any additional columns as necessary */}
    </tr>
  );
});

export default PriceRow;
