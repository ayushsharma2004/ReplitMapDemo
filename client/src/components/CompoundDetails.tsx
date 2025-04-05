import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { type Compound, type SimilarCompound } from "@shared/schema";

interface CompoundDetailsProps {
  compound: Compound | null;
  similarCompounds: SimilarCompound[];
}

export default function CompoundDetails({ compound, similarCompounds }: CompoundDetailsProps) {
  // If compound is null, show skeleton loading state
  if (!compound) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent className="flex-1 space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
          <Separator className="my-4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>{compound.recordTitle || "Compound Information"}</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-4">
        <div>
          <h3 className="text-sm font-medium">Compound ID</h3>
          <p className="text-lg">
            <a 
              href={`https://pubchem.ncbi.nlm.nih.gov/compound/${compound.cid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              PubChem CID: {compound.cid}
            </a>
          </p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium">Structure</h3>
          <Badge variant="outline" className="mt-1 text-xs">
            SMILES: {compound.smile}
          </Badge>
        </div>
        
        <Separator className="my-4" />
        
        <div>
          <h3 className="text-sm font-medium mb-2">Similar Compounds</h3>
          
          {similarCompounds.length === 0 ? (
            <p className="text-sm text-muted-foreground">No similar compounds found</p>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {similarCompounds.map((similar) => (
                <AccordionItem key={similar.cid} value={`similar-${similar.cid}`}>
                  <AccordionTrigger className="text-sm">
                    <span className="flex items-center space-x-2">
                      <span>{similar.recordTitle}</span>
                      <Badge variant="secondary" className="ml-2">
                        {(similar.similarity_score * 100).toFixed(0)}% similar
                      </Badge>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="text-sm space-y-2 pt-2">
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-muted-foreground">CID:</span>
                        <span className="col-span-2">
                          <a 
                            href={`https://pubchem.ncbi.nlm.nih.gov/compound/${similar.cid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {similar.cid}
                          </a>
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-muted-foreground">IUPAC Name:</span>
                        <span className="col-span-2">{similar.iupacName}</span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-muted-foreground">SMILES:</span>
                        <code className="col-span-2 text-xs bg-slate-50 p-1 rounded break-all">
                          {similar.smile}
                        </code>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </CardContent>
    </Card>
  );
}