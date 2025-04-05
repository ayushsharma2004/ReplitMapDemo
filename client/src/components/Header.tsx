import React from "react";
import { useLocation } from "wouter";

export default function Header() {
  const [location, navigate] = useLocation();

  return (
    <header className="border-b border-border flex items-center justify-between px-4 py-2">
      <div className="flex items-center">
        <button 
          className="mr-4 text-muted-foreground hover:text-foreground"
          onClick={() => navigate(-1)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <div className="flex items-center">
          <div className="bg-primary h-10 w-10 rounded flex items-center justify-center mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="9" x2="15" y2="15"></line>
              <line x1="15" y1="9" x2="9" y2="15"></line>
            </svg>
          </div>
          <span className="font-semibold text-lg">Fyled AI</span>
        </div>
      </div>
      <div className="flex items-center">
        <button className="bg-primary hover:bg-primary/90 text-white font-medium rounded px-4 py-1.5 text-sm">
          Finish update
        </button>
      </div>
    </header>
  );
}
