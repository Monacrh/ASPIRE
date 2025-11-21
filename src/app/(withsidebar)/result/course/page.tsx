'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, Briefcase, Zap, Star, ChevronRight, Hash } from 'lucide-react';

// --- DATA ---
interface Recommendation {
  id: string;
  name: string;
  percentage: number;
  color: string;
  description: string;
  details: string[];
  tags: string[];
}

const recommendations: Recommendation[] = [
  {
    id: '1',
    name: 'Software Engineer',
    percentage: 85,
    color: '#FFD93D', // Yellow
    description: 'You are the architect of the digital world. You enjoy building complex systems from scratch and solving logic puzzles.',
    details: ['System Design', 'Algorithms', 'Full-Stack', 'Cloud Ops'],
    tags: ['High Demand', 'Builder']
  },
  {
    id: '2',
    name: 'Data Scientist',
    percentage: 72,
    color: '#FF90E8', // Pink
    description: 'You see patterns where others see chaos. Using math and statistics to predict the future is your superpower.',
    details: ['Machine Learning', 'Statistics', 'Python / R', 'Big Data'],
    tags: ['Analytical', 'Math']
  },
  {
    id: '3',
    name: 'Product Manager',
    percentage: 60,
    color: '#4DE1C1', // Cyan
    description: 'The bridge between tech and people. You prioritize features, manage roadmaps, and lead the vision.',
    details: ['Strategy', 'User Empathy', 'Scrum', 'Leadership'],
    tags: ['Strategy', 'Social']
  },
  {
    id: '4',
    name: 'UX Designer',
    percentage: 45,
    color: '#FFFFFF', // White
    description: 'You ensure technology feels human. You fight for the user, crafting intuitive and beautiful experiences.',
    details: ['Wireframing', 'Prototyping', 'User Research', 'Visual UI'],
    tags: ['Creative', 'Empathy']
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
    // Background: Creamy Retro White
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
                {/* Badge Retro */}
                <div className="hidden md:block px-4 py-2 bg-[#FF90E8] border-4 border-black font-black uppercase shadow-[4px_4px_0_black] transform rotate-2">
                    Career Mode
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* --- MAIN STAGE --- */}
      <div className="flex-1 relative w-full h-full">
        
        {/* 1. PIE CHART (The Navigator) */}
        <motion.div
          layout
          className="absolute z-50 flex items-center justify-center"
          initial={false}
          animate={{ 
            // Posisi: Tengah -> Kiri Atas
            top: selectedId ? '2rem' : '50%',
            left: selectedId ? '2rem' : '50%',
            x: selectedId ? '0%' : '-50%',
            y: selectedId ? '0%' : '-50%',
            width: selectedId ? '110px' : '100%',
            maxWidth: selectedId ? '110px' : '450px',
          }}
          transition={{ type: 'spring', stiffness: 250, damping: 30 }}
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
                            {/* LABEL: Only % */}
                            {slice.percentage >= 10 && (
                                <text
                                    x={slice.labelX}
                                    y={slice.labelY}
                                    fill="#000000"
                                    fontSize={selectedId ? "0.28" : "0.12"}
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

        {/* 2. NEOBRUTALISM CARD (Description) */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
                key="detail-card"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 25 }}
                // Padding kiri besar untuk chart
                className="absolute inset-0 pt-28 px-4 pb-4 md:pl-40 md:pt-8 md:pr-8 z-30 flex flex-col"
            >
                {/* Main Card Container */}
                <div className="w-full h-full max-w-5xl mx-auto bg-white border-4 border-black shadow-[12px_12px_0_black] flex flex-col overflow-hidden relative rounded-lg">
                    
                    {/* A. Marquee Header (Teks Berjalan) */}
                    <div className="h-10 border-b-4 border-black bg-[#4DE1C1] overflow-hidden flex items-center whitespace-nowrap shrink-0">
                        <motion.div 
                            animate={{ x: [0, -1000] }}
                            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                            className="flex items-center gap-8 font-black uppercase text-sm"
                        >
                            {[...Array(10)].map((_, i) => (
                                <span key={i} className="flex items-center gap-2">
                                    <Star className="w-4 h-4 fill-black" />
                                    Top Recommendation Found
                                    <Star className="w-4 h-4 fill-black" />
                                    Analysis Complete
                                </span>
                            ))}
                        </motion.div>
                    </div>

                    {/* B. Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar relative">
                        
                        {/* Close Button Inside */}
                        <button 
                            onClick={() => setSelectedId(null)}
                            className="absolute top-6 right-6 p-2 bg-white border-4 border-black hover:bg-red-100 shadow-[4px_4px_0_black] active:translate-y-1 active:shadow-none transition-all z-10"
                        >
                            <X className="w-6 h-6" strokeWidth={4} />
                        </button>

                        <div className="max-w-4xl">
                            {/* Tags */}
                            <div className="flex gap-3 mb-4">
                                {selectedItem.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-black text-white font-bold uppercase text-xs transform -rotate-1">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {/* Title & Big Stat */}
                            <div className="flex flex-col md:flex-row md:items-end gap-6 mb-8 border-b-4 border-black pb-8 border-dashed">
                                <div className="flex-1">
                                    <h2 className="text-4xl md:text-6xl font-black uppercase leading-[0.9] tracking-tight">
                                        {selectedItem.name}
                                    </h2>
                                </div>
                                {/* Sticker Stat */}
                                <div className="w-32 h-32 bg-[#FFD93D] rounded-full border-4 border-black flex flex-col items-center justify-center shadow-[4px_4px_0_black] shrink-0 rotate-6 transform hover:rotate-0 transition-transform">
                                    <span className="text-4xl font-black">{selectedItem.percentage}%</span>
                                    <span className="text-xs font-bold uppercase">Match</span>
                                </div>
                            </div>

                            {/* Description Box */}
                            <div className="mb-8 p-6 bg-[#F3F4F6] border-4 border-black relative">
                                <Briefcase className="absolute -top-4 -left-3 w-8 h-8 bg-white border-2 border-black p-1 fill-[#FF90E8]" />
                                <p className="text-xl font-bold leading-relaxed text-gray-800">
                                    &quot;{selectedItem.description}&quot;
                                </p>
                            </div>

                            {/* Skills Grid (Chunky Buttons) */}
                            <div>
                                <h3 className="font-black text-lg uppercase mb-4 flex items-center gap-2">
                                    <Zap className="w-6 h-6 fill-black" /> Required Skills
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {selectedItem.details.map((detail, i) => (
                                        <div 
                                            key={i} 
                                            className="group flex items-center justify-between p-4 border-4 border-black bg-white hover:bg-[#FF90E8] transition-colors shadow-[4px_4px_0_rgba(0,0,0,0.2)] hover:shadow-[4px_4px_0_black] cursor-default"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="flex items-center justify-center w-8 h-8 bg-black text-white font-black text-sm rounded-sm">
                                                    {i + 1}
                                                </span>
                                                <span className="font-bold text-sm uppercase">{detail}</span>
                                            </div>
                                            <Hash className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Bottom CTA */}
                            <div className="mt-10 pt-6">
                                <button className="w-full py-4 bg-black text-white font-black text-lg uppercase tracking-widest hover:bg-[#4DE1C1] hover:text-black border-4 border-transparent hover:border-black shadow-[8px_8px_0_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0_black] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2">
                                    Start This Path <ChevronRight className="w-6 h-6" strokeWidth={4} />
                                </button>
                            </div>
                        </div>
                    </div>
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
    </div>
  );
}