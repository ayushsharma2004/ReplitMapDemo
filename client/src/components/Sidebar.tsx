import React from "react";
import { useLocation } from "wouter";

interface SidebarProps {
  activeTab: string;
}

export default function Sidebar({ activeTab }: SidebarProps) {
  const [, navigate] = useLocation();

  const sidebarItems = [
    {
      name: "Compound Info",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4"/>
          <path d="M12 4a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0V5a1 1 0 0 1 1-1Z"/>
          <path d="M4 12a1 1 0 0 1 1-1h2a1 1 0 0 1 0 2H5a1 1 0 0 1-1-1Z"/>
          <path d="M12 18a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0v-2a1 1 0 0 1 1-1Z"/>
          <path d="M18 12a1 1 0 0 1 1-1h2a1 1 0 0 1 0 2h-2a1 1 0 0 1-1-1Z"/>
          <path d="m6.34 6.34-.7-.7"/>
          <path d="m18.36 6.34.7-.7"/>
          <path d="m17.66 17.66.7.7"/>
          <path d="m6.34 17.66-.7.7"/>
        </svg>
      ),
      path: "/"
    },
    {
      name: "Patent World Map",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
      ),
      path: "/patent-map"
    },
    {
      name: "SMILE Search",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
          <polyline points="14 2 14 8 20 8"/>
          <circle cx="10" cy="13" r="2"/>
          <path d="m20 20-3.5-3.5"/>
        </svg>
      ),
      path: "/smile-search"
    },
    {
      name: "Patent Browser",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 16v1a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h1"/>
          <rect width="10" height="16" x="12" y="3" rx="2"/>
          <path d="M17 10h.01"/>
        </svg>
      ),
      path: "/patents"
    },
    {
      name: "Similar Compounds",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      path: "/similar-compounds"
    }
  ];

  const toolItems = [
    {
      name: "Search",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      ),
      action: () => console.log("Search clicked")
    },
    {
      name: "Clear Data",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      ),
      action: () => console.log("Clear Data clicked")
    }
  ];

  return (
    <div className="w-full md:w-60 border-r border-border p-2">
      <nav className="space-y-1">
        {sidebarItems.map((item) => (
          <a
            key={item.name}
            href={item.path}
            onClick={(e) => {
              e.preventDefault();
              navigate(item.path);
            }}
            className={`flex items-center space-x-2 p-2 rounded hover:bg-accent ${
              activeTab === item.name ? "bg-accent text-primary" : ""
            }`}
          >
            {item.icon}
            <span>{item.name}</span>
          </a>
        ))}
      </nav>
      
      <div className="mt-8">
        <h3 className="text-xs uppercase text-muted-foreground font-semibold px-2 mb-2">Tools</h3>
        <div className="space-y-2">
          {toolItems.map((item) => (
            <button
              key={item.name}
              onClick={item.action}
              className="w-full flex items-center justify-between p-2 rounded hover:bg-accent"
            >
              <div className="flex items-center">
                {item.icon}
                <span className="ml-2">{item.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
