import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { compoundDataSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for compound data
  app.get("/api/compound", (req: Request, res: Response) => {
    try {
      const compoundData = storage.getCompoundData();
      if (!compoundData) {
        return res.status(404).json({ 
          error: "Data not found", 
          message: "No compound data is available."
        });
      }
      res.json(compoundData);
    } catch (error) {
      console.error("Error retrieving compound data:", error);
      res.status(500).json({ 
        error: "Failed to retrieve compound data", 
        message: "An unexpected error occurred while retrieving compound data."
      });
    }
  });

  app.post("/api/compound", (req: Request, res: Response) => {
    try {
      // Validate request body format
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ 
          error: "Invalid request format", 
          message: "The request body must be a valid JSON object containing compound data."
        });
      }

      // Validate the data against the schema
      const validationResult = compoundDataSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        // Format validation errors
        const formattedErrors = validationResult.error.issues.map((issue: any) => ({
          path: issue.path.join('.'),
          message: issue.message
        }));
        
        return res.status(400).json({
          error: "Validation error",
          message: "The provided compound data doesn't match the required format.",
          details: formattedErrors
        });
      }

      // Update compound data with validated data
      const updatedData = storage.updateCompoundData(validationResult.data);
      
      if (!updatedData) {
        return res.status(500).json({
          error: "Update failed",
          message: "Failed to update compound data."
        });
      }
      
      // Return updated data
      res.json(updatedData);
    } catch (error) {
      console.error("Error updating compound data:", error);
      
      // Determine if it's a client error or server error
      const isClientError = error instanceof Error && error.message.includes("Invalid");
      const statusCode = isClientError ? 400 : 500;
      const errorMessage = isClientError 
        ? (error as Error).message 
        : "An unexpected error occurred while updating compound data.";
      
      res.status(statusCode).json({ 
        error: isClientError ? "Validation Error" : "Server Error", 
        message: errorMessage 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
