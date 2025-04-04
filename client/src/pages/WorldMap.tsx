import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Country } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import CountryMap from "@/components/CountryMap";
import CountryDetails from "@/components/CountryDetails";
import DataImport from "@/components/DataImport";
import { calculateCountryStats } from "@/lib/countriesData";
import { Loader2 } from "lucide-react";

export default function WorldMap() {
  const { toast } = useToast();
  const [selectedCountry, setSelectedCountry] = React.useState<Country | null>(null);

  // Fetch countries data
  const { data: countries, isLoading, isError } = useQuery({
    queryKey: ['/api/countries'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Update countries data mutation
  const updateCountriesMutation = useMutation({
    mutationFn: (countries: Omit<Country, "id">[]) => 
      apiRequest('POST', '/api/countries/bulk', countries),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/countries'] });
      toast({
        title: "Success",
        description: "Country data has been updated",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating countries",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  });

  // Calculate country statistics
  const countryStats = React.useMemo(() => {
    if (!countries) return { activeCount: 0, premierCount: 0, standardCount: 0, basicCount: 0 };
    return calculateCountryStats(countries);
  }, [countries]);

  // Handle importing data
  const handleImportData = async (importedData: Omit<Country, "id">[]) => {
    updateCountriesMutation.mutate(importedData);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center p-3 border-b border-gray-800">
        <div className="flex items-center">
          <button className="mr-4 text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <button className="mr-4 text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
          <button className="mr-4 text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        <div className="flex-1 mx-4">
          <div className="relative flex items-center">
            <input 
              type="text" 
              value="storage.googleapis.com/fyled-dashboard-demo/index.html?ignoreCache=1" 
              className="bg-gray-800 text-sm rounded-md py-1 px-3 w-full text-gray-300" 
              readOnly 
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
          </button>
          <button className="bg-primary hover:bg-primary/80 text-white rounded-md px-4 py-1 text-sm font-medium">
            Finish update
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex h-[calc(100vh-48px)]">
        {/* Sidebar */}
        <aside className="w-16 bg-secondary border-r border-gray-800 flex flex-col items-center py-4">
          <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m-6-8h6M5 8h.01M5 12h.01M5 16h.01M19 8h.01M19 12h.01M19 16h.01" />
            </svg>
          </div>
          <button className="w-10 h-10 rounded-md flex items-center justify-center mb-2 text-gray-400 hover:text-white hover:bg-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          <button className="w-10 h-10 rounded-md flex items-center justify-center mb-2 text-gray-400 hover:text-white hover:bg-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </button>
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-auto">
          <div className="flex items-center p-4 border-b border-gray-800">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m-6-8h6M5 8h.01M5 12h.01M5 16h.01M19 8h.01M19 12h.01M19 16h.01" />
                </svg>
              </div>
              <h1 className="text-lg font-semibold">Fyled AI</h1>
            </div>
          </div>

          <div className="p-4 flex-1 overflow-auto">
            <Tabs defaultValue="worldMap" className="mb-4">
              <TabsList>
                <TabsTrigger value="worldMap" className="px-4 py-2">World Map</TabsTrigger>
                <TabsTrigger value="drawCompound" className="px-4 py-2">Draw Compound</TabsTrigger>
                <TabsTrigger value="uploadImage" className="px-4 py-2">Upload Image</TabsTrigger>
                <TabsTrigger value="uploadPdf" className="px-4 py-2">Upload PDF</TabsTrigger>
              </TabsList>
              
              <TabsContent value="worldMap" className="mt-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-80">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    <span className="ml-2 text-lg">Loading map data...</span>
                  </div>
                ) : isError ? (
                  <div className="flex items-center justify-center h-80 text-destructive">
                    <span>Error loading map data. Please try again.</span>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col lg:flex-row gap-4">
                      <CountryMap 
                        countries={countries || []} 
                        selectedCountry={selectedCountry}
                        setSelectedCountry={setSelectedCountry}
                      />
                      <CountryDetails 
                        selectedCountry={selectedCountry} 
                        countryStats={countryStats}
                        countries={countries || []}
                        onSelectCountry={setSelectedCountry}
                      />
                    </div>
                    
                    <DataImport 
                      onImportData={handleImportData} 
                      isLoading={updateCountriesMutation.isPending}
                    />
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="drawCompound">
                <div className="p-8 text-center text-gray-400">
                  Draw Compound functionality would go here
                </div>
              </TabsContent>
              
              <TabsContent value="uploadImage">
                <div className="p-8 text-center text-gray-400">
                  Upload Image functionality would go here
                </div>
              </TabsContent>
              
              <TabsContent value="uploadPdf">
                <div className="p-8 text-center text-gray-400">
                  Upload PDF functionality would go here
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
