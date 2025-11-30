'use client'

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, ChevronRight, Hash, Zap, DollarSign, Cpu, MapPin, Clock, RefreshCw } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import BookLoader from '@/src/app/components/loader';

// Interface sesuai dengan yang kita minta ke LLM
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

// Math Helper
const getCoordinatesForPercent = (percent: number) => {
  const x = Math.cos(2 * Math.PI * percent);
  const y = Math.sin(2 * Math.PI * percent);
  return [x, y];
};

function CareerResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const transcriptId = searchParams.get('id');

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [error, setError] = useState<string | null>(null);

  // --- FETCH & ANALYZE LOGIC ---
  useEffect(() => {
    if (!transcriptId) {
      setError("No transcript ID provided.");
      setLoading(false);
      return;
    }

    const processCareer = async () => {
      try {
        // 1. Ambil data file Transcript dari DB
        const transcriptRes = await fetch(`/api/transcripts/${transcriptId}`);
        if (!transcriptRes.ok) throw new Error("Failed to fetch transcript file");
        
        const { data: transcriptData } = await transcriptRes.json();

        // 2. Kirim ke LLM untuk analisis
        const llmRes = await fetch('/api/llmcareer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileData: transcriptData.fileData,
            fileName: transcriptData.fileName
          })
        });

        if (!llmRes.ok) throw new Error("Failed to generate career path");

        const { data: recommendationsData } = await llmRes.json();
        
        // 3. Set Data
        setRecommendations(recommendationsData);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    processCareer();
  }, [transcriptId]);

  const selectedItem = recommendations.find(r => r.id === selectedId);

  // Scroll handler
  useEffect(() => {
    if (selectedId) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedId]);

  if (loading) return <BookLoader />;
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8DC]">
        <div className="text-center p-8 bg-white border-4 border-black shadow-[8px_8px_0_black]">
          <h2 className="text-2xl font-black mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 bg-[#FFD93D] border-2 border-black font-bold shadow-[4px_4px_0_black] hover:translate-y-1 hover:shadow-none transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Chart Data Logic
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
    const labelX = Number((midX * 0.7).toFixed(6)); 
    const labelY = Number((midY * 0.7).toFixed(6));

    return {
      currentPercent: endPercent,
      items: [...acc.items, { ...slice, pathData, labelX, labelY }]
    };
  }, { currentPercent: 0, items: [] as any[] }).items;

  return (
    <div className="min-h-screen w-full bg-[#FFF8DC] font-sans text-black relative flex flex-col pb-10">
      
      {/* HEADER */}
      <div className="flex items-center justify-between p-6 z-20">
            <motion.div className="flex items-center gap-3" animate={{ opacity: 1 }}>
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

      {/* CHART AREA */}
      <motion.div 
        className="w-full flex flex-col items-center justify-center relative z-10"
        animate={{ 
            height: selectedId ? '300px' : '65vh',
            marginBottom: selectedId ? '20px' : '0px'
        }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
           <motion.div
             className="relative aspect-square"
             animate={{ 
                width: selectedId ? '200px' : 'min(90vw, 450px)'
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

           <AnimatePresence>
            {!selectedId && (
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
           </AnimatePresence>
      </motion.div>

      {/* CONTENT AREA */}
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

                {/* BENTO GRID */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-20">
                    
                    {/* STATS & GROWTH */}
                    <div className="md:col-span-4 space-y-6">
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

                        <div className="bg-black text-white p-5 border-4 border-black shadow-[6px_6px_0_gray]">
                            <h3 className="font-black uppercase text-lg mb-4 text-[#FF90E8]">Market Data</h3>
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
                                <span className="text-xs font-bold uppercase">Trend:</span>
                                <span className="px-2 py-1 bg-[#FFD93D] text-black text-xs font-black uppercase">
                                    {selectedItem.growthMetrics.trend}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* MAIN INFO */}
                    <div className="md:col-span-5 space-y-6">
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

                    {/* TOOLS & RESOURCES */}
                    <div className="md:col-span-3 space-y-6">
                        <div className="bg-white border-4 border-black p-4 shadow-[6px_6px_0_black]">
                             <h3 className="font-black uppercase text-sm mb-3 border-b-2 border-black pb-2">Toolkit</h3>
                            <div className="flex flex-col gap-2">
                                {selectedItem.tools.map((tool) => (
                                    <div key={tool} className="flex items-center gap-2 text-sm font-bold">
                                        <Hash className="w-3 h-3 text-gray-400" /> {tool}
                                    </div>
                                ))}
                            </div>
                        </div>

                         <div className="bg-[#FFD93D] border-4 border-black p-4 shadow-[6px_6px_0_black]">
                             <h3 className="font-black uppercase text-sm mb-3 border-b-2 border-black pb-2">Learn At</h3>
                            <ul className="space-y-3">
                                {selectedItem.learningResources.map((res, i) => (
                                    <li key={i} className="bg-white border-2 border-black p-2 text-xs">
                                        <span className="block font-black uppercase">{res.platform}</span>
                                        <span className="text-gray-500 font-bold">{res.type}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-white border-4 border-black p-4 shadow-[6px_6px_0_black]">
                             <h3 className="font-black uppercase text-sm mb-3 border-b-2 border-black pb-2">Similar</h3>
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
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Wrapper Suspense Wajib di Next.js 13+ untuk useSearchParams
export default function ResultPage() {
  return (
    <Suspense fallback={<BookLoader />}>
      <CareerResultContent />
    </Suspense>
  );
}