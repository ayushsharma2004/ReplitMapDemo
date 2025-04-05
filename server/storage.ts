import { users, type User, type InsertUser, type CountryData } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getCountries(): CountryData[];
  updateCountries(countries: CountryData[]): CountryData[];
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private countries: CountryData[];
  currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
    this.countries = [
      { country: "United States", leagueStatus: "Premier", active: true },
      { country: "Canada", leagueStatus: "Standard", active: true },
      { country: "United Kingdom", leagueStatus: "Premier", active: true },
      { country: "France", leagueStatus: "Premier", active: true },
      { country: "Germany", leagueStatus: "Premier", active: true },
      { country: "Japan", leagueStatus: "Standard", active: true },
      { country: "Australia", leagueStatus: "Standard", active: true },
      { country: "Brazil", leagueStatus: "Premier", active: true },
      { country: "Russia", leagueStatus: "Basic", active: false },
      { country: "India", leagueStatus: "Standard", active: true },
      { country: "China", leagueStatus: "Basic", active: false },
      { country: "South Africa", leagueStatus: "Standard", active: true },
      { country: "Mexico", leagueStatus: "Standard", active: true },
      { country: "Italy", leagueStatus: "Premier", active: true },
      { country: "Spain", leagueStatus: "Premier", active: true }
    ];
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  getCountries(): CountryData[] {
    try {
      // Create a defensive copy of the data to avoid external modification
      if (!this.countries || !Array.isArray(this.countries)) {
        console.error("Invalid countries data structure");
        return [];
      }
      
      // Return only valid country objects
      return [...this.countries].filter(country => 
        country && 
        typeof country.country === 'string' && 
        typeof country.leagueStatus === 'string' && 
        typeof country.active === 'boolean'
      );
    } catch (error) {
      console.error("Error retrieving countries:", error);
      return []; // Return empty array on error
    }
  }

  updateCountries(countries: CountryData[]): CountryData[] {
    try {
      // Validate input is an array
      if (!countries || !Array.isArray(countries)) {
        console.error("Invalid data provided: not an array");
        return this.getCountries(); // Return current data
      }
      
      // Filter out invalid country objects
      const validCountries = countries.filter(country => 
        country && 
        typeof country.country === 'string' && 
        typeof country.leagueStatus === 'string' && 
        typeof country.active === 'boolean'
      );
      
      if (validCountries.length === 0) {
        console.warn("No valid country data provided for update");
        return this.getCountries(); // Return current data
      }
      
      // Update with validated data
      this.countries = [...validCountries];
      return this.getCountries();
    } catch (error) {
      console.error("Error updating countries:", error);
      return this.getCountries(); // Return current data on error
    }
  }
}

export const storage = new MemStorage();
