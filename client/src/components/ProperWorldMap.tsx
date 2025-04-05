import React, { useState, useEffect } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from "react-simple-maps";
import { PatentApplication } from '@shared/schema';

// TopoJSON for world countries
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// European Patent Office (EPO) member countries
const EPO_MEMBERS = ['DEU', 'FRA', 'GBR', 'ITA', 'ESP', 'NLD', 'BEL', 'LUX', 'DNK', 'SWE', 'FIN', 'AUT', 'GRC', 'PRT', 'IRL', 'CYP', 'MLT'];

// Map ISO2 codes to ISO3 codes for proper highlighting
const ISO2_TO_ISO3: Record<string, string> = {
  'JP': 'JPN', // Japan
  'US': 'USA', // United States
  'GB': 'GBR', // United Kingdom
  'AU': 'AUS', // Australia
  'CA': 'CAN', // Canada
  'DE': 'DEU', // Germany
  'FR': 'FRA', // France
  'IT': 'ITA', // Italy
  'ES': 'ESP', // Spain
  'CN': 'CHN', // China
  'IN': 'IND', // India
  'RU': 'RUS', // Russia
  'BR': 'BRA', // Brazil
  'MX': 'MEX', // Mexico
  'EP': 'EUR', // European Patent Office (special handling)
  'WO': 'WLD', // World Intellectual Property Office (special handling)
};

interface ProperWorldMapProps {
  patentApplications: PatentApplication[];
  loading?: boolean;
  onMapLoaded?: () => void;
  onCountryHover?: (country: string, active: boolean, position: { x: number, y: number }) => void;
}

export default function ProperWorldMap({ 
  patentApplications,
  loading = false,
  onMapLoaded,
  onCountryHover
}: ProperWorldMapProps) {
  const [countryStatusMap, setCountryStatusMap] = useState<Map<string, boolean>>(new Map());
  
  // Call onMapLoaded when component is mounted
  useEffect(() => {
    if (onMapLoaded) {
      onMapLoaded();
    }
  }, [onMapLoaded]);
  
  // Build a map of country codes to active status
  useEffect(() => {
    const statusMap = new Map<string, boolean>();
    
    patentApplications.forEach(application => {
      const countryCode = application.country_code;
      
      // Convert ISO2 to ISO3 code if available
      const iso3Code = ISO2_TO_ISO3[countryCode] || countryCode;
      
      // If the country is already marked as active, keep it active
      if (statusMap.has(iso3Code) && statusMap.get(iso3Code)) {
        return;
      }
      
      // Set the country status based on the legal status
      const isActive = application.legal_status === "active";
      statusMap.set(iso3Code, isActive);
      
      // Special handling for EP applications - flag all EPO members
      if (countryCode === 'EP' && isActive) {
        EPO_MEMBERS.forEach(member => {
          // Don't override if a country is already specifically listed
          if (!statusMap.has(member)) {
            statusMap.set(member, true);
          }
        });
      }
    });
    
    setCountryStatusMap(statusMap);
  }, [patentApplications]);

  const handleCountryClick = (geography: any) => {
    if (onCountryHover) {
      const iso3Code = geography.properties.ISO_A3;
      const countryName = geography.properties.NAME;
      const isActive = countryStatusMap.has(iso3Code) ? countryStatusMap.get(iso3Code) === true : false;
      onCountryHover(countryName, isActive, { x: 0, y: 0 }); // Position will be updated in mouseEnter
    }
  };
  
  const handleMouseEnter = (geography: any, event: React.MouseEvent) => {
    if (onCountryHover) {
      const iso3Code = geography.properties.ISO_A3;
      const countryName = geography.properties.NAME;
      const isActive = countryStatusMap.has(iso3Code) ? countryStatusMap.get(iso3Code) === true : false;
      
      // Get position for the tooltip
      const position = {
        x: event.clientX,
        y: event.clientY
      };
      
      onCountryHover(countryName, isActive, position);
    }
  };
  
  const handleMouseLeave = () => {
    if (onCountryHover) {
      onCountryHover('', false, { x: 0, y: 0 });
    }
  };

  return (
    <div className="relative h-[500px] w-full overflow-hidden bg-[#f0f9ff]">
      <ComposableMap
        projection="geoEqualEarth"
        width={980}
        height={500}
        projectionConfig={{
          scale: 180
        }}
      >
        <ZoomableGroup center={[0, 0]} zoom={1}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map(geo => {
                const iso3Code = geo.properties.ISO_A3;
                const isActive = countryStatusMap.has(iso3Code) && countryStatusMap.get(iso3Code) === true;
                
                // Special case for European Patent (EP) to highlight all member countries
                const isActiveViaEPO = countryStatusMap.has("EUR") && 
                                       countryStatusMap.get("EUR") === true && 
                                       EPO_MEMBERS.includes(iso3Code);
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => handleCountryClick(geo)}
                    onMouseEnter={(e) => handleMouseEnter(geo, e)}
                    onMouseLeave={handleMouseLeave}
                    style={{
                      default: {
                        fill: isActive || isActiveViaEPO ? "#1E40AF" : "#D1D5DB",
                        outline: "none",
                        stroke: "#FFFFFF",
                        strokeWidth: 0.5,
                      },
                      hover: {
                        fill: isActive || isActiveViaEPO ? "#2563EB" : "#9CA3AF",
                        outline: "none",
                        stroke: "#FFFFFF",
                        strokeWidth: 0.5,
                        cursor: "pointer"
                      },
                      pressed: {
                        fill: isActive || isActiveViaEPO ? "#1E3A8A" : "#6B7280",
                        outline: "none",
                        stroke: "#FFFFFF",
                        strokeWidth: 0.5,
                      }
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded shadow p-2 flex items-center space-x-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-[#1E40AF] mr-2"></div>
          <span className="text-xs">Active Patents</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-[#D1D5DB] mr-2"></div>
          <span className="text-xs">Inactive/No Patents</span>
        </div>
      </div>
    </div>
  );
}