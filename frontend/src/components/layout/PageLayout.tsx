import React from 'react';
import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface PageLayoutProps {
  children: ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-x-hidden overflow-y-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export { PageLayout };