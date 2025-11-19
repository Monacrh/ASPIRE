
import React from 'react';

export default function DashboardPage() {
  return (
    <div>
      {/* Header simple */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-gray-800 mb-2">Dashboard</h1>
          <p className="text-gray-600 font-medium">Welcome back, ready to learn something new?</p>
        </div>
      </div>

      {/* Contoh Konten Kosong untuk visualisasi layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card Contoh 1 */}
        <div className="bg-white border-4 border-black p-6 rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
            <div className="h-32 bg-gray-100 border-2 border-gray-200 rounded border-dashed flex items-center justify-center text-gray-400 font-bold">
                No activity yet
            </div>
        </div>

        {/* Card Contoh 2 */}
        <div className="bg-white border-4 border-black p-6 rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-xl font-bold mb-4">Quick Stats</h3>
             <div className="h-32 bg-gray-100 border-2 border-gray-200 rounded border-dashed flex items-center justify-center text-gray-400 font-bold">
                Stats loading...
            </div>
        </div>
      </div>
    </div>
  );
}