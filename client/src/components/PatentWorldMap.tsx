import React, { useState, useEffect, useCallback } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from "react-simple-maps";
import { PatentApplication, CountryData } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Map location configuration
const MAP_INITIAL_POSITION = { coordinates: [0, 20], zoom: 1 };
const MAP_URL = "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json";

// Country ISO code to name mapping (partial list)
const COUNTRY_CODES: Record<string, string> = {
  "US": "United States",
  "CA": "Canada",
  "MX": "Mexico",
  "BR": "Brazil",
  "AR": "Argentina",
  "GB": "United Kingdom",
  "FR": "France",
  "DE": "Germany",
  "IT": "Italy",
  "ES": "Spain",
  "JP": "Japan",
  "CN": "China",
  "IN": "India",
  "AU": "Australia",
  "RU": "Russia",
  "ZA": "South Africa",
  "EP": "European Patent Office",
  "WO": "World Intellectual Property Organization",
  // Add more country mappings as needed
};

interface PatentWorldMapProps {
  patentApplications: PatentApplication[];
  loading?: boolean;
  onMapLoaded?: () => void;
}

export default function PatentWorldMap({
  patentApplications = [],
  loading = false,
  onMapLoaded
}: PatentWorldMapProps) {
  const { toast } = useToast();
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [tooltipContent, setTooltipContent] = useState<{ content: string, position: { x: number, y: number } } | null>(null);

  // Build a map of country codes to active status
  const countryStatusMap = React.useMemo(() => {
    const statusMap = new Map<string, boolean>();
    
    patentApplications.forEach(application => {
      // If the country is already marked as active, keep it active
      if (statusMap.has(application.country_code) && statusMap.get(application.country_code)) {
        return;
      }
      
      // Set the country status based on the legal status
      statusMap.set(
        application.country_code, 
        application.legal_status === "active"
      );
    });
    
    return statusMap;
  }, [patentApplications]);

  // Handle map load event
  const handleMapLoad = useCallback(() => {
    setIsMapLoaded(true);
    if (onMapLoaded) {
      onMapLoaded();
    }
  }, [onMapLoaded]);

  // Display error message if loading fails
  useEffect(() => {
    if (!isMapLoaded && !loading) {
      const timeoutId = setTimeout(() => {
        if (!isMapLoaded) {
          toast({
            title: "Map Load Error",
            description: "Failed to load the world map. Please check your internet connection and try again.",
            variant: "destructive",
          });
        }
      }, 10000);

      return () => clearTimeout(timeoutId);
    }
  }, [isMapLoaded, loading, toast]);

  return (
    <div className="relative flex-1 bg-white">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-gray-500">Loading patent data...</p>
          </div>
        </div>
      )}

      {tooltipContent && (
        <div 
          className="absolute z-10 bg-white shadow-lg rounded p-2 text-sm pointer-events-none"
          style={{ 
            left: `${tooltipContent.position.x}px`, 
            top: `${tooltipContent.position.y}px`,
            transform: 'translate(-50%, -100%)',
            marginTop: '-10px'
          }}
        >
          {tooltipContent.content}
        </div>
      )}

      <ComposableMap
        data-tip=""
        projectionConfig={{ scale: 150 }}
        width={800}
        height={400}
        style={{ width: "100%", height: "100%" }}
        onMouseEnter={() => handleMapLoad()}
      >
        <ZoomableGroup zoom={MAP_INITIAL_POSITION.zoom} center={MAP_INITIAL_POSITION.coordinates}>
          <Geographies geography={MAP_URL}>
            {({ geographies }: { geographies: Array<any> }) => 
              geographies.map((geo: any) => {
                // Get the country code and check its status
                const countryCode = geo.properties.iso_a2;
                
                // Check if this country is in our data (using the ISO code)
                const isActive = countryStatusMap.has(countryCode) 
                  ? countryStatusMap.get(countryCode) 
                  : false;
                
                // Get the European Patent Office member countries (simplified for demonstration)
                const isEPOMember = ["DE", "FR", "GB", "IT", "ES", "NL", "BE", "LU", "DK", "SE", "FI", "AT", "GR", "PT", "IE", "CY", "MT"].includes(countryCode);
                
                // If EPO is active, highlight member countries
                const isActiveViaEPO = countryStatusMap.has("EP") && countryStatusMap.get("EP") && isEPOMember;
                
                // Determine the fill color based on the active status
                const fillColor = isActive || isActiveViaEPO ? "#1E40AF" : "#D1D5DB";
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fillColor}
                    stroke="#FFFFFF"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { outline: "none", fill: isActive || isActiveViaEPO ? "#2563EB" : "#9CA3AF" },
                      pressed: { outline: "none" }
                    }}
                    onMouseEnter={(event: React.MouseEvent) => {
                      const countryName = geo.properties.name;
                      const position = { x: event.clientX, y: event.clientY };
                      
                      // Show tooltip with country name and status
                      const statusText = isActive || isActiveViaEPO ? "Active" : "Not Active";
                      setTooltipContent({
                        content: `${countryName}: ${statusText}${isActiveViaEPO ? " (via EPO)" : ""}`,
                        position
                      });
                    }}
                    onMouseLeave={() => {
                      setTooltipContent(null);
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}