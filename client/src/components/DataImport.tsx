import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Country } from "@shared/schema";
import { Loader2 } from "lucide-react";

interface DataImportProps {
  onImportData: (data: Omit<Country, "id">[]) => void;
  isLoading: boolean;
}

const countrySchema = z.object({
  name: z.string().min(1, "Country name is required"),
  status: z.enum(["Premier", "Standard", "Basic"], {
    errorMap: () => ({ message: "Status must be Premier, Standard, or Basic" }),
  }),
  active: z.boolean(),
});

const importDataSchema = z.array(countrySchema);

const DataImport: React.FC<DataImportProps> = ({ onImportData, isLoading }) => {
  const { toast } = useToast();
  const [jsonData, setJsonData] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonData(e.target.value);
  };

  const handleClear = () => {
    setJsonData("");
  };

  const handleLoadData = () => {
    if (!jsonData.trim()) {
      toast({
        title: "Error",
        description: "Please enter JSON data",
        variant: "destructive",
      });
      return;
    }

    try {
      // First parse as JSON
      const parsedData = JSON.parse(jsonData);
      
      // Then validate with Zod schema
      const validatedData = importDataSchema.parse(parsedData);
      
      // Call the import function
      onImportData(validatedData);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      
      let errorMessage = "Invalid JSON format";
      if (error instanceof z.ZodError) {
        errorMessage = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Invalid data format",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mt-4 bg-secondary rounded-lg p-4">
      <h2 className="text-lg font-medium mb-3">Import Data</h2>
      <div className="flex mb-3">
        <div className="flex-1 mr-2">
          <Textarea
            className="w-full h-24 bg-[#121212] border border-gray-700 rounded-md px-3 py-2 text-sm font-mono text-gray-300"
            placeholder="Enter JSON data for country status..."
            value={jsonData}
            onChange={handleInputChange}
          />
        </div>
        <div className="flex flex-col justify-end">
          <Button
            className="bg-primary hover:bg-primary/80 text-white text-sm font-medium rounded-md py-2 px-4 mb-2"
            onClick={handleLoadData}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load Data"
            )}
          </Button>
          <Button
            className="bg-[#121212] hover:bg-gray-800 text-white text-sm font-medium border border-gray-700 rounded-md py-2 px-4"
            variant="outline"
            onClick={handleClear}
            disabled={isLoading}
          >
            Clear
          </Button>
        </div>
      </div>
      <div className="text-xs text-gray-400">
        Format: [{`name: "Country Name", status: "Premier|Standard|Basic", active: true|false`}]
      </div>
    </div>
  );
};

export default DataImport;
