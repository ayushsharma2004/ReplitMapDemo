import React from 'react';
import { PatentApplication } from '@shared/schema';

// European Patent Office (EPO) member countries
const EPO_MEMBERS = ['DE', 'FR', 'GB', 'IT', 'ES', 'NL', 'BE', 'LU', 'DK', 'SE', 'FI', 'AT', 'GR', 'PT', 'IE', 'CY', 'MT'];

interface EnhancedWorldMapProps {
  patentApplications: PatentApplication[];
  loading?: boolean;
  onMapLoaded?: () => void;
  onCountryHover?: (country: string, active: boolean, position: { x: number, y: number }) => void;
}

export default function EnhancedWorldMap({ 
  patentApplications,
  loading = false,
  onMapLoaded,
  onCountryHover
}: EnhancedWorldMapProps) {
  const mapRef = React.useRef<SVGSVGElement>(null);
  
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

  // Handle country hover
  const handleCountryMouseEnter = (
    event: React.MouseEvent<SVGPathElement>,
    countryName: string, 
    countryCode: string
  ) => {
    if (onCountryHover) {
      const rect = event.currentTarget.getBoundingClientRect();
      const position = {
        x: rect.left + rect.width / 2,
        y: rect.top
      };
      
      // Check if this country is active directly or via EPO
      const isActive = countryStatusMap.has(countryCode) 
        ? countryStatusMap.get(countryCode) === true
        : false;
        
      const isActiveViaEPO = countryStatusMap.has("EP") && 
                           countryStatusMap.get("EP") === true && 
                           EPO_MEMBERS.includes(countryCode);
                           
      onCountryHover(countryName, (isActive || isActiveViaEPO) ? true : false, position);
    }
  };
  
  const handleCountryMouseLeave = () => {
    if (onCountryHover) {
      onCountryHover('', false, { x: 0, y: 0 });
    }
  };

  return (
    <div className="relative bg-white h-[500px] w-full overflow-hidden">
      {/* Map SVG */}
      <svg 
        ref={mapRef}
        className="w-full h-full"
        viewBox="0 0 1000 500"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Ocean background */}
        <rect x="0" y="0" width="1000" height="500" fill="#f0f9ff" />
        
        {/* North America */}
        <path 
          d="M150,120 L250,120 L270,150 L310,160 L290,210 L240,240 L200,280 L170,300 L120,270 L100,210 L120,180 Z" 
          fill={countryStatusMap.has("US") && countryStatusMap.get("US") === true ? "#1E40AF" : "#D1D5DB"}
          stroke="#fff"
          strokeWidth="1"
          onMouseEnter={(e) => handleCountryMouseEnter(e, "United States", "US")}
          onMouseLeave={handleCountryMouseLeave}
        />
        
        {/* Canada */}
        <path 
          d="M150,120 L250,120 L290,80 L200,70 L120,90 Z" 
          fill={countryStatusMap.has("CA") && countryStatusMap.get("CA") === true ? "#1E40AF" : "#D1D5DB"}
          stroke="#fff"
          strokeWidth="1"
          onMouseEnter={(e) => handleCountryMouseEnter(e, "Canada", "CA")}
          onMouseLeave={handleCountryMouseLeave}
        />
        
        {/* Mexico */}
        <path 
          d="M170,300 L200,280 L240,300 L220,330 L180,340 L160,320 Z" 
          fill={countryStatusMap.has("MX") && countryStatusMap.get("MX") === true ? "#1E40AF" : "#D1D5DB"}
          stroke="#fff"
          strokeWidth="1"
          onMouseEnter={(e) => handleCountryMouseEnter(e, "Mexico", "MX")}
          onMouseLeave={handleCountryMouseLeave}
        />
        
        {/* South America */}
        <path 
          d="M250,350 L290,330 L320,370 L300,420 L260,430 L230,400 Z" 
          fill={countryStatusMap.has("BR") && countryStatusMap.get("BR") === true ? "#1E40AF" : "#D1D5DB"}
          stroke="#fff"
          strokeWidth="1"
          onMouseEnter={(e) => handleCountryMouseEnter(e, "Brazil", "BR")}
          onMouseLeave={handleCountryMouseLeave}
        />
        
        {/* Europe */}
        <path 
          d="M420,130 L450,120 L470,140 L460,160 L430,170 L410,150 Z" 
          fill={
            (countryStatusMap.has("EP") && countryStatusMap.get("EP") === true) || 
            (countryStatusMap.has("EU") && countryStatusMap.get("EU") === true) ? 
            "#1E40AF" : "#D1D5DB"
          }
          stroke="#fff"
          strokeWidth="1"
          onMouseEnter={(e) => handleCountryMouseEnter(e, "European Union", "EP")}
          onMouseLeave={handleCountryMouseLeave}
        />
        
        {/* UK */}
        <path 
          d="M400,130 L420,130 L410,150 L390,145 Z" 
          fill={
            (countryStatusMap.has("GB") && countryStatusMap.get("GB") === true) || 
            ((countryStatusMap.has("EP") && countryStatusMap.get("EP") === true) && EPO_MEMBERS.includes("GB")) ? 
            "#1E40AF" : "#D1D5DB"
          }
          stroke="#fff"
          strokeWidth="1"
          onMouseEnter={(e) => handleCountryMouseEnter(e, "United Kingdom", "GB")}
          onMouseLeave={handleCountryMouseLeave}
        />
        
        {/* Germany */}
        <path 
          d="M450,120 L470,140 L460,160 L440,150 Z" 
          fill={
            (countryStatusMap.has("DE") && countryStatusMap.get("DE") === true) || 
            ((countryStatusMap.has("EP") && countryStatusMap.get("EP") === true) && EPO_MEMBERS.includes("DE")) ? 
            "#1E40AF" : "#D1D5DB"
          }
          stroke="#fff"
          strokeWidth="1"
          onMouseEnter={(e) => handleCountryMouseEnter(e, "Germany", "DE")}
          onMouseLeave={handleCountryMouseLeave}
        />
        
        {/* France */}
        <path 
          d="M420,130 L450,120 L440,150 L430,170 Z" 
          fill={
            (countryStatusMap.has("FR") && countryStatusMap.get("FR") === true) || 
            ((countryStatusMap.has("EP") && countryStatusMap.get("EP") === true) && EPO_MEMBERS.includes("FR")) ? 
            "#1E40AF" : "#D1D5DB"
          }
          stroke="#fff"
          strokeWidth="1"
          onMouseEnter={(e) => handleCountryMouseEnter(e, "France", "FR")}
          onMouseLeave={handleCountryMouseLeave}
        />
        
        {/* Spain */}
        <path 
          d="M400,170 L430,170 L410,190 L390,180 Z" 
          fill={
            (countryStatusMap.has("ES") && countryStatusMap.get("ES") === true) || 
            ((countryStatusMap.has("EP") && countryStatusMap.get("EP") === true) && EPO_MEMBERS.includes("ES")) ? 
            "#1E40AF" : "#D1D5DB"
          }
          stroke="#fff"
          strokeWidth="1"
          onMouseEnter={(e) => handleCountryMouseEnter(e, "Spain", "ES")}
          onMouseLeave={handleCountryMouseLeave}
        />
        
        {/* Russia */}
        <path 
          d="M470,140 L500,100 L600,110 L650,130 L580,150 L530,170 L490,160 Z" 
          fill={countryStatusMap.has("RU") && countryStatusMap.get("RU") === true ? "#1E40AF" : "#D1D5DB"}
          stroke="#fff"
          strokeWidth="1"
          onMouseEnter={(e) => handleCountryMouseEnter(e, "Russia", "RU")}
          onMouseLeave={handleCountryMouseLeave}
        />
        
        {/* China */}
        <path 
          d="M650,130 L720,150 L730,200 L680,210 L640,190 L620,160 Z" 
          fill={countryStatusMap.has("CN") && countryStatusMap.get("CN") === true ? "#1E40AF" : "#D1D5DB"}
          stroke="#fff"
          strokeWidth="1"
          onMouseEnter={(e) => handleCountryMouseEnter(e, "China", "CN")}
          onMouseLeave={handleCountryMouseLeave}
        />
        
        {/* Japan */}
        <path 
          d="M750,140 L770,160 L780,180 L770,200 L750,180 L740,160 Z" 
          fill={countryStatusMap.has("JP") && countryStatusMap.get("JP") === true ? "#1E40AF" : "#D1D5DB"}
          stroke="#fff"
          strokeWidth="1"
          onMouseEnter={(e) => handleCountryMouseEnter(e, "Japan", "JP")}
          onMouseLeave={handleCountryMouseLeave}
        />
        
        {/* India */}
        <path 
          d="M580,150 L630,160 L640,190 L620,220 L570,230 L550,200 Z" 
          fill={countryStatusMap.has("IN") && countryStatusMap.get("IN") === true ? "#1E40AF" : "#D1D5DB"}
          stroke="#fff"
          strokeWidth="1"
          onMouseEnter={(e) => handleCountryMouseEnter(e, "India", "IN")}
          onMouseLeave={handleCountryMouseLeave}
        />
        
        {/* Australia */}
        <path 
          d="M700,330 L750,320 L780,350 L770,390 L730,400 L690,370 Z" 
          fill={countryStatusMap.has("AU") && countryStatusMap.get("AU") === true ? "#1E40AF" : "#D1D5DB"}
          stroke="#fff"
          strokeWidth="1"
          onMouseEnter={(e) => handleCountryMouseEnter(e, "Australia", "AU")}
          onMouseLeave={handleCountryMouseLeave}
        />
        
        {/* Africa */}
        <path 
          d="M450,170 L500,180 L520,230 L490,300 L450,320 L400,300 L380,240 L420,200 Z" 
          fill={countryStatusMap.has("ZA") && countryStatusMap.get("ZA") === true ? "#1E40AF" : "#D1D5DB"}
          stroke="#fff"
          strokeWidth="1"
          onMouseEnter={(e) => handleCountryMouseEnter(e, "Africa", "ZA")}
          onMouseLeave={handleCountryMouseLeave}
        />
        
        {/* Add more countries as needed */}
      </svg>
      
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