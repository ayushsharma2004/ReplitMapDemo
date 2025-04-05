import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { countryDataSchema, patentApplicationsSchema, convertPatentApplicationsToCountryData } from "@shared/schema";

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
          message: "Data must be provided as an array."
        });
      }

      if (req.body.length === 0) {
        return res.status(400).json({
          error: "Empty data",
          message: "The provided array is empty."
        });
      }

      // Determine data format based on the first item's properties
      const firstItem = req.body[0];
      const isPatentFormat = firstItem && 
                            typeof firstItem === 'object' && 
                            'country_code' in firstItem && 
                            'legal_status' in firstItem;

      let countries;

      if (isPatentFormat) {
        // Handle patent application format
        const patentValidationResult = patentApplicationsSchema.safeParse(req.body);
        
        if (!patentValidationResult.success) {
          // Format validation errors
          const formattedErrors = patentValidationResult.error.issues.map(issue => ({
            path: issue.path.join('.'),
            message: issue.message
          }));
          
          return res.status(400).json({
            error: "Validation error",
            message: "The provided patent application data doesn't match the required format.",
            details: formattedErrors
          });
        }
        
        // Convert patent applications to our country data format
        const convertedData = convertPatentApplicationsToCountryData(patentValidationResult.data);
        
        // Update countries with converted data
        countries = storage.updateCountries(convertedData);
        
        // Return the processed data
        return res.json({
          message: `Processed ${patentValidationResult.data.length} patent applications into ${countries.length} countries`,
          data: countries
        });
      } else {
        // Handle standard country data format
        const countryValidationResult = countryDataSchema.safeParse(req.body);
        
        if (!countryValidationResult.success) {
          // Format validation errors
          const formattedErrors = countryValidationResult.error.issues.map(issue => ({
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
        countries = storage.updateCountries(countryValidationResult.data);
        
        // Return updated data
        return res.json(countries);
      }
    } catch (error) {
      console.error("Error updating countries:", error);
      
      // Determine if it's a client error or server error
      const isClientError = error instanceof Error && error.message.includes("Invalid");
      const statusCode = isClientError ? 400 : 500;
      const errorMessage = isClientError 
        ? (error as Error).message 
        : "An unexpected error occurred while updating the data.";
      
      res.status(statusCode).json({ 
        error: isClientError ? "Validation Error" : "Server Error", 
        message: errorMessage 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
