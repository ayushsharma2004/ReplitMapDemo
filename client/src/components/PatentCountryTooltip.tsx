import React from "react";

interface PatentCountryTooltipProps {
  countryName: string;
  isActive: boolean;
  position: { x: number; y: number } | null;
}

export default function PatentCountryTooltip({ 
  countryName, 
  isActive, 
  position 
}: PatentCountryTooltipProps) {
  // Safety check for null or undefined props
  if (!countryName || !position) return null;

  // Calculate tooltip position with safety checks
  const tooltipStyle = {
    left: `${Math.max(0, position.x)}px`,
    top: `${Math.max(0, position.y - 70)}px`, // Position above the cursor
    transform: "translateX(-50%)" // Center horizontally
  };

  return (
    <div 
      className="absolute bg-white border border-gray-200 rounded shadow-lg p-3 text-sm z-10"
      style={tooltipStyle}
    >
      <h4 className="font-semibold mb-1">{countryName || "Unknown Country"}</h4>
      <div className="flex items-center text-xs text-gray-600">
        <span className="mr-2">Patent Status:</span>
        {isActive ? (
          <span className="flex items-center text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Active
          </span>
        ) : (
          <span className="flex items-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            Inactive
          </span>
        )}
      </div>
    </div>
  );
}