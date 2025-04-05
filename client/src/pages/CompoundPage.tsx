import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ToolbarHeader from "@/components/ToolbarHeader";
import CompoundVisualizer from "@/components/CompoundVisualizer";
import CompoundDetails from "@/components/CompoundDetails";
import PatentList from "@/components/PatentList";
import { useToast } from "@/hooks/use-toast";
import { CompoundData, Compound, SimilarCompound, Patent } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function CompoundPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [compoundData, setCompoundData] = useState<CompoundData | null>(null);
  const [currentCompound, setCurrentCompound] = useState<Compound | null>(null);
  const [similarCompounds, setSimilarCompounds] = useState<SimilarCompound[]>([]);
  const [patents, setPatents] = useState<Patent[]>([]);

  // Fetch compound data from API
  useEffect(() => {
    const fetchCompoundData = async () => {
      try {
        setIsLoading(true);
        const response = await apiRequest({
          url: '/api/compound',
          method: 'GET',
          on401: 'returnNull'
        });
        
        // Type assertion for response
        const data = response as unknown as CompoundData;
        
        if (data && data.pubchemResults) {
          setCompoundData(data);
          setCurrentCompound(data.pubchemResults.currentCompound);
          setSimilarCompounds(data.pubchemResults.similarCompound || []);
          setPatents(data.pubchemResults.patents || []);
          setHasError(false);
        } else {
          throw new Error("Invalid data structure received from API");
        }
      } catch (error) {
        console.error("Error fetching compound data:", error);
        setHasError(true);
        toast({
          title: "Error",
          description: "Failed to load compound data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompoundData();
  }, [toast]);

  // Error state display
  if (hasError) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <div className="flex flex-col md:flex-row flex-1">
          <Sidebar activeTab="Compound Info" />
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-red-500">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <h2 className="text-xl font-bold mb-2">Data Loading Error</h2>
              <p className="text-gray-600 mb-6">
                We couldn't load the compound data. 
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
        <Sidebar activeTab="Compound Info" />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <ToolbarHeader title="Chemical Compound Information" />
          
          <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Compound Visualization */}
            <div className="lg:col-span-1">
              <CompoundVisualizer 
                compound={currentCompound} 
                isLoaded={!isLoading}
              />
            </div>
            
            {/* Compound Details */}
            <div className="lg:col-span-1">
              <CompoundDetails 
                compound={currentCompound}
                similarCompounds={similarCompounds}
              />
            </div>
            
            {/* Patent Information */}
            <div className="lg:col-span-1">
              <PatentList
                patents={patents}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}