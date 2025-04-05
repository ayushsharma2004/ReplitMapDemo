import React, { useState } from 'react';
import { PatentResponse } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

interface DirectJsonUploadProps {
  onDataLoaded: (data: PatentResponse) => void;
  isLoading: boolean;
}

export default function DirectJsonUpload({ onDataLoaded, isLoading }: DirectJsonUploadProps) {
  const { toast } = useToast();
  const [jsonInput, setJsonInput] = useState('');
  
  const handleSubmit = () => {
    try {
      if (!jsonInput.trim()) {
        toast({
          title: "Empty Input",
          description: "Please enter JSON data before submitting.",
          variant: "destructive",
        });
        return;
      }
      
      const data = JSON.parse(jsonInput) as PatentResponse;
      
      // Validate data structure
      if (!data.pubchemResults?.patents) {
        throw new Error("Invalid data format: missing patents information");
      }
      
      // Process the data
      onDataLoaded(data);
      
      // Clear the input after successful submission
      setJsonInput('');
      
      toast({
        title: "Success",
        description: "Patent data loaded successfully.",
      });
    } catch (error) {
      console.error("Error processing JSON input:", error);
      toast({
        title: "Invalid JSON",
        description: "The provided text is not valid JSON or doesn't match the expected format.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow mb-4">
      <h2 className="text-lg font-medium">Direct JSON Input</h2>
      <p className="text-sm text-gray-500">
        Paste the JSON data directly in the text area below.
      </p>
      
      <textarea
        className="w-full border rounded-md p-3 min-h-[150px] font-mono text-sm"
        placeholder='{
  "pubchemResults": {
    "currentCompound": { ... },
    "patents": [ ... ],
    ...
  },
  "success": true
}'
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
        disabled={isLoading}
      />
      
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isLoading || !jsonInput.trim()}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          Process JSON
        </button>
      </div>
    </div>
  );
}