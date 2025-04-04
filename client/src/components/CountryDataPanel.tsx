import React, { useState } from "react";
import { CountryData } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface CountryDataPanelProps {
  countryData: CountryData[];
  onDataUpdate: (data: CountryData[]) => void;
  stats: {
    totalCountries: number;
    activeCountries: number;
  };
}

export default function CountryDataPanel({ countryData, onDataUpdate, stats }: CountryDataPanelProps) {
  const [jsonInput, setJsonInput] = useState<string>(JSON.stringify(countryData, null, 2));
  const { toast } = useToast();

  const handleApplyData = () => {
    try {
      const data = JSON.parse(jsonInput) as CountryData[];
      onDataUpdate(data);
      
      toast({
        title: "Success",
        description: "Map data updated successfully",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid JSON format",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-80 border-l border-border overflow-y-auto hidden md:block bg-gray-50">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Country Data</h2>
        
        {/* Data input section */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Country Data (JSON)</label>
          <div className="relative">
            <textarea 
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded p-2 text-sm font-mono h-64 shadow-sm"
              placeholder={`[
  {
    "country": "United States",
    "leagueStatus": "Premier",
    "active": true
  },
  {
    "country": "Canada",
    "leagueStatus": "Standard",
    "active": true
  }
]`}
            ></textarea>
          </div>
        </div>
        
        <button 
          onClick={handleApplyData}
          className="w-full bg-primary hover:bg-primary/90 text-white font-medium rounded px-4 py-2 mb-4 shadow-sm">
          Apply Data to Map
        </button>
        
        {/* Map Legend */}
        <div className="border border-gray-200 rounded p-3 bg-white shadow-sm">
          <h3 className="text-sm font-medium mb-2">Map Legend</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-primary rounded mr-2"></div>
              <span>Active Country</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
              <span>Inactive Country</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 border border-gray-400 rounded mr-2 bg-gray-100"></div>
              <span>No Data</span>
            </div>
          </div>
        </div>
        
        {/* Stats Section */}
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Statistics</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white p-3 rounded shadow-sm border border-gray-200">
              <div className="text-xs text-gray-500">Total Countries</div>
              <div className="text-lg font-semibold">{stats.totalCountries}</div>
            </div>
            <div className="bg-white p-3 rounded shadow-sm border border-gray-200">
              <div className="text-xs text-gray-500">Active Countries</div>
              <div className="text-lg font-semibold text-primary">{stats.activeCountries}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
