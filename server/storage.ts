import { 
  users, 
  type User, 
  type InsertUser, 
  type CompoundData, 
  type PubChemResults 
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getCompoundData(): CompoundData | undefined;
  updateCompoundData(data: CompoundData): CompoundData | undefined;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private compoundData: CompoundData | undefined;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
    
    // Initial compound data
    this.compoundData = {
      pubchemResults: {
        currentCompound: {
          cid: 23327,
          recordTitle: "D-Glutamic Acid",
          smile: "N[C@H](CCC(O)=O)C(=O)O"
        },
        patents: [
          {
            applications: [
              {
                application_number: "JP2010544705A",
                country_code: "JP",
                filing_date: "2009-01-30",
                legal_status: "not_active"
              },
              {
                application_number: "EP09705290.6A",
                country_code: "EP",
                filing_date: "2009-01-30",
                legal_status: "active"
              },
              {
                application_number: "AU2009209601A",
                country_code: "AU",
                filing_date: "2009-01-30",
                legal_status: "active"
              },
              {
                application_number: "PCT/EP2009/051041",
                country_code: "WO",
                filing_date: "2009-01-30",
                legal_status: "active"
              },
              {
                application_number: "US12/865,311",
                country_code: "US",
                filing_date: "2009-01-30",
                legal_status: "active"
              },
              {
                application_number: "ES200800243A",
                country_code: "ES",
                filing_date: "2008-01-30",
                legal_status: "not_active"
              }
            ],
            country_code: "AU",
            country_name: "Australia",
            expiration_date: "2029-01-30",
            kind_code: "B2",
            patent_id: "AU-2009209601-B2",
            patent_number: "-2009209601-",
            patent_status: "Active",
            source: "PubChem",
            url: "https://patents.google.com/?q=AU-2009209601-B2"
          }
        ],
        similarCompound: [
          {
            cid: 33032,
            iupacName: "(2S)-2-aminopentanedioic acid",
            recordTitle: "Glutamic Acid",
            similarity_score: 0.0,
            smile: "C(CC(=O)O)[C@@H](C(=O)O)N"
          }
        ]
      },
      success: true
    };
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

  getCompoundData(): CompoundData | undefined {
    try {
      if (!this.compoundData) {
        console.error("No compound data available");
        return undefined;
      }
      
      // Return a defensive copy to avoid external modification
      return JSON.parse(JSON.stringify(this.compoundData));
    } catch (error) {
      console.error("Error retrieving compound data:", error);
      return undefined;
    }
  }

  updateCompoundData(data: CompoundData): CompoundData | undefined {
    try {
      // Basic validation
      if (!data || !data.pubchemResults || !data.pubchemResults.currentCompound) {
        console.error("Invalid compound data structure");
        return this.getCompoundData();
      }
      
      // Additional validation could be added here
      
      // Update data with a defensive copy
      this.compoundData = JSON.parse(JSON.stringify(data));
      return this.getCompoundData();
    } catch (error) {
      console.error("Error updating compound data:", error);
      return this.getCompoundData();
    }
  }
}

export const storage = new MemStorage();
