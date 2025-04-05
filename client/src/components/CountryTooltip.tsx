import React from "react";
import { CountryData } from "@shared/schema";

interface CountryTooltipProps {
  countryInfo: CountryData | null;
  position: { x: number; y: number } | null;
}

/**
 * CountryTooltip component displays information about a country when hovering over it on the map
 * Includes robust error handling and validation
 */
export default function CountryTooltip({ countryInfo, position }: CountryTooltipProps) {
  try {
    // Safety check for null or undefined props
    if (!countryInfo || !position) return null;

    // Validate countryInfo has required properties
    const isValidCountryInfo = 
      countryInfo && 
      typeof countryInfo.country === 'string' && 
      typeof countryInfo.leagueStatus === 'string' &&
      typeof countryInfo.active === 'boolean';

    if (!isValidCountryInfo) {
      console.error("Invalid country data format in tooltip:", countryInfo);
      
      // Return a fallback tooltip for invalid data
      return position ? (
        <div 
          className="absolute bg-white border border-border rounded shadow-lg p-3 text-sm z-10"
          style={{
            left: `${Math.max(0, position.x)}px`,
            top: `${Math.max(0, position.y)}px`,
          }}
        >
          <h4 className="font-semibold mb-1">
            {countryInfo && typeof countryInfo.country === 'string' 
              ? countryInfo.country 
              : "Country Data Error"}
          </h4>
          <div className="text-xs text-red-500">
            Invalid country data format
          </div>
        </div>
      ) : null;
    }

    // Determine league status color with enhanced validation and fallback
    let leagueStatusColor = "bg-gray-500";
    let leagueStatusText = countryInfo.leagueStatus || "Unknown";
    
    try {
      const validStatuses = ["Premier", "Standard", "Basic"];
      
      // Only set colors for known status values
      if (validStatuses.includes(countryInfo.leagueStatus)) {
        if (countryInfo.leagueStatus === "Premier") {
          leagueStatusColor = "bg-primary";
        } else if (countryInfo.leagueStatus === "Standard") {
          leagueStatusColor = "bg-blue-400";
        } else if (countryInfo.leagueStatus === "Basic") {
          leagueStatusColor = "bg-gray-400";
        }
      } else {
        // For unrecognized status values
        console.warn(`Unrecognized league status: ${countryInfo.leagueStatus}`);
      }
    } catch (error) {
      console.error("Error processing league status:", error);
      leagueStatusText = "Error";
    }

    // Calculate tooltip position with bounds checking
    const tooltipStyle = {
      left: `${Math.max(0, position.x)}px`,
      top: `${Math.max(0, position.y)}px`,
    };

    // Active status validation with fallback
    const isActive = typeof countryInfo.active === 'boolean' 
      ? countryInfo.active 
      : false;

    return (
      <div 
        className="absolute bg-white border border-border rounded shadow-lg p-3 text-sm z-10"
        style={tooltipStyle}
      >
        <h4 className="font-semibold mb-1">{countryInfo.country || "Unknown Country"}</h4>
        <div className="flex items-center text-xs text-gray-600 mb-1">
          <span className="mr-2">Status:</span>
          <span className={`px-2 py-0.5 rounded text-white ${leagueStatusColor}`}>
            {leagueStatusText}
          </span>
        </div>
        <div className="flex items-center text-xs text-gray-600">
          <span className="mr-2">Active:</span>
          {isActive ? (
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
  } catch (error) {
    // Global error handling for the entire component
    console.error("Error rendering country tooltip:", error);
    return null;
  }
}
