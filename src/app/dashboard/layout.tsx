import React from 'react';
import Sidebar from '../components/sidebar';
import RetroSidebar from '../components/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-[#FFF8DC]">
      {/* Sidebar Component */}
      <RetroSidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}