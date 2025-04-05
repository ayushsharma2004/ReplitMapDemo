import React, { useState, useRef, useEffect } from "react";
import { 
  ComposableMap, 
  Geographies, 
  Geography, 
  ZoomableGroup 
} from "react-simple-maps";
import { PatentApplication } from "@shared/schema";
import { Tooltip } from "@/components/ui/tooltip";

// World map topojson file from react-simple-maps
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface PatentWorldMapProps {
  patentApplications: PatentApplication[];
}

// Mapping between country codes and country names for consistent display
const COUNTRY_CODE_MAP: Record<string, string> = {
  "US": "United States",
  "JP": "Japan",
  "AU": "Australia",
  "ES": "Spain",
  "GB": "United Kingdom",
  "DE": "Germany",
  "FR": "France",
  "IT": "Italy",
  "CN": "China",
  "IN": "India",
  "BR": "Brazil",
  "CA": "Canada",
  "RU": "Russia",
  "ZA": "South Africa",
  "MX": "Mexico",
  "EP": "European Union", // Note: EP is not a standard country code but used for European Patents
  "WO": "World Intellectual Property Organization", // WIPO applications
};

// Map to convert country codes to ISO A2 codes for map visualization
const COUNTRY_TO_ISO_MAP: Record<string, string> = {
  "US": "US",
  "JP": "JP",
  "AU": "AU",
  "ES": "ES",
  "GB": "GB",
  "DE": "DE",
  "FR": "FR",
  "IT": "IT",
  "CN": "CN",
  "IN": "IN",
  "BR": "BR",
  "CA": "CA",
  "RU": "RU",
  "ZA": "ZA",
  "MX": "MX",
  // For non-standard codes, map to a representative country
  "EP": "DE", // European Patent Office represented by Germany
  "WO": "CH", // WIPO is headquartered in Switzerland
};

// Function to get full country name from country code
const getCountryNameFromCode = (code: string): string => {
  return COUNTRY_CODE_MAP[code] || code;
};

// Function to get ISO A2 code from patent country code
const getIsoCodeFromCountryCode = (code: string): string => {
  return COUNTRY_TO_ISO_MAP[code] || code;
};

export default function PatentWorldMap({ patentApplications }: PatentWorldMapProps) {
  const [tooltipContent, setTooltipContent] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isMapLoading, setIsMapLoading] = useState(true);

  // Convert patent country codes to ISO codes and extract active ones
  const activeISOCodes = patentApplications
    .filter(app => app.legal_status === "active")
    .map(app => getIsoCodeFromCountryCode(app.country_code));

  // Get ISO codes for all applications (both active and inactive)
  const allISOCodes = patentApplications
    .map(app => getIsoCodeFromCountryCode(app.country_code));
    
  // Handle map loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMapLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Get country style based on its active status in patent applications
  const getCountryStyle = (countryCode: string) => {
    const isActive = activeISOCodes.includes(countryCode);
    const isCountryInData = allISOCodes.includes(countryCode);
    
    return {
      default: {
        fill: isActive ? "#3D7FD9" : (isCountryInData ? "#A1C4F6" : "#e0e0e0"), // Blue for active, light blue for inactive but in data, gray for no data
        stroke: "#c0c0c0",
        strokeWidth: 0.5,
        outline: "none",
      },
      hover: {
        fill: isActive ? "#5491E1" : (isCountryInData ? "#B8D3F9" : "#cccccc"),
        stroke: "#c0c0c0",
        strokeWidth: 0.5,
        outline: "none",
      },
      pressed: {
        fill: isActive ? "#2D6BC9" : (isCountryInData ? "#8AB1E7" : "#bbbbbb"),
        stroke: "#c0c0c0",
        strokeWidth: 0.5,
        outline: "none",
      },
    };
  };

  // Handle country hover to show tooltip
  const handleCountryHover = (
    geo: any,
    event: React.MouseEvent<SVGPathElement, MouseEvent>
  ) => {
    // Get ISO code from geography properties
    const countryISOCode = geo.properties.iso_a2;
    
    // Filter patent applications for matching countries (comparing ISO codes)
    const matchingApps: PatentApplication[] = [];
    
    patentApplications.forEach(app => {
      const appISOCode = getIsoCodeFromCountryCode(app.country_code);
      if (appISOCode === countryISOCode) {
        matchingApps.push(app);
      }
    });
    
    if (matchingApps.length > 0) {
      // Create tooltip content
      const countryName = geo.properties.name || getCountryNameFromCode(countryISOCode);
      const activeApps = matchingApps.filter(app => app.legal_status === "active").length;
      const inactiveApps = matchingApps.length - activeApps;
      
      const tooltipText = `
        ${countryName}
        Active Applications: ${activeApps}
        Inactive Applications: ${inactiveApps}
        Total: ${matchingApps.length}
      `;
      
      setTooltipContent(tooltipText);
      
      if (mapContainerRef.current) {
        const rect = mapContainerRef.current.getBoundingClientRect();
        setTooltipPosition({
          x: event.clientX - rect.left + 10,
          y: event.clientY - rect.top + 10
        });
      }
    } else {
      // If this country has a match with one of our special non-country codes (EP, WO)
      // we can show information about that
      if (countryISOCode === "DE" && patentApplications.some(app => app.country_code === "EP")) {
        // European Patent Office
        const epApps = patentApplications.filter(app => app.country_code === "EP");
        const activeEpApps = epApps.filter(app => app.legal_status === "active").length;
        
        setTooltipContent(`
          European Patent Office
          Active Applications: ${activeEpApps}
          Inactive Applications: ${epApps.length - activeEpApps}
          Total: ${epApps.length}
        `);
        
        if (mapContainerRef.current) {
          const rect = mapContainerRef.current.getBoundingClientRect();
          setTooltipPosition({
            x: event.clientX - rect.left + 10,
            y: event.clientY - rect.top + 10
          });
        }
      } else if (countryISOCode === "CH" && patentApplications.some(app => app.country_code === "WO")) {
        // WIPO applications
        const woApps = patentApplications.filter(app => app.country_code === "WO");
        const activeWoApps = woApps.filter(app => app.legal_status === "active").length;
        
        setTooltipContent(`
          World Intellectual Property Organization
          Active Applications: ${activeWoApps}
          Inactive Applications: ${woApps.length - activeWoApps}
          Total: ${woApps.length}
        `);
        
        if (mapContainerRef.current) {
          const rect = mapContainerRef.current.getBoundingClientRect();
          setTooltipPosition({
            x: event.clientX - rect.left + 10,
            y: event.clientY - rect.top + 10
          });
        }
      } else {
        setTooltipContent(null);
        setTooltipPosition(null);
      }
    }
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setTooltipContent(null);
    setTooltipPosition(null);
  };

  return (
    <div ref={mapContainerRef} className="relative flex items-center justify-center h-full w-full">
      {/* Loading placeholder */}
      {isMapLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="rounded-lg bg-secondary p-8 text-center max-w-md shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-primary">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            <h3 className="text-lg font-semibold mb-2">Loading Patent Map</h3>
            <p className="text-muted-foreground mb-4">The patent application map is being prepared...</p>
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
                  const countryCode = geo.properties?.iso_a2;
                  
                  return (
                    <Geography
                      key={geo.rsmKey || `geo-${Math.random().toString(36).substr(2, 9)}`}
                      geography={geo}
                      onMouseEnter={(event: React.MouseEvent<SVGPathElement>) => handleCountryHover(geo, event)}
                      onMouseLeave={handleMouseLeave}
                      style={getCountryStyle(countryCode)}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>
      
      {/* Tooltip */}
      {tooltipContent && tooltipPosition && (
        <div 
          className="absolute bg-popover text-popover-foreground p-2 rounded shadow-md z-20 text-sm whitespace-pre-line"
          style={{ 
            left: tooltipPosition.x, 
            top: tooltipPosition.y 
          }}
        >
          {tooltipContent}
        </div>
      )}
    </div>
  );
}