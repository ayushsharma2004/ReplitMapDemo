import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ToolbarHeader from "@/components/ToolbarHeader";
import PatentWorldMap from "@/components/PatentWorldMap";
import { useToast } from "@/hooks/use-toast";
import { CompoundData, PatentApplication } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function PatentMapPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [patentApplications, setPatentApplications] = useState<PatentApplication[]>([]);
  
  // Fetch patent application data
  useEffect(() => {
    const fetchPatentData = async () => {
      try {
        setIsLoading(true);
        const response = await apiRequest({
          url: '/api/compound',
          method: 'GET',
          on401: 'returnNull'
        });
        
        // Type assertion for response
        const data = response as unknown as CompoundData;
        
        if (data && data.pubchemResults && data.pubchemResults.patents) {
          // Extract all patent applications from all patents
          const allApplications = data.pubchemResults.patents.flatMap(patent => 
            patent.applications || []
          );
          
          setPatentApplications(allApplications);
          setHasError(false);
        } else {
          throw new Error("Invalid data structure received from API");
        }
      } catch (error) {
        console.error("Error fetching patent data:", error);
        setHasError(true);
        toast({
          title: "Error",
          description: "Failed to load patent application data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatentData();
  }, [toast]);

  // Error state display
  if (hasError) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <div className="flex flex-col md:flex-row flex-1">
          <Sidebar activeTab="Patent World Map" />
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-red-500">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <h2 className="text-xl font-bold mb-2">Data Loading Error</h2>
              <p className="text-gray-600 mb-6">
                We couldn't load the patent application data. 
                Please try refreshing the page or check your data source.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
              >
                Retry
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
        <Sidebar activeTab="Patent World Map" />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <ToolbarHeader title="Patent Applications World Map" />
          
          <div className="flex-1 p-4">
            <div className="bg-white rounded-lg shadow-sm p-4 h-full">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <svg className="animate-spin h-10 w-10 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-muted-foreground">Loading patent application data...</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold">Patent Applications by Country</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      This map shows countries with active patent applications in blue. Hover over a country to see detailed patent application information.
                    </p>
                  </div>
                  
                  {/* Patent application stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-accent/30 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Applications</h3>
                      <p className="text-2xl font-bold">{patentApplications.length}</p>
                    </div>
                    <div className="bg-green-100 dark:bg-green-900/20 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Active Applications</h3>
                      <p className="text-2xl font-bold">{patentApplications.filter(app => app.legal_status === "active").length}</p>
                    </div>
                    <div className="bg-red-100 dark:bg-red-900/20 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Inactive Applications</h3>
                      <p className="text-2xl font-bold">{patentApplications.filter(app => app.legal_status !== "active").length}</p>
                    </div>
                  </div>
                  
                  {/* Map visualization */}
                  <div className="h-[500px]">
                    <PatentWorldMap patentApplications={patentApplications} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}