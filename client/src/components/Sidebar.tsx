import React from "react";
import { useLocation } from "wouter";

interface SidebarProps {
  activeTab: string;
}

export default function Sidebar({ activeTab }: SidebarProps) {
  const [, navigate] = useLocation();

  const sidebarItems = [
    {
      name: "Draw Compound",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polygon points="10 8 16 12 10 16 10 8"></polygon>
        </svg>
      ),
      path: "/draw-compound"
    },
    {
      name: "Upload Image",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
      ),
      path: "/upload-image"
    },
    {
      name: "Upload PDF",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      ),
      path: "/upload-pdf"
    },
    {
      name: "World Map",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
      ),
      path: "/"
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
