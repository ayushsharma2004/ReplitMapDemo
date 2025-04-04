import React from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ToolbarHeader from "@/components/ToolbarHeader";
import WorldMapVisualization from "@/components/WorldMapVisualization";
import CountryDataPanel from "@/components/CountryDataPanel";
import { useState } from "react";
import { CountryData } from "@shared/schema";

const sampleCountryData: CountryData[] = [
  { country: "United States", leagueStatus: "Premier", active: true },
  { country: "Canada", leagueStatus: "Standard", active: true },
  { country: "United Kingdom", leagueStatus: "Premier", active: true },
  { country: "France", leagueStatus: "Premier", active: true },
  { country: "Germany", leagueStatus: "Premier", active: true },
  { country: "Japan", leagueStatus: "Standard", active: true },
  { country: "Australia", leagueStatus: "Standard", active: true },
  { country: "Brazil", leagueStatus: "Premier", active: true },
  { country: "Russia", leagueStatus: "Basic", active: false },
  { country: "India", leagueStatus: "Standard", active: true },
  { country: "China", leagueStatus: "Basic", active: false },
  { country: "South Africa", leagueStatus: "Standard", active: true },
  { country: "Mexico", leagueStatus: "Standard", active: true },
  { country: "Italy", leagueStatus: "Premier", active: true },
  { country: "Spain", leagueStatus: "Premier", active: true }
];

export default function WorldMap() {
  const [countryData, setCountryData] = useState<CountryData[]>(sampleCountryData);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Statistics calculations
  const totalCountries = countryData.length;
  const activeCountries = countryData.filter(country => country.active).length;
  
  const onDataUpdate = (newData: CountryData[]) => {
    setCountryData(newData);
  };

  const handleMapLoaded = () => {
    setIsMapLoaded(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <div className="flex flex-col md:flex-row flex-1">
        <Sidebar activeTab="World Map" />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <ToolbarHeader title="World Map Visualization" />
          
          <div className="flex-1 flex">
            <WorldMapVisualization 
              countryData={countryData} 
              isLoaded={isMapLoaded}
              onMapLoaded={handleMapLoaded}
            />
            
            <CountryDataPanel 
              countryData={countryData}
              onDataUpdate={onDataUpdate}
              stats={{
                totalCountries,
                activeCountries
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
