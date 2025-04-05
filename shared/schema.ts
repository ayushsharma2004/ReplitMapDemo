import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export interface CountryData {
  country: string;
  leagueStatus: string;
  active: boolean;
}

// Country type with ID (used in some components for uniqueness)
export interface Country extends CountryData {
  id: number;
}

// Patent application types
export interface PatentApplication {
  application_number: string;
  country_code: string;
  filing_date: string;
  legal_status: "active" | "not_active";
}

export interface Patent {
  applications: PatentApplication[];
  country_code: string;
  country_name: string;
  expiration_date: string;
  kind_code: string;
  patent_id: string;
  patent_number: string;
  patent_status: string;
  source: string;
  url: string;
}

export interface CompoundData {
  cid: number;
  recordTitle: string;
  smile: string;
}

export interface PubchemResults {
  currentCompound: CompoundData;
  patents: Patent[];
  similarCompound?: Array<{
    cid: number;
    iupacName: string;
    recordTitle: string;
    similarity_score: number;
    smile: string;
  }>;
}

export interface PatentResponse {
  pubchemResults: PubchemResults;
  success: boolean;
}

// Convert patent applications to country data format
export function patentApplicationsToCountryData(patents: Patent[]): CountryData[] {
  // Extract all applications from all patents
  const allApplications = patents.flatMap(patent => patent.applications);
  
  // Create a map to consolidate by country code
  const countryMap = new Map<string, { active: boolean }>();
  
  // Process each application
  allApplications.forEach(app => {
    // Country code should be converted to the full country name in a real app
    // For now, we'll use the country code as the name
    const countryCode = app.country_code;
    const isActive = app.legal_status === "active";
    
    // If country already exists in map and is active, keep it active
    if (countryMap.has(countryCode)) {
      const existing = countryMap.get(countryCode)!;
      if (isActive) {
        existing.active = true;
      }
    } else {
      // Add new country
      countryMap.set(countryCode, { active: isActive });
    }
  });
  
  // Convert map to CountryData array
  return Array.from(countryMap.entries()).map(([code, data]) => ({
    country: code,
    leagueStatus: data.active ? "Active" : "Inactive",
    active: data.active
  }));
}

export const countrySchema = z.object({
  country: z.string(),
  leagueStatus: z.string(),
  active: z.boolean(),
});

export const countryDataSchema = z.array(countrySchema);

export const patentApplicationSchema = z.object({
  application_number: z.string(),
  country_code: z.string(),
  filing_date: z.string(),
  legal_status: z.enum(["active", "not_active"])
});

export const patentSchema = z.object({
  applications: z.array(patentApplicationSchema),
  country_code: z.string(),
  country_name: z.string(),
  expiration_date: z.string(),
  kind_code: z.string(),
  patent_id: z.string(),
  patent_number: z.string(),
  patent_status: z.string(),
  source: z.string(),
  url: z.string()
});

export const pubchemResultsSchema = z.object({
  currentCompound: z.object({
    cid: z.number(),
    recordTitle: z.string(),
    smile: z.string()
  }),
  patents: z.array(patentSchema),
  similarCompound: z.array(z.object({
    cid: z.number(),
    iupacName: z.string().optional(),
    recordTitle: z.string(),
    similarity_score: z.number(),
    smile: z.string()
  })).optional()
});
