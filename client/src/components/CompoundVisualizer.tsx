import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type Compound } from "@shared/schema";

interface CompoundVisualizerProps {
  compound: Compound | null;
  isLoaded: boolean;
}

export default function CompoundVisualizer({ compound, isLoaded }: CompoundVisualizerProps) {
  const [smileString, setSmileString] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  // Update SMILE string when compound changes
  useEffect(() => {
    if (compound && compound.smile) {
      setSmileString(compound.smile);
      // Generate compound image URL based on SMILE string
      generateImageUrl(compound.smile);
    }
  }, [compound]);
  
  // Generate image URL from SMILE string using PubChem service
  const generateImageUrl = (smile: string) => {
    try {
      // Convert SMILE to URL-safe format
      const encodedSmile = encodeURIComponent(smile);
      // Use PubChem's service to generate structure image
      const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodedSmile}/PNG`;
      setImageUrl(url);
    } catch (error) {
      console.error("Error generating image URL:", error);
      setImageUrl(null);
    }
  };
  
  // If compound CID is available, we can also use direct image from PubChem
  const getCompoundImageUrl = (cid: number) => {
    return `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/PNG`;
  };
  
  // Handle SMILE string change
  const handleSmileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSmileString(e.target.value);
  };
  
  // Handle load SMILE button click
  const handleLoadSmile = () => {
    if (smileString) {
      generateImageUrl(smileString);
    }
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Compound Visualization</CardTitle>
        <CardDescription>
          {isLoaded && compound 
            ? `CID: ${compound.cid}` 
            : "Loading compound information..."}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col space-y-4">
        {!isLoaded ? (
          <div className="flex-1 flex flex-col space-y-3">
            <Skeleton className="h-[250px] w-full rounded-md" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-32" />
          </div>
        ) : (
          <>
            <div className="flex-1 flex items-center justify-center bg-slate-50 rounded-md p-4">
              {imageUrl ? (
                <img 
                  src={compound?.cid ? getCompoundImageUrl(compound.cid) : imageUrl}
                  alt={compound?.recordTitle || "Chemical compound visualization"}
                  className="max-h-[250px] object-contain"
                  onError={() => {
                    // Fallback if direct CID image fails
                    if (compound?.cid && imageUrl !== getCompoundImageUrl(compound.cid)) {
                      setImageUrl(imageUrl);
                    }
                  }}
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="mx-auto h-12 w-12 text-muted" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
                    />
                  </svg>
                  <p className="mt-2">No compound visualization available</p>
                </div>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Input 
                value={smileString} 
                onChange={handleSmileChange}
                placeholder="Enter SMILES to view the image"
                className="flex-1"
              />
              <Button 
                onClick={handleLoadSmile}
                variant="outline"
              >
                Load SMILES
              </Button>
            </div>
            
            {compound && (
              <div className="text-sm text-muted-foreground">
                <strong>SMILES:</strong> {compound.smile}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}