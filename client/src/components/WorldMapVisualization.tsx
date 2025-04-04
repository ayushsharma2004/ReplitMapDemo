import React, { useState, useRef, useEffect } from "react";
import { 
  ComposableMap, 
  Geographies, 
  Geography, 
  ZoomableGroup 
} from "react-simple-maps";
import { CountryData } from "@shared/schema";
import CountryTooltip from "./CountryTooltip";

// World map topojson file from react-simple-maps
const geoUrl = "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json";

interface WorldMapVisualizationProps {
  countryData: CountryData[];
  isLoaded: boolean;
  onMapLoaded: () => void;
}

export default function WorldMapVisualization({ 
  countryData, 
  isLoaded,
  onMapLoaded
}: WorldMapVisualizationProps) {
  const [tooltipInfo, setTooltipInfo] = useState<CountryData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isMapLoading, setIsMapLoading] = useState(true);

  // Get country data by name, handling variations in country naming
  const getCountryDataByName = (countryName: string): CountryData | undefined => {
    // Handle common name variations
    const normalizedName = countryName
      .replace("United States of America", "United States")
      .replace("The Bahamas", "Bahamas")
      .replace("Republic of Korea", "South Korea")
      .replace("Democratic People's Republic of Korea", "North Korea")
      .replace("United Republic of Tanzania", "Tanzania")
      .replace("Russian Federation", "Russia")
      .replace("United Kingdom of Great Britain and Northern Ireland", "United Kingdom")
      .replace("Iran (Islamic Republic of)", "Iran")
      .replace("Syrian Arab Republic", "Syria")
      .replace("Viet Nam", "Vietnam")
      .replace("Brunei Darussalam", "Brunei");

    return countryData.find(
      (country) => country.country.toLowerCase() === normalizedName.toLowerCase()
    );
  };

  // Handle map loading
  useEffect(() => {
    // Simulate loading time for the map
    const timer = setTimeout(() => {
      setIsMapLoading(false);
      onMapLoaded();
    }, 1500);

    return () => clearTimeout(timer);
  }, [onMapLoaded]);

  // Handle country hover
  const handleCountryHover = (
    geo: any,
    event: React.MouseEvent<SVGPathElement, MouseEvent>
  ) => {
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
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setTooltipInfo(null);
    setTooltipPosition(null);
  };

  return (
    <div ref={mapContainerRef} className="flex-1 relative">
      {/* Loading placeholder */}
      {isMapLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-lg bg-secondary p-8 text-center max-w-md">
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
      <ComposableMap 
        projection="geoMercator"
        projectionConfig={{
          scale: 140,
        }}
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <ZoomableGroup center={[0, 0]} zoom={1}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const countryName = geo.properties.name;
                const country = getCountryDataByName(countryName);
                
                // Determine country fill color
                let fillColor = "#383838"; // Default inactive/no data color
                
                if (country) {
                  fillColor = country.active ? "#3D7FD9" : "#383838";
                }
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={(event) => handleCountryHover(geo, event)}
                    onMouseLeave={handleMouseLeave}
                    style={{
                      default: {
                        fill: fillColor,
                        stroke: "#1E1E1E",
                        strokeWidth: 0.5,
                        outline: "none",
                      },
                      hover: {
                        fill: country?.active ? "#5491E1" : "#4A4A4A",
                        stroke: "#1E1E1E",
                        strokeWidth: 0.5,
                        outline: "none",
                      },
                      pressed: {
                        fill: country?.active ? "#2D6BC9" : "#303030",
                        stroke: "#1E1E1E",
                        strokeWidth: 0.5,
                        outline: "none",
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
      
      {/* Country tooltip */}
      <CountryTooltip countryInfo={tooltipInfo} position={tooltipPosition} />
    </div>
  );
}
