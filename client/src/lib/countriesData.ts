import { Country } from "@shared/schema";

// Initial country data - will be replaced by API data
export const initialCountryData: Omit<Country, "id">[] = [
  { name: "United States", status: "Premier", active: true },
  { name: "Germany", status: "Premier", active: true },
  { name: "France", status: "Premier", active: true },
  { name: "United Kingdom", status: "Premier", active: true },
  { name: "Italy", status: "Premier", active: true },
  { name: "Spain", status: "Premier", active: true },
  { name: "Russia", status: "Standard", active: false },
  { name: "China", status: "Standard", active: false },
  { name: "Japan", status: "Premier", active: true },
  { name: "India", status: "Standard", active: false },
  { name: "Nigeria", status: "Basic", active: false },
  { name: "South Africa", status: "Standard", active: false },
  { name: "Brazil", status: "Premier", active: true },
  { name: "Mexico", status: "Standard", active: true },
  { name: "Argentina", status: "Standard", active: true },
  { name: "Australia", status: "Premier", active: true }
];

export interface CountryStats {
  activeCount: number;
  premierCount: number;
  standardCount: number;
  basicCount: number;
}

export function calculateCountryStats(countries: Country[]): CountryStats {
  const activeCount = countries.filter(country => country.active).length;
  const premierCount = countries.filter(country => country.status === "Premier").length;
  const standardCount = countries.filter(country => country.status === "Standard").length;
  const basicCount = countries.filter(country => country.status === "Basic").length;

  return {
    activeCount,
    premierCount,
    standardCount,
    basicCount
  };
}
