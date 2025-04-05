import React, { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ToolbarHeader from "@/components/ToolbarHeader";
import PatentWorldMap from "@/components/PatentWorldMap";
import { PatentResponse, PatentApplication } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function CompoundPage() {
  const { toast } = useToast();
  const [compoundName, setCompoundName] = useState<string>("D-Glutamic Acid");
  const [patentApplications, setPatentApplications] = useState<PatentApplication[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  
  // Function to handle the JSON data upload
  const handleDataUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string) as PatentResponse;
        
        // Validate data structure
        if (!jsonData.pubchemResults?.patents) {
          throw new Error("Invalid data format: missing patents information");
        }
        
        // Extract all patent applications
        const allApplications = jsonData.pubchemResults.patents.flatMap(patent => 
          patent.applications || []
        );
        
        // Update state
        setCompoundName(jsonData.pubchemResults.currentCompound?.recordTitle || "Unknown Compound");
        setPatentApplications(allApplications);
        
        // Show success message
        toast({
          title: "Data Loaded",
          description: `Loaded ${allApplications.length} patent applications for ${jsonData.pubchemResults.currentCompound?.recordTitle}`,
        });
        
        // Send the data to the server as well (optional)
        sendDataToServer(jsonData);
      } catch (error) {
        console.error("Error parsing JSON data:", error);
        toast({
          title: "Error",
          description: "Failed to parse the patent data. Please ensure it's in the correct format.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    reader.onerror = () => {
      toast({
        title: "Error",
        description: "Failed to read the file. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    };
    
    reader.readAsText(file);
  };
  
  // Function to send data to the server
  const sendDataToServer = async (data: PatentResponse) => {
    try {
      const response = await fetch('/api/patents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("Server processed data:", result);
    } catch (error) {
      console.error("Error sending data to server:", error);
      // We don't show a toast here since we already loaded the data client-side
    }
  };
  
  // Handle paste from clipboard
  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      
      try {
        const jsonData = JSON.parse(clipboardText) as PatentResponse;
        
        // Validate data structure
        if (!jsonData.pubchemResults?.patents) {
          throw new Error("Invalid data format: missing patents information");
        }
        
        // Extract all patent applications
        const allApplications = jsonData.pubchemResults.patents.flatMap(patent => 
          patent.applications || []
        );
        
        // Update state
        setCompoundName(jsonData.pubchemResults.currentCompound?.recordTitle || "Unknown Compound");
        setPatentApplications(allApplications);
        
        // Show success message
        toast({
          title: "Data Loaded",
          description: `Loaded ${allApplications.length} patent applications for ${jsonData.pubchemResults.currentCompound?.recordTitle}`,
        });
        
        // Send the data to the server as well (optional)
        sendDataToServer(jsonData);
      } catch (error) {
        console.error("Error parsing clipboard data:", error);
        toast({
          title: "Error",
          description: "Failed to parse the clipboard data. Please ensure it's valid JSON in the correct format.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error accessing clipboard:", error);
      toast({
        title: "Error",
        description: "Failed to access clipboard. Please check your browser permissions.",
        variant: "destructive",
      });
    }
  };
  
  // Handle sample data load
  const loadSampleData = () => {
    setIsLoading(true);
    
    // Load the sample data
    fetch('/api/sample-patent')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
        return response.json();
      })
      .then((data: PatentResponse) => {
        // Extract all patent applications
        const allApplications = data.pubchemResults.patents.flatMap(patent => 
          patent.applications || []
        );
        
        // Update state
        setCompoundName(data.pubchemResults.currentCompound?.recordTitle || "Unknown Compound");
        setPatentApplications(allApplications);
        
        // Show success message
        toast({
          title: "Sample Data Loaded",
          description: `Loaded ${allApplications.length} patent applications for ${data.pubchemResults.currentCompound?.recordTitle}`,
        });
      })
      .catch(error => {
        console.error("Error loading sample data:", error);
        
        // Since we don't have a real endpoint, let's use hardcoded sample data
        const sampleData: PatentApplication[] = [
          { application_number: "JP2010544705A", country_code: "JP", filing_date: "2009-01-30", legal_status: "not_active" },
          { application_number: "EP09705290.6A", country_code: "EP", filing_date: "2009-01-30", legal_status: "active" },
          { application_number: "AU2009209601A", country_code: "AU", filing_date: "2009-01-30", legal_status: "active" },
          { application_number: "PCT/EP2009/051041", country_code: "WO", filing_date: "2009-01-30", legal_status: "active" },
          { application_number: "US12/865,311", country_code: "US", filing_date: "2009-01-30", legal_status: "active" },
          { application_number: "ES200800243A", country_code: "ES", filing_date: "2008-01-30", legal_status: "not_active" },
        ];
        
        setCompoundName("D-Glutamic Acid");
        setPatentApplications(sampleData);
        
        toast({
          title: "Sample Data Loaded",
          description: `Loaded ${sampleData.length} sample patent applications`,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <div className="flex flex-col md:flex-row flex-1">
        <Sidebar activeTab="Compound" />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <ToolbarHeader title={`Patent Map: ${compoundName}`} />
          
          <div className="flex flex-col p-4 mb-4 bg-white rounded-lg shadow mx-4 mt-4">
            <h2 className="text-lg font-medium mb-2">Load Patent Data</h2>
            <p className="text-gray-600 mb-4">
              Upload a JSON file with patent data to visualize countries with active patents.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <div>
                <label 
                  htmlFor="file-upload"
                  className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-primary text-white hover:bg-primary/90 cursor-pointer"
                >
                  Upload JSON File
                  <input
                    id="file-upload"
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleDataUpload}
                    disabled={isLoading}
                  />
                </label>
              </div>
              
              <button
                className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-gray-100 text-gray-900 hover:bg-gray-200"
                onClick={handlePaste}
                disabled={isLoading}
              >
                Paste from Clipboard
              </button>
              
              <button
                className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-gray-100 text-gray-900 hover:bg-gray-200"
                onClick={loadSampleData}
                disabled={isLoading}
              >
                Load Sample Data
              </button>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col md:flex-row mx-4 mb-4 gap-4">
            <div className="w-full md:w-3/4 flex flex-col bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b">
                <h2 className="text-lg font-medium">Patent Jurisdiction Map</h2>
                <p className="text-sm text-gray-500">
                  Blue countries have active patent applications. Gray countries have no active applications.
                </p>
              </div>
              
              <div className="flex-1 relative min-h-[400px]">
                <PatentWorldMap 
                  patentApplications={patentApplications}
                  loading={isLoading}
                  onMapLoaded={() => setIsMapLoaded(true)}
                />
              </div>
            </div>
            
            <div className="w-full md:w-1/4 bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h2 className="text-lg font-medium">Patent Applications</h2>
              </div>
              
              <div className="p-4 max-h-[400px] overflow-y-auto">
                {patentApplications.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    {isLoading ? (
                      <p>Loading patent data...</p>
                    ) : (
                      <p>No patent applications loaded. Please upload data or use the sample data.</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {patentApplications.map((app, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{app.country_code}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            app.legal_status === "active" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {app.legal_status === "active" ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">{app.application_number}</div>
                        <div className="text-xs text-gray-500">Filed: {app.filing_date}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}