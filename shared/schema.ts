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

// Legacy country data structure - kept for compatibility with WorldMap components
export interface CountryData {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  type?: 'premier' | 'standard' | 'basic';
  region?: string;
  population?: number;
  capital?: string;
}

export interface Country {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  type?: 'premier' | 'standard' | 'basic';
  region?: string;
  population?: number;
  capital?: string;
}

// Patent Application Interface
export interface PatentApplication {
  application_number: string;
  country_code: string;
  filing_date: string;
  legal_status: string;
}

// Patent Interface
export interface Patent {
  patent_id: string;
  patent_number: string;
  country_code: string;
  country_name: string;
  patent_status: string;
  expiration_date: string;
  kind_code: string;
  url: string;
  source: string;
  applications: PatentApplication[];
}

// Similar Compound Interface
export interface SimilarCompound {
  cid: number;
  iupacName: string;
  recordTitle: string;
  similarity_score: number;
  smile: string;
}

// Main Compound Interface
export interface Compound {
  cid: number;
  recordTitle: string;
  smile: string;
}

// Complete PubChem Results
export interface PubChemResults {
  currentCompound: Compound;
  patents: Patent[];
  similarCompound: SimilarCompound[];
}

// Response Structure
export interface CompoundData {
  pubchemResults: PubChemResults;
  success: boolean;
}

// Schemas for validation
export const patentApplicationSchema = z.object({
  application_number: z.string(),
  country_code: z.string(),
  filing_date: z.string(),
  legal_status: z.string()
});

export const patentSchema = z.object({
  patent_id: z.string(),
  patent_number: z.string(),
  country_code: z.string(),
  country_name: z.string(),
  patent_status: z.string(),
  expiration_date: z.string(),
  kind_code: z.string(),
  url: z.string(),
  source: z.string(),
  applications: z.array(patentApplicationSchema)
});

export const similarCompoundSchema = z.object({
  cid: z.number(),
  iupacName: z.string(),
  recordTitle: z.string(),
  similarity_score: z.number(),
  smile: z.string()
});

export const compoundSchema = z.object({
  cid: z.number(),
  recordTitle: z.string(),
  smile: z.string()
});

export const pubChemResultsSchema = z.object({
  currentCompound: compoundSchema,
  patents: z.array(patentSchema),
  similarCompound: z.array(similarCompoundSchema)
});

export const compoundDataSchema = z.object({
  pubchemResults: pubChemResultsSchema,
  success: z.boolean()
});
