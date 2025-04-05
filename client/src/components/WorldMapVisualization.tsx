import React, { useState, useRef, useEffect } from "react";
import { 
  ComposableMap, 
  Geographies, 
  Geography, 
  ZoomableGroup 
} from "react-simple-maps";
import { CountryData } from "@shared/schema";
import CountryTooltip from "./CountryTooltip";

// World map topojson file from react-simple-maps (using a reliable source)
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface WorldMapVisualizationProps {
  countryData: CountryData[];
  isLoaded: boolean;
  onMapLoaded: () => void;
}

// Extended mapping for country names that might differ between the map data and our data
const COUNTRY_NAME_MAPPING: Record<string, string> = {
  "United States of America": "United States",
  "The Bahamas": "Bahamas",
  "Republic of Korea": "South Korea",
  "Democratic People's Republic of Korea": "North Korea",
  "United Republic of Tanzania": "Tanzania",
  "Russian Federation": "Russia",
  "Iran (Islamic Republic of)": "Iran",
  "Syrian Arab Republic": "Syria",
  "Viet Nam": "Vietnam",
  "Brunei Darussalam": "Brunei",
  "Czech Republic": "Czechia",
  "Macedonia": "North Macedonia",
  "Republic of the Congo": "Congo",
  "Democratic Republic of the Congo": "DR Congo",
  "Ivory Coast": "Côte d'Ivoire",
  "Burma": "Myanmar",
  "Timor-Leste": "East Timor",
  "Swaziland": "Eswatini",
  "Western Sahara": "Morocco",
};

export default function WorldMapVisualization({ 
  countryData, 
  isLoaded,
  onMapLoaded
}: WorldMapVisualizationProps) {
  const [tooltipInfo, setTooltipInfo] = useState<CountryData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  // Enhanced country data normalization
  const normalizeCountryName = (countryName: string | undefined): string | undefined => {
    if (!countryName) return undefined;
    
    try {
      // Check if the country is in our mapping
      const normalizedName = COUNTRY_NAME_MAPPING[countryName] || countryName;
      return normalizedName;
    } catch (error) {
      console.error("Error normalizing country name:", error);
      return countryName;
    }
  };

  // Get country data by name with improved error handling and normalization
  const getCountryDataByName = (countryName: string | undefined): CountryData | undefined => {
    // Handle empty or undefined country names
    if (!countryName) return undefined;
    
    try {
      // Normalize the country name
      const normalizedName = normalizeCountryName(countryName);
      if (!normalizedName) return undefined;

      // Ensure countryData is an array before using find
      if (!Array.isArray(countryData)) {
        console.warn("Country data is not an array");
        return undefined;
      }
      
      // Try to find an exact match first
      const exactMatch = countryData.find(
        (country) => country && 
                     country.country && 
                     country.country.toLowerCase() === normalizedName.toLowerCase()
      );
      
      if (exactMatch) return exactMatch;
      
      // Try to find a partial match if no exact match
      const partialMatch = countryData.find(
        (country) => country && 
                     country.country && 
                     normalizedName.toLowerCase().includes(country.country.toLowerCase())
      );
      
      return partialMatch;
    } catch (error) {
      console.error("Error retrieving country data:", error);
      return undefined;
    }
  };

  // Handle map loading with error handling
  useEffect(() => {
    try {
      // Validate countryData is properly structured
      if (countryData && !Array.isArray(countryData)) {
        setMapError("Invalid country data format");
        setIsMapLoading(false);
        return;
      }
      
      // Simulate loading time for the map
      const timer = setTimeout(() => {
        setIsMapLoading(false);
        onMapLoaded();
      }, 1500);
      
      return () => clearTimeout(timer);
    } catch (error) {
      console.error("Error loading map:", error);
      setMapError("Failed to load the world map visualization");
      setIsMapLoading(false);
    }
  }, [countryData, onMapLoaded]);

  // Handle country hover with improved error handling
  const handleCountryHover = (
    geo: any,
    event: React.MouseEvent<SVGPathElement, MouseEvent>
  ) => {
    try {
      if (!geo || !geo.properties) {
        console.warn("Invalid geography data");
        return;
      }
      
      const countryName = geo.properties.name;
      const country = getCountryDataByName(countryName);
      
      if (country) {
        setTooltipInfo(country);
        
        if (mapContainerRef.current) {
          const rect = mapContainerRef.current.getBoundingClientRect();
          setTooltipPosition({
            x: event.clientX - rect.left + 10,
            y: event.clientY - rect.top + 10
          });
        }
      } else {
        setTooltipInfo(null);
        setTooltipPosition(null);
      }
    } catch (error) {
      console.error("Error handling hover:", error);
      setTooltipInfo(null);
      setTooltipPosition(null);
    }
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setTooltipInfo(null);
    setTooltipPosition(null);
  };
  
  // Function to determine country fill color with validation
  const getCountryFillColor = (country: CountryData | undefined): string => {
    if (!country) return "#e0e0e0"; // Default inactive/no data color
    
    try {
      // Check for valid active property
      if (typeof country.active !== 'boolean') {
        console.warn("Invalid 'active' property for country:", country.country);
        return "#e0e0e0";
      }
      
      return country.active ? "#3D7FD9" : "#e0e0e0";
    } catch (error) {
      console.error("Error determining country fill color:", error);
      return "#e0e0e0";
    }
  };

  // Display error if map failed to load
  if (mapError) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-red-500">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h2 className="text-xl font-bold mb-2">Map Visualization Error</h2>
          <p className="text-gray-600 mb-4">{mapError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={mapContainerRef} className="flex-1 relative flex items-center justify-center h-full">
      {/* Loading placeholder */}
      {isMapLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="rounded-lg bg-secondary p-8 text-center max-w-md shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-primary">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            <h3 className="text-lg font-semibold mb-2">Loading World Map</h3>
            <p className="text-muted-foreground mb-4">The interactive world map is being prepared...</p>
            <div className="w-full bg-accent rounded-full h-1.5">
              <div className="bg-primary h-1.5 rounded-full w-3/4 animate-pulse"></div>
            </div>
          </div>
        </div>
      )}
      
      {/* World map */}
      <div className="w-full h-full">
        <ComposableMap 
          projection="geoEquirectangular"
          projectionConfig={{
            scale: 150,
          }}
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          <ZoomableGroup center={[0, 0]} zoom={1}>
            <Geographies geography={geoUrl}>
              {({ geographies }: { geographies: any[] }) =>
                geographies.map((geo: any) => {
                  try {
                    if (!geo || !geo.properties) return null;
                    
                    const countryName = geo.properties?.name;
                    const country = getCountryDataByName(countryName);
                    
                    // Determine country fill color
                    const fillColor = getCountryFillColor(country);
                    const strokeColor = "#c0c0c0"; // Default stroke color
                    
                    return (
                      <Geography
                        key={geo.rsmKey || `geo-${Math.random().toString(36).substr(2, 9)}`}
                        geography={geo}
                        onMouseEnter={(event: React.MouseEvent<SVGPathElement>) => handleCountryHover(geo, event)}
                        onMouseLeave={handleMouseLeave}
                        style={{
                          default: {
                            fill: fillColor,
                            stroke: strokeColor,
                            strokeWidth: 0.5,
                            outline: "none",
                          },
                          hover: {
                            fill: country?.active ? "#5491E1" : "#cccccc",
                            stroke: strokeColor,
                            strokeWidth: 0.5,
                            outline: "none",
                          },
                          pressed: {
                            fill: country?.active ? "#2D6BC9" : "#bbbbbb",
                            stroke: strokeColor,
                            strokeWidth: 0.5,
                            outline: "none",
                          },
                        }}
                      />
                    );
                  } catch (error) {
                    console.error("Error rendering geography:", error);
                    return null;
                  }
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>
      
      {/* Country tooltip */}
      <CountryTooltip countryInfo={tooltipInfo} position={tooltipPosition} />
    </div>
  );
}
