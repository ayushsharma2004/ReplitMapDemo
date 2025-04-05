import React, { useState, useEffect } from "react";
import { 
  CountryData, 
  countrySchema,
  PatentApplication, 
  convertPatentApplicationsToCountryData,
  pubChemResponseSchema,
  extractPatentApplicationsFromPubChem,
  PubChemResponse
} from "@shared/schema";
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
  const [jsonInput, setJsonInput] = useState<string>("");
  const [hasInputError, setHasInputError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { toast } = useToast();

  // Initialize JSON input safely when countryData changes
  useEffect(() => {
    try {
      if (Array.isArray(countryData) && countryData.length > 0) {
        setJsonInput(JSON.stringify(countryData, null, 2));
        setHasInputError(false);
        setErrorMessage("");
      }
    } catch (error) {
      console.error("Error stringifying country data:", error);
      // Don't update the textarea if there's an error to avoid losing user input
    }
  }, [countryData]);

  // Validate JSON input as user types
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target.value;
    setJsonInput(input);
    
    // Only validate if there's actual content
    if (input.trim().length === 0) {
      setHasInputError(false);
      setErrorMessage("");
      return;
    }
    
    try {
      JSON.parse(input);
      setHasInputError(false);
      setErrorMessage("");
    } catch (error) {
      setHasInputError(true);
      setErrorMessage("Invalid JSON format");
    }
  };

  // Format the JSON in the textarea
  const handleFormatJSON = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed, null, 2));
      setHasInputError(false);
      setErrorMessage("");
      
      toast({
        title: "Success",
        description: "JSON formatted successfully",
        variant: "default",
      });
    } catch (error) {
      setHasInputError(true);
      setErrorMessage("Cannot format invalid JSON");
      
      toast({
        title: "Error",
        description: "Invalid JSON format. Please correct the syntax errors.",
        variant: "destructive",
      });
    }
  };

  // Reset to original data
  const handleResetData = () => {
    try {
      if (Array.isArray(countryData)) {
        setJsonInput(JSON.stringify(countryData, null, 2));
        setHasInputError(false);
        setErrorMessage("");
        
        toast({
          title: "Reset Complete",
          description: "Data has been reset to the original values",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error resetting data:", error);
      toast({
        title: "Error",
        description: "Could not reset data",
        variant: "destructive",
      });
    }
  };

  // Apply the JSON data to the map with enhanced validation
  const handleApplyData = () => {
    if (hasInputError) {
      toast({
        title: "Error",
        description: "Please fix the JSON syntax errors before applying",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Try to parse the JSON
      const parsedData = JSON.parse(jsonInput);
      
      // Check if this is PubChem data format with nested structure
      const isPubChemFormat = parsedData && 
                              typeof parsedData === 'object' && 
                              parsedData.pubchemResults && 
                              parsedData.pubchemResults.patents;
      
      let countryData: CountryData[] = [];
      
      if (isPubChemFormat) {
        // Process PubChem format
        try {
          // Extract applications from PubChem format
          const applications = extractPatentApplicationsFromPubChem(parsedData as PubChemResponse);
          
          if (applications.length === 0) {
            toast({
              title: "Error",
              description: "No patent applications found in the PubChem data",
              variant: "destructive",
            });
            return;
          }
          
          // Convert applications to country data
          countryData = convertPatentApplicationsToCountryData(applications);
          
          toast({
            title: "Success",
            description: `Processed PubChem data with ${applications.length} patent applications into ${countryData.length} countries`,
            variant: "default",
          });
        } catch (error) {
          console.error("Error processing PubChem data:", error);
          toast({
            title: "Error",
            description: "Failed to process PubChem data",
            variant: "destructive",
          });
          return;
        }
      } else if (Array.isArray(parsedData)) {
        // Check if it's an array of patent applications
        const isPatentFormat = parsedData.length > 0 && 
          typeof parsedData[0] === 'object' && 
          parsedData[0] !== null &&
          'country_code' in parsedData[0] && 
          'legal_status' in parsedData[0];
        
        if (isPatentFormat) {
          // Handle patent application format
          try {
            // Validate patent format
            const validPatentData = parsedData.filter(item => 
              item && 
              typeof item === 'object' &&
              typeof item.country_code === 'string' && 
              typeof item.legal_status === 'string' &&
              (item.legal_status === 'active' || item.legal_status === 'not_active')
            );
            
            if (validPatentData.length === 0) {
              toast({
                title: "Error",
                description: "No valid patent application data found",
                variant: "destructive",
              });
              return;
            }
            
            // Convert patent applications to our country data format
            countryData = convertPatentApplicationsToCountryData(validPatentData as PatentApplication[]);
            
            toast({
              title: "Success",
              description: `Converted ${validPatentData.length} patent applications to ${countryData.length} countries`,
              variant: "default",
            });
          } catch (error) {
            console.error("Error converting patent data:", error);
            toast({
              title: "Error",
              description: "Failed to process patent application data",
              variant: "destructive",
            });
            return;
          }
        } else {
          // Handle direct country data format
          // Initialize counters for validation reporting
          let validCount = 0;
          let invalidCount = 0;
          let emptyCount = 0;
          let duplicateCount = 0;
          
          // Track country names to check for duplicates
          const countryNames = new Set<string>();
          
          // Validate each country object has the required fields
          countryData = parsedData.filter(item => {
            // Skip null or non-object items
            if (!item || typeof item !== 'object') {
              invalidCount++;
              return false;
            }
            
            // Skip empty objects
            if (Object.keys(item).length === 0) {
              emptyCount++;
              return false;
            }
            
            // Check required properties
            const isValid = (
              typeof item.country === 'string' && 
              item.country.trim() !== '' &&
              typeof item.leagueStatus === 'string' && 
              typeof item.active === 'boolean'
            );
            
            if (!isValid) {
              invalidCount++;
              return false;
            }
            
            // Check for duplicates
            if (countryNames.has(item.country.toLowerCase())) {
              duplicateCount++;
              return false;
            }
            
            // Add to tracking set if valid
            countryNames.add(item.country.toLowerCase());
            validCount++;
            return true;
          });
          
          // Build detailed validation message
          let validationMessage = `${validCount} valid countries`;
          const issues = [];
          
          if (invalidCount > 0) issues.push(`${invalidCount} invalid entries`);
          if (emptyCount > 0) issues.push(`${emptyCount} empty objects`);
          if (duplicateCount > 0) issues.push(`${duplicateCount} duplicates`);
          
          if (issues.length > 0) {
            validationMessage += ` (removed: ${issues.join(", ")})`;
          }
          
          if (countryData.length > 0) {
            toast({
              title: "Success",
              description: `Map updated with ${validationMessage}`,
              variant: "default",
            });
          } else {
            toast({
              title: "Error",
              description: "No valid country data found",
              variant: "destructive",
            });
            return;
          }
        }
      } else {
        toast({
          title: "Error",
          description: "Unsupported data format. Please check the schema information below.",
          variant: "destructive",
        });
        return;
      }
      
      // Only proceed if we have valid data
      if (countryData.length > 0) {
        onDataUpdate(countryData);
      } else {
        toast({
          title: "Error",
          description: "No valid data found to update the map",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("JSON parsing error:", error);
      toast({
        title: "Error",
        description: "Invalid JSON format. Please check your input.",
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
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium">Country Data (JSON)</label>
            <div className="flex space-x-1">
              <button 
                onClick={handleFormatJSON}
                className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                title="Format JSON"
              >
                Format
              </button>
              <button 
                onClick={handleResetData}
                className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                title="Reset to original data"
              >
                Reset
              </button>
            </div>
          </div>
          
          <div className="relative">
            <textarea 
              value={jsonInput}
              onChange={handleInputChange}
              className={`w-full bg-white border ${hasInputError ? 'border-red-500' : 'border-gray-300'} rounded p-2 text-sm font-mono h-64 shadow-sm transition-colors`}
              placeholder={`{
  "pubchemResults": {
    "currentCompound": {
      "cid": 23327,
      "recordTitle": "D-Glutamic Acid",
      "smile": "N[C@H](CCC(O)=O)C(=O)O"
    },
    "patents": [
      {
        "applications": [
          {
            "application_number": "JP2010544705A",
            "country_code": "JP",
            "filing_date": "2009-01-30",
            "legal_status": "not_active"
          },
          {
            "application_number": "US12/865,311",
            "country_code": "US",
            "filing_date": "2009-01-30",
            "legal_status": "active"
          }
        ],
        "country_code": "AU"
      }
    ]
  },
  "success": true
}`}
            ></textarea>
            
            {/* Error message display */}
            {hasInputError && (
              <div className="text-xs text-red-500 mt-1 pl-1">
                {errorMessage || "Invalid JSON format"}
              </div>
            )}
          </div>
        </div>
        
        <button 
          onClick={handleApplyData}
          disabled={hasInputError}
          className={`w-full ${hasInputError ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'} text-white font-medium rounded px-4 py-2 mb-4 shadow-sm transition-colors`}
        >
          Apply Data to Map
        </button>
        
        {/* Schema Information */}
        <div className="mb-4 border border-gray-200 rounded p-3 bg-white shadow-sm">
          <h3 className="text-sm font-medium mb-1">Supported Formats</h3>
          
          <div className="mt-2">
            <h4 className="text-xs font-semibold mb-1">1. Standard Country Format</h4>
            <div className="text-xs text-gray-600 font-mono bg-gray-50 p-2 rounded">
              <p>{"{"}</p>
              <p className="pl-2">"country": "String (required)",</p>
              <p className="pl-2">"leagueStatus": "String (required)",</p>
              <p className="pl-2">"active": "Boolean (required)"</p>
              <p>{"}"}</p>
            </div>
          </div>
          
          <div className="mt-2">
            <h4 className="text-xs font-semibold mb-1">2. Patent Application Format</h4>
            <div className="text-xs text-gray-600 font-mono bg-gray-50 p-2 rounded">
              <p>{"{"}</p>
              <p className="pl-2">"application_number": "String",</p>
              <p className="pl-2">"country_code": "String (required)",</p>
              <p className="pl-2">"filing_date": "String",</p>
              <p className="pl-2">"legal_status": "'active' | 'not_active' (required)"</p>
              <p>{"}"}</p>
            </div>
          </div>
          
          <div className="mt-2">
            <h4 className="text-xs font-semibold mb-1">3. PubChem API Response Format</h4>
            <div className="text-xs text-gray-600 font-mono bg-gray-50 p-2 rounded">
              <pre className="whitespace-pre-wrap">
{`{
  "pubchemResults": {
    "currentCompound": { ... },
    "patents": [
      {
        "applications": [ ... ]
      }
    ]
  }
}`}
              </pre>
            </div>
          </div>
        </div>
        
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
              <div className="text-lg font-semibold">{stats.totalCountries || 0}</div>
            </div>
            <div className="bg-white p-3 rounded shadow-sm border border-gray-200">
              <div className="text-xs text-gray-500">Active Countries</div>
              <div className="text-lg font-semibold text-primary">{stats.activeCountries || 0}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
