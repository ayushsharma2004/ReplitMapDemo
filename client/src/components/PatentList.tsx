import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { type Patent } from "@shared/schema";

interface PatentListProps {
  patents: Patent[];
}

export default function PatentList({ patents }: PatentListProps) {
  const [expandedPatent, setExpandedPatent] = useState<string | null>(null);
  
  // If patents array is empty, show placeholder
  if (patents.length === 0) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>Patent Information</CardTitle>
          <CardDescription>
            No patent information available for this compound
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
            <p className="mt-2">No patent data found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format date string to readable format
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString; // Return original if parsing fails
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Patent Information</CardTitle>
        <CardDescription>
          {patents.length} patent{patents.length > 1 ? 's' : ''} found
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-auto">
        <Accordion 
          type="single" 
          collapsible 
          className="w-full"
          value={expandedPatent || undefined}
          onValueChange={(value) => setExpandedPatent(value)}
        >
          {patents.map((patent) => (
            <AccordionItem 
              key={patent.patent_id} 
              value={patent.patent_id}
              className="border-b border-border"
            >
              <AccordionTrigger className="py-3 hover:no-underline">
                <div className="flex flex-col items-start text-left">
                  <div className="font-medium">
                    {patent.patent_number} ({patent.country_code})
                  </div>
                  <div className="text-xs text-muted-foreground flex gap-2 mt-1">
                    <Badge 
                      variant={patent.patent_status.toLowerCase() === 'active' ? 'default' : 'secondary'}
                      className="text-[10px] h-4"
                    >
                      {patent.patent_status}
                    </Badge>
                    <span>Expires: {formatDate(patent.expiration_date)}</span>
                  </div>
                </div>
              </AccordionTrigger>
              
              <AccordionContent className="pb-4 pt-2">
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-muted-foreground">ID:</span>
                    <span className="col-span-2">{patent.patent_id}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-muted-foreground">Country:</span>
                    <span className="col-span-2">{patent.country_name} ({patent.country_code})</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-muted-foreground">Kind Code:</span>
                    <span className="col-span-2">{patent.kind_code}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-muted-foreground">Source:</span>
                    <span className="col-span-2">{patent.source}</span>
                  </div>
                  
                  <div className="pt-2">
                    <h4 className="font-medium text-xs uppercase tracking-wide text-muted-foreground mb-2">
                      Applications
                    </h4>
                    
                    <div className="space-y-2">
                      {patent.applications.map((app, index) => (
                        <div key={app.application_number} className="bg-slate-50 p-2 rounded text-xs">
                          <div className="flex justify-between">
                            <span className="font-medium">{app.application_number}</span>
                            <Badge 
                              variant={app.legal_status === 'active' ? 'outline' : 'secondary'}
                              className="text-[10px] h-4"
                            >
                              {app.legal_status}
                            </Badge>
                          </div>
                          <div className="mt-1 text-muted-foreground">
                            <span>{app.country_code} • Filed: {formatDate(app.filing_date)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full"
                      onClick={() => window.open(patent.url, '_blank')}
                    >
                      View Patent Details
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}