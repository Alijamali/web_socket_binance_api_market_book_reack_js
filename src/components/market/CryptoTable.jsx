import React, { useState } from "react";
import PriceRow from "./PriceRow";

const CryptoTable = ({
  sortedPrices,
  handleHourlySort,
  handleDailySort,
  sortOrder1h,
  sortOrder24h,
}) => {
  const getHourlySortIcon = () => {
    if (sortOrder1h === "asc") return " ▲";
    if (sortOrder1h === "desc") return " ▼";
    return ""; // No icon for default
  };

  const getDailySortIcon = () => {
    if (sortOrder24h === "asc") return " ▲";
    if (sortOrder24h === "desc") return " ▼";
    return ""; // No icon for default
  };

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-gray-800 text-white">
          <th className="whitespace-nowrap px-1 py-1 text-base font-bold text-white">
            #
          </th>
          <th className="whitespace-nowrap px-1 py-1 text-base font-bold text-white text-start">
            Name
          </th>
          <th className="whitespace-nowrap px-1 py-1 text-base font-bold text-white">
            Price
          </th>
          <th
            onClick={handleHourlySort}
            className={`cursor-pointer whitespace-nowrap px-1 py-1 text-base font-bold text-white ${
              sortOrder1h !== "none" ? "text-green-400" : "opacity-50"
            }`}
          >
            1H %{getHourlySortIcon()}
          </th>
          <th
            onClick={handleDailySort}
            className={`cursor-pointer whitespace-nowrap px-1 py-1 text-base font-bold text-white ${
              sortOrder24h !== "none" ? "text-green-400" : "opacity-50"
            }`}
          >
            1D %{getDailySortIcon()}
          </th>
          <th className="whitespace-nowrap px-1 py-1 text-base font-bold text-white">
            Market Cap
          </th>
        </tr>
      </thead>
      <tbody className="text-center items-center">
        {sortedPrices.map((item, index) => (
          <PriceRow key={item.symbol} item={item} index={index} />
        ))}
      </tbody>
    </table>
  );
};

export default CryptoTable;
