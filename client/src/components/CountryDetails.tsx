import React, { useState } from "react";
import { Country } from "@shared/schema";
import { CountryStats } from "@/lib/countriesData";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface CountryDetailsProps {
  selectedCountry: Country | null;
  countryStats: CountryStats;
  countries: Country[];
  onSelectCountry: (country: Country | null) => void;
}

const CountryDetails: React.FC<CountryDetailsProps> = ({ 
  selectedCountry, 
  countryStats, 
  countries,
  onSelectCountry
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const filteredCountries = countries.filter(country => 
    country.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleCountrySelect = (country: Country) => {
    onSelectCountry(country);
    setSearchQuery("");
  };
  
  return (
    <div className="bg-secondary rounded-lg p-4 w-full lg:w-72">
      <h2 className="text-lg font-medium mb-4">Country Details</h2>
      
      {selectedCountry ? (
        <Card className="border border-gray-700 rounded-lg mb-3">
          <CardContent className="p-3">
            <h3 className="font-medium text-primary mb-2">{selectedCountry.name}</h3>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">League Status:</span>
              <span className="text-white">{selectedCountry.status}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Active:</span>
              <span className={selectedCountry.active ? "text-green-400" : "text-red-400"}>
                {selectedCountry.active ? "Yes" : "No"}
              </span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-gray-700 rounded-lg mb-3">
          <CardContent className="p-3 text-center text-gray-400">
            No country selected
          </CardContent>
        </Card>
      )}
      
      <div className="mb-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search country..."
            className="w-full bg-[#121212] border border-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary pr-8"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <Search className="h-4 w-4 absolute right-3 top-2.5 text-gray-400" />
          
          {searchQuery && (
            <div className="absolute z-10 mt-1 w-full bg-[#1E1E2F] border border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
              {filteredCountries.length > 0 ? (
                filteredCountries.map(country => (
                  <div 
                    key={country.id} 
                    className="p-2 hover:bg-gray-700 cursor-pointer text-sm flex justify-between items-center"
                    onClick={() => handleCountrySelect(country)}
                  >
                    {country.name}
                    <Badge variant={country.active ? "default" : "secondary"} className="text-xs">
                      {country.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="p-2 text-gray-400 text-sm text-center">No countries found</div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="text-sm font-medium mb-2">Data Overview</div>
      <div className="mb-4 bg-[#121212] rounded-lg p-3">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-400">Active Countries:</span>
          <span className="text-sm text-white">{countryStats.activeCount}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-400">Premier League:</span>
          <span className="text-sm text-white">{countryStats.premierCount}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-400">Standard League:</span>
          <span className="text-sm text-white">{countryStats.standardCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-400">Basic League:</span>
          <span className="text-sm text-white">{countryStats.basicCount}</span>
        </div>
      </div>
      
      <div className="flex">
        <Button 
          className="bg-primary hover:bg-primary/80 text-white text-sm font-medium rounded-md py-2 px-4 w-1/2 mr-2"
          onClick={() => onSelectCountry(null)}
        >
          Clear Selection
        </Button>
        <Button 
          className="bg-[#121212] hover:bg-gray-800 text-white text-sm font-medium border border-gray-700 rounded-md py-2 px-4 w-1/2"
          variant="outline"
        >
          Export Map
        </Button>
      </div>
    </div>
  );
};

export default CountryDetails;
