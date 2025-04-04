import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for country data
  app.get("/api/countries", (req, res) => {
    const countries = storage.getCountries();
    res.json(countries);
  });

  app.post("/api/countries", (req, res) => {
    try {
      const countries = storage.updateCountries(req.body);
      res.json(countries);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
