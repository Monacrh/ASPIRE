import React from 'react';
import RetroSidebar from '../components/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-[#FFF8DC] overflow-x-hidden">
      {/* Sidebar Component */}
      <RetroSidebar />
      
      {/* Main Content Area */}
      {/* pt-16 ditambahkan untuk memberi ruang pada Mobile Trigger Button yang fixed di kiri atas */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen w-full pt-20 md:pt-8">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}