import React, { useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ToolbarHeader from "@/components/ToolbarHeader";
import WorldMapVisualization from "@/components/WorldMapVisualization";
import CountryDataPanel from "@/components/CountryDataPanel";
import { useState } from "react";
import { CountryData, PatentApplication, convertPatentApplicationsToCountryData } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Sample patent application data based on the provided format
const samplePatentData = (): CountryData[] => {
  try {
    // Use the sample data provided in the payload
    const patentApplications: PatentApplication[] = [
      { application_number: "JP2010544705A", country_code: "JP", filing_date: "2009-01-30", legal_status: "not_active" },
      { application_number: "EP09705290.6A", country_code: "EP", filing_date: "2009-01-30", legal_status: "active" },
      { application_number: "AU2009209601A", country_code: "AU", filing_date: "2009-01-30", legal_status: "active" },
      { application_number: "PCT/EP2009/051041", country_code: "WO", filing_date: "2009-01-30", legal_status: "active" },
      { application_number: "US12/865,311", country_code: "US", filing_date: "2009-01-30", legal_status: "active" },
      { application_number: "ES200800243A", country_code: "ES", filing_date: "2008-01-30", legal_status: "not_active" }
    ];
    
    // Convert patent applications to our country data format
    return convertPatentApplicationsToCountryData(patentApplications);
  } catch (error) {
    console.error("Error initializing patent data:", error);
    return []; // Return empty array if there's any error
  }
};

// Initialize country data from the patent applications
const initializeCountryData = (): CountryData[] => {
  const countryData = samplePatentData();
  
  // Validate the converted data
  return countryData.filter(country => 
    country && 
    typeof country.country === 'string' && 
    typeof country.leagueStatus === 'string' && 
    typeof country.active === 'boolean'
  );
};

export default function WorldMap() {
  const { toast } = useToast();
  const [countryData, setCountryData] = useState<CountryData[]>(initializeCountryData());
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Statistics calculations with safety checks
  const totalCountries = Array.isArray(countryData) ? countryData.length : 0;
  const activeCountries = Array.isArray(countryData) 
    ? countryData.filter(country => country && country.active).length 
    : 0;
  
  // Show error handling if no country data
  useEffect(() => {
    if (countryData.length === 0 && !hasError) {
      setHasError(true);
      toast({
        title: "Data Error",
        description: "Unable to load country data. Please refresh or try again later.",
        variant: "destructive",
      });
    }
  }, [countryData, hasError, toast]);
  
  const onDataUpdate = (newData: CountryData[]) => {
    try {
      // Validate data
      if (!Array.isArray(newData)) {
        throw new Error("Invalid data format: not an array");
      }
      
      // Filter out invalid entries
      const validData = newData.filter(item => 
        item && 
        typeof item.country === 'string' && 
        typeof item.leagueStatus === 'string' && 
        typeof item.active === 'boolean'
      );
      
      setCountryData(validData);
      
      if (validData.length === 0) {
        setHasError(true);
        toast({
          title: "Warning",
          description: "No valid country data provided. Map may not display correctly.",
          variant: "destructive",
        });
      } else {
        setHasError(false);
      }
    } catch (error) {
      console.error("Error updating country data:", error);
      toast({
        title: "Error",
        description: "Failed to update map data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMapLoaded = () => {
    setIsMapLoaded(true);
  };

  // Render error state if needed
  if (hasError && countryData.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <div className="flex flex-col md:flex-row flex-1">
          <Sidebar activeTab="World Map" />
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-red-500">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <h2 className="text-xl font-bold mb-2">Data Loading Error</h2>
              <p className="text-gray-600 mb-6">
                We couldn't load the country data for the map visualization. 
                Please try refreshing the page or check your data source.
              </p>
              <button 
                onClick={() => {
                  setCountryData(initializeCountryData());
                  setHasError(false);
                }}
                className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
              >
                Retry with Sample Data
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
