import React, { useState, useRef, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from "react-simple-maps";
import { feature } from "topojson-client";
import { Country } from "@shared/schema";
import { Tooltip } from "@/components/ui/tooltip";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Using a more detailed topojson world map
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";

interface CountryMapProps {
  countries: Country[];
  selectedCountry: Country | null;
  setSelectedCountry: (country: Country | null) => void;
}

const CountryMap: React.FC<CountryMapProps> = ({ 
  countries, 
  selectedCountry, 
  setSelectedCountry 
}) => {
  const [zoom, setZoom] = useState(1);
  const [tooltipContent, setTooltipContent] = useState<{ name: string; status: string } | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // Country name mapping - to handle differences between map data and our country names
  const countryNameMapping: Record<string, string> = {
    "United States of America": "United States",
    "United Kingdom": "United Kingdom",
    "Dominican Rep.": "Dominican Republic",
    "Central African Rep.": "Central African Republic",
    "Congo": "Republic of Congo",
    "Dem. Rep. Congo": "Democratic Republic of the Congo",
    "Czech Rep.": "Czech Republic",
    "Bosnia and Herz.": "Bosnia and Herzegovina",
    "Macedonia": "North Macedonia",
    "S. Sudan": "South Sudan",
    "Côte d'Ivoire": "Ivory Coast",
    "Eq. Guinea": "Equatorial Guinea",
    "W. Sahara": "Western Sahara",
    "Lao PDR": "Laos"
  };

  // Function to get normalized country name
  const getNormalizedCountryName = (geoName: string): string => {
    return countryNameMapping[geoName] || geoName;
  };

  // Function to get fill color based on country status and active state
  const getFillColor = (geo: any) => {
    // Get the normalized country name
    const geoName = geo.properties.name;
    const normalizedName = getNormalizedCountryName(geoName);
    
    // Find the matching country data
    const countryData = countries.find(
      c => c.name.toLowerCase() === normalizedName.toLowerCase()
    );
    
    if (!countryData) return "#2D2D3B"; // Default gray for unmapped countries
    
    // Return different shades of blue for active countries based on status
    if (countryData.active) {
      switch (countryData.status) {
        case "Premier": return "#4B6BFD"; // Brighter blue for Premier
        case "Standard": return "#3F5BD9"; // Medium blue for Standard
        case "Basic": return "#3251C8"; // Darker blue for Basic
        default: return "#4B6BFD";
      }
    }
    
    return "#3A3A4A"; // Dark gray for inactive countries
  };
  
  // Zoom controls
  const handleZoomIn = () => {
    if (zoom < 4) setZoom(zoom + 0.5);
  };
  
  const handleZoomOut = () => {
    if (zoom > 1) setZoom(zoom - 0.5);
  };
  
  const handleZoomReset = () => {
    setZoom(1);
  };

  // Handle country click
  const handleCountryClick = (geo: any) => {
    const countryName = geo.properties.name;
    const normalizedName = getNormalizedCountryName(countryName);
    
    const countryData = countries.find(
      c => c.name.toLowerCase() === normalizedName.toLowerCase()
    );
    
    if (countryData) {
      setSelectedCountry(countryData);
    }
  };

  return (
    <div className="bg-secondary rounded-lg p-4 flex-1">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">World Map</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-primary inline-block mr-1"></span>
            <span className="text-xs text-gray-300">Active</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-[#3A3A4A] inline-block mr-1"></span>
            <span className="text-xs text-gray-300">Inactive</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <button 
            className="p-2 bg-gray-800 rounded hover:bg-gray-700 text-gray-300"
            onClick={handleZoomIn}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          <button 
            className="p-2 bg-gray-800 rounded hover:bg-gray-700 text-gray-300"
            onClick={handleZoomOut}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
            </svg>
          </button>
          <button 
            className="p-2 bg-gray-800 rounded hover:bg-gray-700 text-gray-300"
            onClick={handleZoomReset}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-gray-800 px-3 py-1 rounded-md">
            <span className="text-sm text-gray-300">Zoom:</span>
            <span className="text-sm font-medium">{Math.round(zoom * 100)}%</span>
          </div>
          <button 
            className="p-2 bg-gray-800 rounded hover:bg-gray-700 text-gray-300"
            onClick={handleZoomReset}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
            </svg>
          </button>
        </div>
      </div>
      
      <div ref={mapRef} className="relative w-full h-[500px] overflow-hidden border border-gray-700 rounded-lg">
        <TooltipProvider>
          <ComposableMap 
            projectionConfig={{ 
              scale: 140,
              rotation: [-11, 0, 0],
            }}
            className="w-full h-full bg-[#121212]"
          >
            <ZoomableGroup zoom={zoom} center={[0, 0]}>
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map(geo => {
                    // Find the matching country data
                    const countryName = geo.properties.name === "United States of America" 
                      ? "United States" 
                      : geo.properties.name;
                    
                    const countryData = countries.find(
                      c => c.name.toLowerCase() === countryName.toLowerCase()
                    );
                    
                    return (
                      <Tooltip key={geo.rsmKey}>
                        <TooltipTrigger asChild>
                          <Geography
                            geography={geo}
                            fill={getFillColor(geo)}
                            stroke="#FFFFFF"
                            strokeWidth={0.2}
                            style={{
                              default: {
                                outline: "none",
                              },
                              hover: {
                                outline: "none",
                                fill: countryData?.active ? "#6C8BFF" : "#4A4A5A",
                                cursor: "pointer",
                                transition: "all 250ms",
                              },
                              pressed: {
                                outline: "none",
                                fill: countryData?.active ? "#3B5BED" : "#2A2A3A",
                              },
                            }}
                            onClick={() => handleCountryClick(geo)}
                            onMouseEnter={() => {
                              const name = geo.properties.name;
                              const adjustedName = name === "United States of America" ? "United States" : name;
                              const country = countries.find(c => c.name.toLowerCase() === adjustedName.toLowerCase());
                              if (country) {
                                setTooltipContent({ name: country.name, status: country.status });
                              }
                            }}
                            onMouseLeave={() => {
                              setTooltipContent(null);
                            }}
                          />
                        </TooltipTrigger>
                        {tooltipContent?.name === (geo.properties.name === "United States of America" ? "United States" : geo.properties.name) && (
                          <TooltipContent>
                            <div className="p-1">
                              <div className="font-semibold">{tooltipContent.name}</div>
                              <div className="text-xs text-gray-300">Status: {tooltipContent.status}</div>
                            </div>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    );
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default CountryMap;
