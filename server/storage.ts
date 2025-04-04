import { users, type User, type InsertUser, countries, type Country, type InsertCountry } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getCountries(): Promise<Country[]>;
  getCountry(id: number): Promise<Country | undefined>;
  getCountryByName(name: string): Promise<Country | undefined>;
  createCountry(country: InsertCountry): Promise<Country>;
  updateCountry(id: number, country: Partial<InsertCountry>): Promise<Country | undefined>;
  deleteCountry(id: number): Promise<boolean>;
  updateCountriesData(countriesData: InsertCountry[]): Promise<Country[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private countriesMap: Map<number, Country>;
  currentUserId: number;
  currentCountryId: number;

  constructor() {
    this.users = new Map();
    this.countriesMap = new Map();
    this.currentUserId = 1;
    this.currentCountryId = 1;
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
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async getCountries(): Promise<Country[]> {
    return Array.from(this.countriesMap.values());
  }
  
  async getCountry(id: number): Promise<Country | undefined> {
    return this.countriesMap.get(id);
  }
  
  async getCountryByName(name: string): Promise<Country | undefined> {
    return Array.from(this.countriesMap.values()).find(
      (country) => country.name.toLowerCase() === name.toLowerCase(),
    );
  }
  
  async createCountry(insertCountry: InsertCountry): Promise<Country> {
    const id = this.currentCountryId++;
    const country: Country = { ...insertCountry, id };
    this.countriesMap.set(id, country);
    return country;
  }
  
  async updateCountry(id: number, countryData: Partial<InsertCountry>): Promise<Country | undefined> {
    const country = this.countriesMap.get(id);
    if (!country) return undefined;
    
    const updatedCountry: Country = { ...country, ...countryData };
    this.countriesMap.set(id, updatedCountry);
    return updatedCountry;
  }
  
  async deleteCountry(id: number): Promise<boolean> {
    return this.countriesMap.delete(id);
  }
  
  async updateCountriesData(countriesData: InsertCountry[]): Promise<Country[]> {
    // Clear existing countries
    this.countriesMap.clear();
    this.currentCountryId = 1;
    
    // Add new countries
    const countries: Country[] = [];
    for (const countryData of countriesData) {
      const country = await this.createCountry(countryData);
      countries.push(country);
    }
    
    return countries;
  }
}

export const storage = new MemStorage();
