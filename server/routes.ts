import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { countryDataSchema, patentApplicationsToCountryData, PatentResponse } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for country data
  app.get("/api/countries", (req: Request, res: Response) => {
    try {
      const countries = storage.getCountries();
      res.json(countries);
    } catch (error) {
      console.error("Error retrieving countries:", error);
      res.status(500).json({ 
        error: "Failed to retrieve country data", 
        message: "An unexpected error occurred while retrieving country data."
      });
    }
  });

  app.post("/api/countries", (req: Request, res: Response) => {
    try {
      // Validate request body format
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ 
          error: "Invalid request format", 
          message: "The request body must be a valid JSON object containing country data."
        });
      }

      // Check if data is an array
      if (!Array.isArray(req.body)) {
        return res.status(400).json({
          error: "Invalid data format",
          message: "Country data must be provided as an array."
        });
      }

      // Validate the data against the schema
      const validationResult = countryDataSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        // Format validation errors
        const formattedErrors = validationResult.error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message
        }));
        
        return res.status(400).json({
          error: "Validation error",
          message: "The provided country data doesn't match the required format.",
          details: formattedErrors
        });
      }

      // Update countries with validated data
      const countries = storage.updateCountries(validationResult.data);
      
      // Return updated data
      res.json(countries);
    } catch (error) {
      console.error("Error updating countries:", error);
      
      // Determine if it's a client error or server error
      const isClientError = error instanceof Error && error.message.includes("Invalid");
      const statusCode = isClientError ? 400 : 500;
      const errorMessage = isClientError 
        ? (error as Error).message 
        : "An unexpected error occurred while updating country data.";
      
      res.status(statusCode).json({ 
        error: isClientError ? "Validation Error" : "Server Error", 
        message: errorMessage 
      });
    }
  });

  // Sample patent data endpoint for testing
  app.get("/api/sample-patent", (req: Request, res: Response) => {
    // The sample patent data
    const sampleData = {
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
                "application_number": "EP09705290.6A",
                "country_code": "EP",
                "filing_date": "2009-01-30",
                "legal_status": "active"
              },
              {
                "application_number": "AU2009209601A",
                "country_code": "AU",
                "filing_date": "2009-01-30",
                "legal_status": "active"
              },
              {
                "application_number": "PCT/EP2009/051041",
                "country_code": "WO",
                "filing_date": "2009-01-30",
                "legal_status": "active"
              },
              {
                "application_number": "US12/865,311",
                "country_code": "US",
                "filing_date": "2009-01-30",
                "legal_status": "active"
              },
              {
                "application_number": "ES200800243A",
                "country_code": "ES",
                "filing_date": "2008-01-30",
                "legal_status": "not_active"
              }
            ],
            "country_code": "AU",
            "country_name": "Australia",
            "expiration_date": "2029-01-30",
            "kind_code": "B2",
            "patent_id": "AU-2009209601-B2",
            "patent_number": "-2009209601-",
            "patent_status": "Active",
            "source": "PubChem",
            "url": "https://patents.google.com/?q=AU-2009209601-B2"
          }
        ],
        "similarCompound": [
          {
            "cid": 33032,
            "iupacName": "(2S)-2-aminopentanedioic acid",
            "recordTitle": "Glutamic Acid",
            "similarity_score": 0.0,
            "smile": "C(CC(=O)O)[C@@H](C(=O)O)N"
          }
        ]
      },
      "success": true
    };

    res.json(sampleData);
  });

  // New endpoint to handle patent data
  app.post("/api/patents", (req: Request, res: Response) => {
    try {
      // Validate request body
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({
          error: "Invalid request format",
          message: "The request body must be a valid JSON object containing patent data."
        });
      }

      // Check if we have a patent response structure
      const patentData = req.body as PatentResponse;
      if (!patentData.pubchemResults || !Array.isArray(patentData.pubchemResults.patents)) {
        return res.status(400).json({
          error: "Invalid patent data",
          message: "The request body must contain valid patent data with applications."
        });
      }

      // Convert patent applications to country data
      const countryData = patentApplicationsToCountryData(patentData.pubchemResults.patents);
      
      // Update countries in storage
      const updatedCountries = storage.updateCountries(countryData);
      
      // Return the processed data
      res.json({
        compoundName: patentData.pubchemResults.currentCompound?.recordTitle || "Unknown Compound",
        patentCount: patentData.pubchemResults.patents.length,
        countries: updatedCountries
      });
    } catch (error) {
      console.error("Error processing patent data:", error);
      res.status(500).json({
        error: "Processing Error",
        message: "Failed to process patent data. Please ensure the data is in the correct format."
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
