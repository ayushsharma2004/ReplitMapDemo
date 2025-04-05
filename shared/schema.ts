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

export const countrySchema = z.object({
  country: z.string(),
  leagueStatus: z.string(),
  active: z.boolean(),
});

export const countryDataSchema = z.array(countrySchema);
