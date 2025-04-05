import React from 'react';
import { PatentApplication } from '@shared/schema';

// List of countries that will be shown on our simple map with their positions
const SIMPLE_COUNTRIES = [
  { code: 'US', name: 'United States', x: 200, y: 140, width: 100, height: 60 },
  { code: 'CA', name: 'Canada', x: 190, y: 100, width: 100, height: 40 },
  { code: 'MX', name: 'Mexico', x: 180, y: 200, width: 40, height: 30 },
  { code: 'BR', name: 'Brazil', x: 300, y: 280, width: 60, height: 60 },
  { code: 'AR', name: 'Argentina', x: 280, y: 350, width: 30, height: 60 },
  { code: 'GB', name: 'United Kingdom', x: 415, y: 120, width: 20, height: 20 },
  { code: 'FR', name: 'France', x: 430, y: 140, width: 30, height: 20 },
  { code: 'DE', name: 'Germany', x: 450, y: 130, width: 30, height: 20 },
  { code: 'IT', name: 'Italy', x: 460, y: 150, width: 20, height: 30 },
  { code: 'ES', name: 'Spain', x: 420, y: 160, width: 30, height: 20 },
  { code: 'JP', name: 'Japan', x: 750, y: 160, width: 30, height: 30 },
  { code: 'CN', name: 'China', x: 650, y: 170, width: 80, height: 60 },
  { code: 'IN', name: 'India', x: 600, y: 200, width: 50, height: 40 },
  { code: 'AU', name: 'Australia', x: 700, y: 320, width: 60, height: 50 },
  { code: 'RU', name: 'Russia', x: 550, y: 100, width: 150, height: 60 },
  { code: 'ZA', name: 'South Africa', x: 480, y: 320, width: 40, height: 30 },
  // Add more countries as needed
];

// European Patent Office (EPO) member countries
const EPO_MEMBERS = ['DE', 'FR', 'GB', 'IT', 'ES', 'NL', 'BE', 'LU', 'DK', 'SE', 'FI', 'AT', 'GR', 'PT', 'IE', 'CY', 'MT'];

interface SimpleWorldMapProps {
  patentApplications: PatentApplication[];
  loading?: boolean;
  onMapLoaded?: () => void;
  onCountryHover?: (country: string, active: boolean, position: { x: number, y: number }) => void;
}

export default function SimpleWorldMap({ 
  patentApplications,
  loading = false,
  onMapLoaded,
  onCountryHover
}: SimpleWorldMapProps) {
  // Call onMapLoaded when component is mounted
  React.useEffect(() => {
    if (onMapLoaded) {
      onMapLoaded();
    }
  }, [onMapLoaded]);
  // Build a map of country codes to active status
  const countryStatusMap = React.useMemo(() => {
    const statusMap = new Map<string, boolean>();
    
    patentApplications.forEach(application => {
      const countryCode = application.country_code;
      
      // If the country is already marked as active, keep it active
      if (statusMap.has(countryCode) && statusMap.get(countryCode)) {
        return;
      }
      
      // Set the country status based on the legal status
      const isActive = application.legal_status === "active";
      statusMap.set(countryCode, isActive);
    });
    
    return statusMap;
  }, [patentApplications]);

  const handleMouseEnter = (
    event: React.MouseEvent, 
    country: { code: string, name: string }, 
    isActive: boolean
  ) => {
    if (onCountryHover) {
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      const position = {
        x: rect.left + rect.width / 2,
        y: rect.top
      };
      onCountryHover(country.name, isActive, position);
    }
  };
  
  const handleMouseLeave = () => {
    if (onCountryHover) {
      onCountryHover('', false, { x: 0, y: 0 });
    }
  };

  return (
    <div className="relative bg-white h-[500px] w-full overflow-hidden">
      {/* Simple world map background */}
      <div className="absolute inset-0 bg-gray-100 border rounded"></div>
      
      {/* Countries */}
      {SIMPLE_COUNTRIES.map(country => {
        const isActive = countryStatusMap.has(country.code) 
          ? countryStatusMap.get(country.code) === true
          : false;
        
        // If EPO is active, highlight member countries
        const isActiveViaEPO = countryStatusMap.has("EP") && 
                              countryStatusMap.get("EP") === true && 
                              EPO_MEMBERS.includes(country.code);
        
        const fillColor = isActive || isActiveViaEPO 
          ? "#1E40AF" // blue for active
          : "#D1D5DB"; // gray for inactive
        
        return (
          <div
            key={country.code}
            className="absolute rounded transition-colors border border-white hover:opacity-80"
            style={{
              left: `${country.x}px`,
              top: `${country.y}px`,
              width: `${country.width}px`,
              height: `${country.height}px`,
              backgroundColor: fillColor
            }}
            onMouseEnter={(e) => handleMouseEnter(e, country, (isActive || isActiveViaEPO) ? true : false)}
            onMouseLeave={handleMouseLeave}
          />
        );
      })}
      
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