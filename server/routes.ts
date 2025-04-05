import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { countryDataSchema } from "@shared/schema";

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

  const httpServer = createServer(app);

  return httpServer;
}
