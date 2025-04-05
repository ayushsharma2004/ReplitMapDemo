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

// Patent application from the API
export interface PatentApplication {
  application_number: string;
  country_code: string; 
  filing_date: string;
  legal_status: 'active' | 'not_active';
}

// Our standard country data format used in the application
export interface CountryData {
  country: string;
  leagueStatus: string;
  active: boolean;
}

// Country type with ID (used in some components for uniqueness)
export interface Country extends CountryData {
  id: number;
}

export const patentApplicationSchema = z.object({
  application_number: z.string(),
  country_code: z.string(),
  filing_date: z.string(),
  legal_status: z.enum(['active', 'not_active'])
});

export const patentApplicationsSchema = z.array(patentApplicationSchema);

export const countrySchema = z.object({
  country: z.string(),
  leagueStatus: z.string(),
  active: z.boolean(),
});

export const countryDataSchema = z.array(countrySchema);

// Helper function to convert patent applications to our country data format
export const convertPatentApplicationsToCountryData = (applications: PatentApplication[]): CountryData[] => {
  // Create a map to deduplicate countries and use the latest status
  const countryMap = new Map<string, CountryData>();
  
  applications.forEach(app => {
    // For each application, create or update the country entry
    const countryCode = app.country_code;
    const isActive = app.legal_status === 'active';
    
    // Determine the league status based on filing date
    let leagueStatus = "Standard";
    if (app.filing_date) {
      const filingYear = new Date(app.filing_date).getFullYear();
      if (filingYear >= 2015) {
        leagueStatus = "Premier";
      } else if (filingYear < 2010) {
        leagueStatus = "Basic";
      }
    }
    
    // If we already have this country, only update if this app is active and the previous was not
    if (countryMap.has(countryCode)) {
      const existingData = countryMap.get(countryCode)!;
      if (isActive && !existingData.active) {
        countryMap.set(countryCode, {
          country: countryCode,
          leagueStatus,
          active: isActive
        });
      }
    } else {
      // If we don't have this country yet, add it
      countryMap.set(countryCode, {
        country: countryCode,
        leagueStatus,
        active: isActive
      });
    }
  });
  
  // Convert the map back to an array
  return Array.from(countryMap.values());
};
