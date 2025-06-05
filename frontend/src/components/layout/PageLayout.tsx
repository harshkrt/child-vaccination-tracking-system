import React, { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
// import { Header } from './Header'; // If you decide to have a header for page titles, etc.

interface PageLayoutProps {
  children: ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-x-hidden overflow-y-auto">
        {/* Optional Header Component can go here */}
        {/* <Header /> */}
        <div className="p-6"> {/* Add padding around content area */}
          {children}
        </div>
      </main>
    </div>
  );
};

export { PageLayout };