'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, Briefcase, Zap, Star, ChevronRight, Hash, Sparkles, Target, TrendingUp, DollarSign, Cpu } from 'lucide-react';

// --- DATA YANG DIPERKAYA ---
interface Recommendation {
  id: string;
  name: string;
  percentage: number;
  color: string;
  description: string; // Sekarang lebih panjang
  details: string[];
  tags: string[];
  salary: string;     // Data Baru
  tools: string[];    // Data Baru
  stats: {            // Data Baru
    logic: number;
    creativity: number;
    social: number;
  };
}

const recommendations: Recommendation[] = [
  {
    id: '1',
    name: 'Software Engineer',
    percentage: 85,
    color: '#FFD93D', // Yellow
    description: 'You are the architect of the digital world. While others see only pixels, you see the matrix. You enjoy building complex systems from scratch, debugging reality, and drinking excessive amounts of coffee.',
    details: ['System Design', 'Algorithms', 'Full-Stack', 'Cloud Ops'],
    tags: ['High Demand', 'Builder'],
    salary: '$80k - $150k',
    tools: ['VS Code', 'Docker', 'Git', 'Jira'],
    stats: { logic: 95, creativity: 60, social: 40 }
  },
  {
    id: '2',
    name: 'Data Scientist',
    percentage: 72,
    color: '#FF90E8', // Pink
    description: 'You are a modern-day oracle. You see patterns where others see chaos. Using math and statistics to predict the future is your superpower, turning raw numbers into actionable gold.',
    details: ['Machine Learning', 'Statistics', 'Python / R', 'Big Data'],
    tags: ['Analytical', 'Math'],
    salary: '$90k - $160k',
    tools: ['Jupyter', 'TensorFlow', 'Tableau', 'SQL'],
    stats: { logic: 90, creativity: 50, social: 50 }
  },
  {
    id: '3',
    name: 'Product Manager',
    percentage: 60,
    color: '#4DE1C1', // Cyan
    description: 'The diplomat of the tech world. You bridge the gap between code and customers. You prioritize features, manage roadmaps, and ensure the ship is steering in the right direction.',
    details: ['Strategy', 'User Empathy', 'Scrum', 'Leadership'],
    tags: ['Strategy', 'Social'],
    salary: '$100k - $170k',
    tools: ['Notion', 'Figma', 'Slack', 'Amplitude'],
    stats: { logic: 70, creativity: 60, social: 95 }
  },
  {
    id: '4',
    name: 'UX Designer',
    percentage: 45,
    color: '#FFFFFF', // White
    description: 'The user\'s champion. You ensure technology feels human, not robotic. You fight for intuitive experiences, crafting interfaces that are not just functional, but beautiful and delightful.',
    details: ['Wireframing', 'Prototyping', 'User Research', 'Visual UI'],
    tags: ['Creative', 'Empathy'],
    salary: '$75k - $140k',
    tools: ['Figma', 'Sketch', 'Maze', 'Adobe CC'],
    stats: { logic: 40, creativity: 95, social: 80 }
  }
];

// --- MATH HELPER ---
const getCoordinatesForPercent = (percent: number) => {
  const x = Math.cos(2 * Math.PI * percent);
  const y = Math.sin(2 * Math.PI * percent);
  return [x, y];
};

export default function ResultPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedItem = recommendations.find(r => r.id === selectedId);

  // --- CHART LOGIC ---
  const chartData = recommendations.reduce((acc, slice) => {
    const total = recommendations.reduce((sum, item) => sum + item.percentage, 0);
    const slicePercent = slice.percentage / total;
    
    const startPercent = acc.currentPercent;
    const endPercent = startPercent + slicePercent;
    
    const [startX, startY] = getCoordinatesForPercent(startPercent);
    const [endX, endY] = getCoordinatesForPercent(endPercent);
    const largeArcFlag = slicePercent > 0.5 ? 1 : 0;

    const pathData = `M 0 0 L ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} L 0 0`;

    const midPercent = startPercent + slicePercent / 2;
    const [midX, midY] = getCoordinatesForPercent(midPercent);
    const labelX = midX * 0.7; 
    const labelY = midY * 0.7;

    return {
      currentPercent: endPercent,
      items: [...acc.items, { ...slice, pathData, labelX, labelY }]
    };
  }, { currentPercent: 0, items: [] as any[] }).items;

  return (
    <div className="h-screen w-full bg-[#FFF8DC] font-sans text-black overflow-hidden relative flex flex-col">
      
      {/* --- HEADER (Fixed) --- */}
      <AnimatePresence>
        {!selectedId && (
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-0 left-0 w-full flex items-center justify-between p-6 z-20"
            >
                <div className="flex items-center gap-3">
                    <button className="w-12 h-12 bg-white border-4 border-black shadow-[4px_4px_0_black] flex items-center justify-center hover:-translate-y-1 transition-transform">
                        <ArrowLeft className="w-6 h-6" strokeWidth={3} />
                    </button>
                    <h1 className="text-3xl font-black uppercase italic tracking-tighter">
                        Result<span className="text-[#FF6B6B]">.</span>
                    </h1>
                </div>
                <div className="hidden md:block px-4 py-2 bg-[#FF90E8] border-4 border-black font-black uppercase shadow-[4px_4px_0_black] transform rotate-2">
                    Career Mode
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* --- MAIN STAGE --- */}
      <div className="flex-1 relative w-full h-full">
        
        {/* 1. PIE CHART (Fixed Position) */}
        <motion.div
          layout
          className="absolute z-50 flex items-center justify-center"
          initial={false}
          animate={{ 
            top: selectedId ? '5%' : '50%',
            left: '50%', 
            x: '-50%', 
            y: selectedId ? '0%' : '-50%',
            width: selectedId ? '200px' : '100%',
            maxWidth: selectedId ? '200px' : '450px',
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        >
           <div className="w-full aspect-square relative">
                <svg 
                    viewBox="-1.05 -1.05 2.1 2.1" 
                    className="w-full h-full overflow-visible drop-shadow-xl" 
                    style={{ transform: 'rotate(-90deg)' }}
                >
                    {chartData.map((slice: any) => {
                    const isSelected = selectedId === slice.id;
                    const isDimmed = selectedId && !isSelected;

                    return (
                        <motion.g 
                            key={slice.id}
                            onClick={() => setSelectedId(isSelected ? null : slice.id)}
                            className="cursor-pointer"
                            animate={{ 
                                opacity: isDimmed ? 0.3 : 1,
                                scale: isSelected ? 1.1 : 1,
                                filter: isDimmed ? 'grayscale(100%)' : 'none'
                            }}
                            whileHover={{ scale: 1.05 }}
                        >
                            <path 
                                d={slice.pathData} 
                                fill={slice.color} 
                                stroke="#000000" 
                                strokeWidth="0.04" 
                            />
                            {slice.percentage >= 10 && (
                                <text
                                    x={slice.labelX}
                                    y={slice.labelY}
                                    fill="#000000"
                                    fontSize={selectedId ? "0.2" : "0.12"}
                                    fontWeight="900"
                                    textAnchor="middle"
                                    alignmentBaseline="middle"
                                    transform={`rotate(90 ${slice.labelX} ${slice.labelY})`}
                                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                                >
                                    {slice.percentage}%
                                </text>
                            )}
                        </motion.g>
                    );
                    })}
                </svg>
           </div>
        </motion.div>

        {/* 2. DETAIL PANEL (Fixed Height - Tidak Collapse dengan Pie Chart) */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
                key="detail-card"
                initial={{ opacity: 0, y: 400 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 400 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 180, damping: 25 }}
                // PANEL TIDAK COLLAPSE: Tetap di posisi bawah dengan height tetap
                className="absolute bottom-0 left-0 w-full h-[62%] z-30 px-4 pb-4 flex flex-col"
            >
                {/* Main Card Container */}
                <div className="w-full h-full max-w-6xl mx-auto flex flex-col md:flex-row gap-4 overflow-hidden">
                    
                    {/* --- LEFT PANEL: IDENTITY & STATS --- */}
                    <motion.div 
                        className="w-full md:w-[40%] bg-white border-4 border-black shadow-[8px_8px_0_black] rounded-lg p-6 flex flex-col relative overflow-y-auto custom-scrollbar"
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                         {/* Close Button (Mobile Only Position) */}
                         <button 
                            onClick={() => setSelectedId(null)}
                            className="absolute top-2 right-2 md:hidden p-2 bg-black text-white z-50"
                        >
                            <X size={20}/>
                        </button>

                        {/* Header Title */}
                        <div className="mt-4 mb-6 border-b-4 border-black pb-4">
                             <h2 className="text-3xl md:text-4xl font-black uppercase leading-[0.9] mb-2">
                                {selectedItem.name}
                            </h2>
                            <div className="flex gap-2 flex-wrap">
                                {selectedItem.tags.map((tag) => (
                                    <span key={tag} className="px-2 py-1 bg-[#FFD93D] border-2 border-black text-[10px] font-bold uppercase">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm font-bold leading-relaxed text-gray-700 mb-8">
                            {selectedItem.description}
                        </p>

                        {/* NEW SECTION: Character Stats (Bar Meters) */}
                        <div className="mt-auto bg-gray-100 p-4 border-2 border-black rounded mb-4">
                             <h4 className="font-black uppercase text-xs mb-3 flex items-center gap-2">
                                <Cpu className="w-4 h-4" /> Character Stats
                             </h4>
                             <div className="space-y-3">
                                {Object.entries(selectedItem.stats).map(([key, value]) => (
                                    <div key={key} className="flex items-center gap-2">
                                        <span className="w-20 text-[10px] font-bold uppercase text-right">{key}</span>
                                        <div className="flex-1 h-3 bg-white border-2 border-black relative">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${value}%` }}
                                                transition={{ delay: 0.5, duration: 1 }}
                                                className="h-full bg-black"
                                            />
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>

                         {/* NEW SECTION: Salary Estimate */}
                        <div className="flex items-center justify-between bg-black text-white p-3 border-2 border-transparent">
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-[#4DE1C1]" />
                                <span className="font-bold text-xs uppercase">Est. Salary</span>
                            </div>
                            <span className="font-mono font-bold text-[#FFD93D]">{selectedItem.salary}</span>
                        </div>

                    </motion.div>

                    {/* --- RIGHT PANEL: SKILLS & TOOLS --- */}
                    <motion.div 
                        className="w-full md:w-[60%] flex flex-col gap-4 h-full"
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        {/* Skills & Tools Box */}
                        <div className="flex-1 bg-white border-4 border-black shadow-[8px_8px_0_black] rounded-lg overflow-hidden flex flex-col relative">
                             {/* Desktop Close Button */}
                             <button 
                                onClick={() => setSelectedId(null)}
                                className="hidden md:flex absolute top-4 right-4 w-8 h-8 bg-white border-2 border-black hover:bg-red-100 items-center justify-center z-10 shadow-[2px_2px_0_black] active:translate-y-0.5 active:shadow-none"
                            >
                                <X className="w-4 h-4" strokeWidth={3} />
                            </button>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                                
                                {/* Core Skills Section */}
                                <div className="mb-8">
                                    <h3 className="font-black text-lg uppercase mb-4 flex items-center gap-2 border-b-4 border-black w-fit px-2 bg-[#FF90E8]">
                                        <Zap className="w-5 h-5" /> Abilities
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {selectedItem.details.map((detail, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 border-2 border-black bg-[#F3F4F6] hover:bg-white transition-colors shadow-[3px_3px_0_rgba(0,0,0,0.1)]">
                                                <div className="w-6 h-6 bg-black text-white flex items-center justify-center font-bold text-xs rounded-sm">
                                                    {i + 1}
                                                </div>
                                                <span className="font-bold text-sm uppercase">{detail}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* NEW SECTION: Tools / Inventory */}
                                <div>
                                    <h3 className="font-black text-lg uppercase mb-4 flex items-center gap-2 border-b-4 border-black w-fit px-2 bg-[#4DE1C1]">
                                        Inventory
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedItem.tools.map((tool) => (
                                            <span key={tool} className="px-4 py-2 border-2 border-black rounded-full text-xs font-bold uppercase flex items-center gap-2 bg-white hover:bg-black hover:text-white transition-colors cursor-default">
                                                <Hash className="w-3 h-3" /> {tool}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* CTA Footer */}
                            <div className="p-4 border-t-4 border-black bg-gray-50">
                                <button 
                                    className="w-full py-4 text-white font-black text-lg uppercase tracking-widest border-4 border-black shadow-[4px_4px_0_black] hover:shadow-[6px_6px_0_black] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
                                    style={{ backgroundColor: selectedItem.color === '#FFFFFF' ? '#000' : selectedItem.color, color: selectedItem.color === '#FFFFFF' ? '#FFF' : '#000' }}
                                >
                                    Unlock Career Path <ChevronRight className="w-6 h-6" strokeWidth={4} />
                                </button>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Hint */}
        {!selectedId && (
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-12 w-full text-center pointer-events-none"
            >
                <div className="inline-block bg-white border-2 border-black px-4 py-2 shadow-[4px_4px_0_black]">
                    <p className="font-black uppercase text-xs tracking-widest animate-pulse">
                        Click a slice to reveal details
                    </p>
                </div>
            </motion.div>
        )}

      </div>

      {/* Custom Scrollbar CSS */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #FFF;
          border-left: 2px solid #000;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #000;
          border-radius: 0;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
}