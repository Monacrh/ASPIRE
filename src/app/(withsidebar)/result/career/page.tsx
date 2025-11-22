'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, ChevronRight, Hash, Zap, DollarSign, Cpu, MapPin, Clock, RefreshCw } from 'lucide-react';

// --- DATA STRUCTURE ---
interface Recommendation {
  id: string;
  name: string;
  percentage: number;
  color: string;
  description: string;
  details: string[];
  tags: string[];
  salary: string;
  tools: string[];
  stats: {
    logic: number;
    creativity: number;
    social: number;
  };
  careerPath: {
    level: string;
    years: string;
  }[];
  dayInLife: {
    activity: string;
    percentage: number;
  }[];
  growthMetrics: {
    demand: number;
    growth: string;
    trend: 'rising' | 'stable' | 'declining';
  };
  industries: string[];
  learningResources: {
    platform: string;
    type: string;
  }[];
  similarCareers: string[];
}

const recommendations: Recommendation[] = [
  {
    id: '1',
    name: 'Software Engineer',
    percentage: 85,
    color: '#FFD93D',
    description: 'You are the architect of the digital world. While others see only pixels, you see the matrix. You enjoy building complex systems from scratch, debugging reality, and drinking excessive amounts of coffee.',
    details: ['System Design', 'Algorithms', 'Full-Stack', 'Cloud Ops'],
    tags: ['High Demand', 'Builder'],
    salary: '$80k - $150k',
    tools: ['VS Code', 'Docker', 'Git', 'Jira'],
    stats: { logic: 95, creativity: 60, social: 40 },
    careerPath: [
      { level: 'Junior Dev', years: '0-2y' },
      { level: 'Mid-Level', years: '2-5y' },
      { level: 'Senior', years: '5-8y' },
      { level: 'Lead/Architect', years: '8y+' }
    ],
    dayInLife: [
      { activity: 'Coding', percentage: 45 },
      { activity: 'Meetings', percentage: 20 },
      { activity: 'Code Review', percentage: 15 },
      { activity: 'Learning', percentage: 20 }
    ],
    growthMetrics: {
      demand: 95,
      growth: '+28% yearly',
      trend: 'rising'
    },
    industries: ['Tech Startups', 'Finance', 'E-commerce', 'Gaming', 'AI/ML'],
    learningResources: [
      { platform: 'LeetCode', type: 'Practice' },
      { platform: 'System Design Primer', type: 'Course' },
      { platform: 'Clean Code Book', type: 'Reading' }
    ],
    similarCareers: ['DevOps Engineer', 'Backend Specialist', 'Cloud Architect']
  },
  {
    id: '2',
    name: 'Data Scientist',
    percentage: 72,
    color: '#FF90E8',
    description: 'You are a modern-day oracle. You see patterns where others see chaos. Using math and statistics to predict the future is your superpower, turning raw numbers into actionable gold.',
    details: ['Machine Learning', 'Statistics', 'Python / R', 'Big Data'],
    tags: ['Analytical', 'Math'],
    salary: '$90k - $160k',
    tools: ['Jupyter', 'TensorFlow', 'Tableau', 'SQL'],
    stats: { logic: 90, creativity: 50, social: 50 },
    careerPath: [
      { level: 'Analyst', years: '0-2y' },
      { level: 'Data Scientist', years: '2-4y' },
      { level: 'Senior DS', years: '4-7y' },
      { level: 'ML/AI Lead', years: '7y+' }
    ],
    dayInLife: [
      { activity: 'Data Analysis', percentage: 35 },
      { activity: 'Model Building', percentage: 30 },
      { activity: 'Stakeholder Sync', percentage: 20 },
      { activity: 'Research', percentage: 15 }
    ],
    growthMetrics: {
      demand: 92,
      growth: '+31% yearly',
      trend: 'rising'
    },
    industries: ['Healthcare', 'Finance', 'Marketing', 'Research', 'AI Startups'],
    learningResources: [
      { platform: 'Kaggle', type: 'Competition' },
      { platform: 'Fast.ai', type: 'Course' },
      { platform: 'Scikit-learn Docs', type: 'Documentation' }
    ],
    similarCareers: ['ML Engineer', 'Business Analyst', 'Research Scientist']
  },
  {
    id: '3',
    name: 'Product Manager',
    percentage: 60,
    color: '#4DE1C1',
    description: 'The diplomat of the tech world. You bridge the gap between code and customers. You prioritize features, manage roadmaps, and ensure the ship is steering in the right direction.',
    details: ['Strategy', 'User Empathy', 'Scrum', 'Leadership'],
    tags: ['Strategy', 'Social'],
    salary: '$100k - $170k',
    tools: ['Notion', 'Figma', 'Slack', 'Amplitude'],
    stats: { logic: 70, creativity: 60, social: 95 },
    careerPath: [
      { level: 'Associate PM', years: '0-2y' },
      { level: 'Product Manager', years: '2-5y' },
      { level: 'Senior PM', years: '5-8y' },
      { level: 'VP Product', years: '8y+' }
    ],
    dayInLife: [
      { activity: 'Meetings', percentage: 40 },
      { activity: 'Strategy', percentage: 25 },
      { activity: 'User Research', percentage: 20 },
      { activity: 'Documentation', percentage: 15 }
    ],
    growthMetrics: {
      demand: 88,
      growth: '+22% yearly',
      trend: 'rising'
    },
    industries: ['SaaS', 'Fintech', 'Consumer Apps', 'Enterprise', 'Marketplaces'],
    learningResources: [
      { platform: 'ProductSchool', type: 'Bootcamp' },
      { platform: 'Inspired by Cagan', type: 'Book' },
      { platform: 'Reforge', type: 'Community' }
    ],
    similarCareers: ['Project Manager', 'Growth PM', 'Technical PM']
  },
  {
    id: '4',
    name: 'UX Designer',
    percentage: 45,
    color: '#FFFFFF',
    description: 'The user\'s champion. You ensure technology feels human, not robotic. You fight for intuitive experiences, crafting interfaces that are not just functional, but beautiful and delightful.',
    details: ['Wireframing', 'Prototyping', 'User Research', 'Visual UI'],
    tags: ['Creative', 'Empathy'],
    salary: '$75k - $140k',
    tools: ['Figma', 'Sketch', 'Maze', 'Adobe CC'],
    stats: { logic: 40, creativity: 95, social: 80 },
    careerPath: [
      { level: 'Junior Designer', years: '0-2y' },
      { level: 'UX Designer', years: '2-4y' },
      { level: 'Senior UX', years: '4-7y' },
      { level: 'Design Lead', years: '7y+' }
    ],
    dayInLife: [
      { activity: 'Design Work', percentage: 50 },
      { activity: 'User Testing', percentage: 20 },
      { activity: 'Collaboration', percentage: 20 },
      { activity: 'Research', percentage: 10 }
    ],
    growthMetrics: {
      demand: 85,
      growth: '+18% yearly',
      trend: 'stable'
    },
    industries: ['Tech Companies', 'Agencies', 'Consultancy', 'Startups', 'Gaming'],
    learningResources: [
      { platform: 'UX Collective', type: 'Blog' },
      { platform: 'Interaction Design', type: 'Course' },
      { platform: 'Nielsen Norman', type: 'Certification' }
    ],
    similarCareers: ['UI Designer', 'Product Designer', 'UX Researcher']
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
  const [isRegenerating, setIsRegenerating] = useState(false);
  
  const selectedItem = recommendations.find(r => r.id === selectedId);

  // Scroll to top when selection changes
  useEffect(() => {
    if (selectedId) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedId]);

  // Handle Regenerate / Reroll
  const handleRegenerate = () => {
    if (isRegenerating) return;
    setIsRegenerating(true);
    
    // Simulate data fetching delay
    setTimeout(() => {
        setIsRegenerating(false);
        setSelectedId(null); 
    }, 1500);
  };

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
    <div className="min-h-screen w-full bg-[#FFF8DC] font-sans text-black relative flex flex-col pb-10">
      
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between p-6 z-20">
            <motion.div 
                className="flex items-center gap-3"
                animate={{ opacity: 1 }}
            >
                {selectedId ? (
                     <button 
                        onClick={() => setSelectedId(null)}
                        className="w-12 h-12 bg-black text-white border-4 border-black shadow-[4px_4px_0_white] flex items-center justify-center hover:-translate-y-1 transition-transform"
                    >
                        <ArrowLeft className="w-6 h-6" strokeWidth={3} />
                    </button>
                ) : (
                    <button className="w-12 h-12 bg-white border-4 border-black shadow-[4px_4px_0_black] flex items-center justify-center">
                        <Star className="w-6 h-6" strokeWidth={3} />
                    </button>
                )}
               
                <h1 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter">
                    Result<span className="text-[#FF6B6B]">.</span>
                </h1>
            </motion.div>
            
            <div className="hidden md:block px-4 py-2 bg-[#FF90E8] border-4 border-black font-black uppercase shadow-[4px_4px_0_black] transform rotate-2">
                Career
            </div>
      </div>

      {/* --- CHART AREA --- */}
      <motion.div 
        className="w-full flex flex-col items-center justify-center relative z-10"
        animate={{ 
            height: selectedId ? '300px' : '65vh',
            marginBottom: selectedId ? '20px' : '0px'
        }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
           {/* === REGENERATE BUTTON === */}
           <AnimatePresence>
            {!selectedId && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    // Positioned top-right relative to the container
                    className="absolute top-4 right-4 md:top-10 md:right-10 z-30"
                >
                    <button
                        onClick={handleRegenerate}
                        disabled={isRegenerating}
                        className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-black shadow-[4px_4px_0_black] hover:shadow-[2px_2px_0_black] hover:translate-x-0.5 hover:translate-y-0.5 transition-all active:shadow-none active:translate-x-1 active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        <RefreshCw 
                            className={`w-5 h-5 ${isRegenerating ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} 
                        />
                        <span className="font-black text-sm uppercase hidden md:inline">Reroll</span>
                    </button>
                </motion.div>
            )}
           </AnimatePresence>

           {/* Chart SVG */}
           <motion.div
             className="relative aspect-square"
             animate={{ 
                width: selectedId ? '200px' : 'min(90vw, 450px)',
                opacity: isRegenerating ? 0.5 : 1, 
                scale: isRegenerating ? 0.95 : 1
             }}
             transition={{ duration: 0.3 }}
           >
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
                                scale: isSelected ? 1.05 : 1,
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
                            {(slice.percentage >= 10 || (selectedId && isSelected)) && (
                                <text
                                    x={slice.labelX}
                                    y={slice.labelY}
                                    fill="#000000"
                                    fontSize={selectedId ? "0.15" : "0.12"}
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
           </motion.div>

           {/* Call to Action Text (Outside Chart) */}
           <AnimatePresence>
            {!selectedId && !isRegenerating && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: 0.2 }}
                    className="mt-8 text-center"
                >
                    <div className="inline-block px-6 py-3 bg-white border-2 border-black shadow-[4px_4px_0_black] hover:shadow-[6px_6px_0_black] transition-shadow cursor-default">
                        <span className="font-black text-sm uppercase tracking-wide flex items-center gap-2">
                             Choose a Path 👆
                        </span>
                    </div>
                </motion.div>
            )}
             {/* Loading State Text */}
             {!selectedId && isRegenerating && (
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="mt-8 text-center"
                >
                    <span className="font-black text-sm uppercase tracking-widest animate-pulse">
                        Generating New Paths...
                    </span>
                </motion.div>
            )}
           </AnimatePresence>
      </motion.div>

      {/* --- CONTENT AREA (Bento Grid Layout) --- */}
      <AnimatePresence mode="wait">
        {selectedItem && (
            <motion.div
                key={selectedItem.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full max-w-6xl mx-auto px-4 sm:px-6"
            >
                {/* IDENTITY HEADER */}
                <div className="mb-8 text-center md:text-left flex flex-col md:flex-row items-end gap-6 border-b-4 border-black pb-8">
                    <div className="flex-1">
                        <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-3">
                            {selectedItem.tags.map((tag) => (
                                <span key={tag} className="px-3 py-1 bg-black text-white text-xs font-bold uppercase tracking-wider transform -skew-x-12">
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black uppercase leading-[0.9] mb-4">
                            {selectedItem.name}
                        </h2>
                        <p className="text-lg md:text-xl font-bold leading-relaxed text-gray-700 max-w-2xl">
                            {selectedItem.description}
                        </p>
                    </div>
                    
                    {/* Salary Box */}
                    <div className="bg-[#4DE1C1] border-4 border-black p-4 shadow-[8px_8px_0_black] rotate-1 md:rotate-3 shrink-0 w-full md:w-auto">
                        <div className="flex items-center gap-2 mb-1 justify-center md:justify-start">
                            <DollarSign className="w-5 h-5" />
                            <span className="font-black uppercase text-sm">Avg. Salary</span>
                        </div>
                        <div className="font-mono font-black text-2xl md:text-3xl text-center md:text-right">
                            {selectedItem.salary}
                        </div>
                    </div>
                </div>

                {/* BENTO GRID LAYOUT */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-20">
                    
                    {/* COL 1: STATS & GROWTH (Span 4) */}
                    <div className="md:col-span-4 space-y-6">
                        {/* Stats */}
                        <div className="bg-white border-4 border-black p-5 shadow-[6px_6px_0_black]">
                             <h3 className="font-black uppercase text-lg mb-4 flex items-center gap-2">
                                <Cpu className="w-5 h-5" /> Attributes
                             </h3>
                             <div className="space-y-4">
                                {Object.entries(selectedItem.stats).map(([key, value]) => (
                                    <div key={key}>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-xs font-bold uppercase">{key}</span>
                                            <span className="text-xs font-black">{value}%</span>
                                        </div>
                                        <div className="h-4 bg-gray-200 border-2 border-black">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${value}%` }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 1 }}
                                                className="h-full bg-[#FFD93D] border-r-2 border-black"
                                            />
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>

                        {/* Market Data */}
                        <div className="bg-black text-white p-5 border-4 border-black shadow-[6px_6px_0_gray]">
                            <h3 className="font-black uppercase text-lg mb-4 text-[#FF90E8]">
                                Market Data
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 border-2 border-white/20">
                                    <div className="text-[10px] font-bold uppercase text-gray-400">Demand</div>
                                    <div className="text-2xl font-black">{selectedItem.growthMetrics.demand}</div>
                                </div>
                                <div className="p-3 border-2 border-white/20">
                                    <div className="text-[10px] font-bold uppercase text-gray-400">Growth</div>
                                    <div className="text-xl font-black text-[#4DE1C1]">{selectedItem.growthMetrics.growth}</div>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t-2 border-white/20 flex justify-between items-center">
                                <span className="text-xs font-bold uppercase">Current Trend:</span>
                                <span className="px-2 py-1 bg-[#FFD93D] text-black text-xs font-black uppercase">
                                    {selectedItem.growthMetrics.trend}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* COL 2: MAIN INFO (Span 5) */}
                    <div className="md:col-span-5 space-y-6">
                         {/* Core Abilities */}
                         <div className="bg-[#FF90E8] border-4 border-black p-5 shadow-[6px_6px_0_black]">
                            <h3 className="font-black uppercase text-lg mb-4 flex items-center gap-2">
                                <Zap className="w-5 h-5" /> Core Skills
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {selectedItem.details.map((detail, i) => (
                                    <span key={i} className="px-3 py-2 bg-white border-2 border-black font-bold text-sm uppercase shadow-sm">
                                        {detail}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Career Path Timeline */}
                        <div className="bg-white border-4 border-black p-5 shadow-[6px_6px_0_black]">
                            <h3 className="font-black uppercase text-lg mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5" /> Career Roadmap
                            </h3>
                            <div className="relative border-l-4 border-black ml-2 space-y-6 py-2">
                                {selectedItem.careerPath.map((step, idx) => (
                                    <div key={idx} className="pl-6 relative">
                                        <div className="absolute -left-2.5 top-1 w-4 h-4 bg-black border-2 border-white" />
                                        <div className="font-black text-sm uppercase">{step.level}</div>
                                        <div className="text-xs font-bold text-gray-500 bg-gray-100 inline-block px-1 mt-1">{step.years}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Daily Routine */}
                         <div className="bg-[#F3F4F6] border-4 border-black p-5 shadow-[6px_6px_0_black]">
                            <h3 className="font-black uppercase text-lg mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5" /> Daily Split
                            </h3>
                            <div className="flex h-8 w-full border-2 border-black">
                                {selectedItem.dayInLife.map((item, idx) => (
                                    <div 
                                        key={idx}
                                        className="h-full flex items-center justify-center relative group"
                                        style={{ 
                                            width: `${item.percentage}%`, 
                                            backgroundColor: idx % 2 === 0 ? selectedItem.color : '#FFF' 
                                        }}
                                    >
                                        {/* Tooltip on hover */}
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold uppercase px-2 py-1 opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                                            {item.activity}: {item.percentage}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-4 mt-3">
                                {selectedItem.dayInLife.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 border border-black" style={{ backgroundColor: idx % 2 === 0 ? selectedItem.color : '#FFF' }} />
                                        <span className="text-[10px] font-bold uppercase">{item.activity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* COL 3: TOOLS & RESOURCES (Span 3) */}
                    <div className="md:col-span-3 space-y-6">
                        {/* Tools */}
                        <div className="bg-white border-4 border-black p-4 shadow-[6px_6px_0_black]">
                             <h3 className="font-black uppercase text-sm mb-3 border-b-2 border-black pb-2">
                                Toolkit
                            </h3>
                            <div className="flex flex-col gap-2">
                                {selectedItem.tools.map((tool) => (
                                    <div key={tool} className="flex items-center gap-2 text-sm font-bold">
                                        <Hash className="w-3 h-3 text-gray-400" /> {tool}
                                    </div>
                                ))}
                            </div>
                        </div>

                         {/* Resources */}
                         <div className="bg-[#FFD93D] border-4 border-black p-4 shadow-[6px_6px_0_black]">
                             <h3 className="font-black uppercase text-sm mb-3 border-b-2 border-black pb-2">
                                Learn At
                            </h3>
                            <ul className="space-y-3">
                                {selectedItem.learningResources.map((res, i) => (
                                    <li key={i} className="bg-white border-2 border-black p-2 text-xs">
                                        <span className="block font-black uppercase">{res.platform}</span>
                                        <span className="text-gray-500 font-bold">{res.type}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Similar */}
                        <div className="bg-white border-4 border-black p-4 shadow-[6px_6px_0_black]">
                             <h3 className="font-black uppercase text-sm mb-3 border-b-2 border-black pb-2">
                                Similar
                            </h3>
                            <div className="space-y-2">
                                {selectedItem.similarCareers.map((c, i) => (
                                    <div key={i} className="text-xs font-bold hover:underline cursor-pointer flex items-center gap-1">
                                        <ChevronRight className="w-3 h-3" /> {c}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>

                 {/* CTA Footer REMOVED as requested */}

            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}