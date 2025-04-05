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

// PubChem API response structure
export interface PubChemResponse {
  pubchemResults: {
    currentCompound: {
      cid: number;
      recordTitle: string;
      smile: string;
    };
    patents: Array<{
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
    }>;
  };
  success: boolean;
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

// Schema for validating the PubChem response format
export const pubChemResponseSchema = z.object({
  pubchemResults: z.object({
    currentCompound: z.object({
      cid: z.number(),
      recordTitle: z.string(),
      smile: z.string()
    }),
    patents: z.array(
      z.object({
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
      })
    )
  }),
  success: z.boolean()
});

// Helper function to extract patent applications from PubChem response
export const extractPatentApplicationsFromPubChem = (data: PubChemResponse): PatentApplication[] => {
  if (!data || !data.pubchemResults || !data.pubchemResults.patents) {
    return [];
  }
  
  // Flatten all applications from all patents
  const applications: PatentApplication[] = [];
  data.pubchemResults.patents.forEach(patent => {
    if (patent.applications && Array.isArray(patent.applications)) {
      applications.push(...patent.applications);
    }
  });
  
  return applications;
};

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
