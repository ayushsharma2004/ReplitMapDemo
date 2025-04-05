import React from "react";

export default function Header() {
  return (
    <header className="border-b border-border p-4 flex items-center justify-between bg-background">
      <div className="flex items-center space-x-3">
        <div className="bg-primary p-2 rounded">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="white" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 4a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0V5a1 1 0 0 1 1-1Z"/>
            <path d="M4 12a1 1 0 0 1 1-1h2a1 1 0 0 1 0 2H5a1 1 0 0 1-1-1Z"/>
            <path d="M12 18a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0v-2a1 1 0 0 1 1-1Z"/>
            <path d="M18 12a1 1 0 0 1 1-1h2a1 1 0 0 1 0 2h-2a1 1 0 0 1-1-1Z"/>
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold">Fyled AI</h1>
          <p className="text-sm text-muted-foreground">Chemical Compound Explorer</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <a 
          href="https://pubchem.ncbi.nlm.nih.gov/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          PubChem
        </a>
        <a 
          href="https://patents.google.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Google Patents
        </a>
        <div className="h-6 w-px bg-border"></div>
        <button className="flex items-center text-sm font-medium hover:text-primary transition-colors">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="mr-1"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Account
        </button>
      </div>
    </header>
  );
}