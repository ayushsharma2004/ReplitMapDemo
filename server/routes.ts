import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCountrySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // Get all countries
  app.get("/api/countries", async (req, res) => {
    try {
      const countries = await storage.getCountries();
      return res.status(200).json(countries);
    } catch (error) {
      console.error("Error fetching countries:", error);
      return res.status(500).json({ message: "Failed to fetch countries" });
    }
  });

  // Get a specific country by ID
  app.get("/api/countries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid country ID" });
      }

      const country = await storage.getCountry(id);
      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }

      return res.status(200).json(country);
    } catch (error) {
      console.error("Error fetching country:", error);
      return res.status(500).json({ message: "Failed to fetch country" });
    }
  });

  // Create a new country
  app.post("/api/countries", async (req, res) => {
    try {
      const countryData = insertCountrySchema.parse(req.body);
      const existingCountry = await storage.getCountryByName(countryData.name);
      
      if (existingCountry) {
        return res.status(409).json({ message: "Country with this name already exists" });
      }
      
      const newCountry = await storage.createCountry(countryData);
      return res.status(201).json(newCountry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid country data", errors: error.errors });
      }
      console.error("Error creating country:", error);
      return res.status(500).json({ message: "Failed to create country" });
    }
  });

  // Update an existing country
  app.patch("/api/countries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid country ID" });
      }

      const country = await storage.getCountry(id);
      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }

      const countryData = insertCountrySchema.partial().parse(req.body);
      const updatedCountry = await storage.updateCountry(id, countryData);
      
      return res.status(200).json(updatedCountry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid country data", errors: error.errors });
      }
      console.error("Error updating country:", error);
      return res.status(500).json({ message: "Failed to update country" });
    }
  });

  // Delete a country
  app.delete("/api/countries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid country ID" });
      }

      const country = await storage.getCountry(id);
      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }

      await storage.deleteCountry(id);
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting country:", error);
      return res.status(500).json({ message: "Failed to delete country" });
    }
  });

  // Bulk update countries
  app.post("/api/countries/bulk", async (req, res) => {
    try {
      const countriesSchema = z.array(insertCountrySchema);
      const countriesData = countriesSchema.parse(req.body);
      
      const updatedCountries = await storage.updateCountriesData(countriesData);
      return res.status(200).json(updatedCountries);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid countries data", errors: error.errors });
      }
      console.error("Error updating countries data:", error);
      return res.status(500).json({ message: "Failed to update countries data" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
