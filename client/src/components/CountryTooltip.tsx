import React from "react";
import { CountryData } from "@shared/schema";

interface CountryTooltipProps {
  countryInfo: CountryData | null;
  position: { x: number; y: number } | null;
}

export default function CountryTooltip({ countryInfo, position }: CountryTooltipProps) {
  if (!countryInfo || !position) return null;

  let leagueStatusColor = "bg-gray-500";
  if (countryInfo.leagueStatus === "Premier") {
    leagueStatusColor = "bg-primary";
  } else if (countryInfo.leagueStatus === "Standard") {
    leagueStatusColor = "bg-blue-400";
  } else if (countryInfo.leagueStatus === "Basic") {
    leagueStatusColor = "bg-gray-400";
  }

  const tooltipStyle = {
    left: `${position.x}px`,
    top: `${position.y}px`,
  };

  return (
    <div 
      className="absolute bg-white border border-border rounded shadow-lg p-3 text-sm z-10"
      style={tooltipStyle}
    >
      <h4 className="font-semibold mb-1">{countryInfo.country}</h4>
      <div className="flex items-center text-xs text-gray-600 mb-1">
        <span className="mr-2">Status:</span>
        <span className={`px-2 py-0.5 rounded text-white ${leagueStatusColor}`}>
          {countryInfo.leagueStatus}
        </span>
      </div>
      <div className="flex items-center text-xs text-gray-600">
        <span className="mr-2">Active:</span>
        {countryInfo.active ? (
          <span className="flex items-center text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Yes
          </span>
        ) : (
          <span className="flex items-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            No
          </span>
        )}
      </div>
    </div>
  );
}
