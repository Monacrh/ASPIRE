'use client'

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Icons
import { ArrowLeft, RefreshCw, BarChart3, TrendingUp, Award, CheckCircle2, MousePointerClick, Globe, MonitorPlay, FileText, Code2, Lightbulb } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import BookLoader from '@/src/app/components/loader';

// --- TIPE DATA ---
interface EvidenceItem {
  subject: string;
  grade: string;
}

interface AcademicStat {
  label: string;
  score: number;
  reason: string;
}

interface CompetencyItem {
  id: string;
  name: string;
  percentage: number;
  color: string;
  tagline: string;
  description: string;
  
  evidence: EvidenceItem[];
  hardSkills: string[];
  projectIdeas: string[];

  keyStrength: string;
  areaToImprove: string;
  academicStats: AcademicStat[];
  learningPlatforms: string[];
  relatedRoles: string[];
  actionPlan: string;
}

const getCoordinatesForPercent = (percent: number) => {
  const x = Math.cos(2 * Math.PI * percent);
  const y = Math.sin(2 * Math.PI * percent);
  return [x, y];
};

function CompetencyResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const transcriptId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [dataList, setDataList] = useState<CompetencyItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const fetchData = async (forceRegenerate = false) => {
    if (!transcriptId) {
      setError("No transcript ID provided.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/llmcourse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcriptId, forceRegenerate })
      });

      if (!res.ok) throw new Error("Failed to analyze data");

      const json = await res.json();
      if (json.success) {
        const result = Array.isArray(json.data) ? json.data : [json.data];
        setDataList(result);
      } else {
        throw new Error(json.message);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setIsRegenerating(false);
    }
  };

  useEffect(() => { fetchData(false); }, [transcriptId]);

  const handleRegenerate = async () => {
    if (isRegenerating) return;
    setIsRegenerating(true);
    setSelectedId(null);
    await fetchData(true); 
  };

  const selectedItem = selectedId ? dataList.find(r => r.id === selectedId) : null;

  if (loading && !isRegenerating) return <BookLoader />;
  if (error || dataList.length === 0) return <div className="p-10 text-center font-bold">No Data Found</div>;

  // --- CHART LOGIC ---
  const chartData = dataList.reduce((acc, slice) => {
    const total = dataList.reduce((sum, item) => sum + item.percentage, 0);
    const slicePercent = slice.percentage / total;
    const startPercent = acc.currentPercent;
    const endPercent = startPercent + slicePercent;
    const [startX, startY] = getCoordinatesForPercent(startPercent);
    const [endX, endY] = getCoordinatesForPercent(endPercent);
    const largeArcFlag = slicePercent > 0.5 ? 1 : 0;
    const pathData = `M 0 0 L ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} L 0 0`;
    const midPercent = startPercent + slicePercent / 2;
    const [midX, midY] = getCoordinatesForPercent(midPercent);
    const labelX = Number((midX * 0.75).toFixed(6)); 
    const labelY = Number((midY * 0.75).toFixed(6));
    return {
      currentPercent: endPercent,
      items: [...acc.items, { ...slice, pathData, labelX, labelY }]
    };
  }, { currentPercent: 0, items: [] as any[] }).items;

  return (
    <div className="min-h-screen w-full bg-[#FFF8DC] font-sans text-black relative flex flex-col pb-20 overflow-x-hidden">
      
      {/* HEADER */}
      <div className="flex items-center justify-between p-6 z-20">
        <motion.div className="flex items-center gap-3" animate={{ opacity: 1 }}>
          {selectedId ? (
            <button onClick={() => setSelectedId(null)} className="w-12 h-12 bg-black text-white border-4 border-black shadow-[4px_4px_0_white] flex items-center justify-center hover:-translate-y-1 transition-transform">
              <ArrowLeft className="w-6 h-6" strokeWidth={3} />
            </button>
          ) : (
            <button onClick={() => router.push('/dashboard')} className="w-12 h-12 bg-white border-4 border-black shadow-[4px_4px_0_black] flex items-center justify-center">
               <BarChart3 className="w-6 h-6" strokeWidth={3} />
            </button>
          )}
          <h1 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter">
            Course Profile<span className="text-[#FF6B6B]">.</span>
          </h1>
        </motion.div>
        <div className="hidden md:block px-4 py-2 bg-[#FF90E8] border-4 border-black font-black uppercase shadow-[4px_4px_0_black] transform rotate-2">
            Competency Mix
        </div>
      </div>

      {/* CHART AREA */}
      <motion.div 
        className="w-full flex flex-col items-center justify-center relative z-10 px-4"
        animate={{ marginTop: selectedId ? '0px' : '5vh', height: selectedId ? 'auto' : '60vh', scale: selectedId ? 0.9 : 1 }}
        transition={{ type: 'spring', stiffness: 80, damping: 20 }}
      >
        <AnimatePresence>
          {!selectedId && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute top-0 right-0 md:top-4 md:right-10 z-30">
              <button onClick={handleRegenerate} disabled={isRegenerating} className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-black shadow-[4px_4px_0_black] hover:shadow-[2px_2px_0_black] transition-all active:shadow-none group">
                <RefreshCw className={`w-5 h-5 ${isRegenerating ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                <span className="font-black text-sm uppercase hidden md:inline">Reroll</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div className="relative aspect-square" animate={{ width: selectedId ? '220px' : 'min(85vw, 450px)', opacity: isRegenerating ? 0.5 : 1 }}>
          <svg viewBox="-1.05 -1.05 2.1 2.1" className="w-full h-full overflow-visible drop-shadow-2xl" style={{ transform: 'rotate(-90deg)' }}>
            {chartData.map((slice: any, index: number) => {
              const isSelected = selectedId === slice.id;
              const isDimmed = selectedId && !isSelected;
              return (
                <motion.g 
                  key={`${slice.id}-${index}`}
                  onClick={() => !isRegenerating && setSelectedId(isSelected ? null : slice.id)}
                  className="cursor-pointer"
                  animate={{ opacity: isDimmed ? 0.3 : 1, scale: isSelected ? 1.05 : 1, filter: isDimmed ? 'grayscale(100%)' : 'none' }}
                  whileHover={{ scale: 1.05 }}
                >
                  <path d={slice.pathData} fill={slice.color} stroke="#000000" strokeWidth="0.04" />
                  {(slice.percentage >= 6 || (selectedId && isSelected)) && (
                    <text x={slice.labelX} y={slice.labelY} fill="#000000" fontSize={selectedId ? "0.14" : "0.11"} fontWeight="900" textAnchor="middle" alignmentBaseline="middle" transform={`rotate(90 ${slice.labelX} ${slice.labelY})`} style={{ pointerEvents: 'none', userSelect: 'none' }}>
                      {slice.percentage}%
                    </text>
                  )}
                </motion.g>
              );
            })}
          </svg>
        </motion.div>

        {/* --- ADDED: REGENERATING INDICATOR --- */}
        <AnimatePresence>
          {!selectedId && isRegenerating && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="mt-8 text-center"
            >
              <span className="font-black text-sm uppercase tracking-widest animate-pulse">
                Regenerating...
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        {/* ----------------------------------- */}

        {/* <AnimatePresence>
          {!selectedId && !isRegenerating && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-8 text-center">
                <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 font-bold uppercase tracking-widest text-xs transform -rotate-2 shadow-[4px_4px_0_#FF90E8]">
                    <MousePointerClick className="w-4 h-4" /> Click slice to view analysis
                </div>
             </motion.div>
          )}
        </AnimatePresence> */}
      </motion.div>

      {/* --- CONTENT AREA (Rich Bento Grid) --- */}
      <AnimatePresence mode="wait">
        {selectedItem && (
          <motion.div
            key={selectedItem.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="w-full max-w-5xl mx-auto px-4 sm:px-6 z-10 mt-6"
          >
            
            {/* 1. HEADER */}
            <div className="mb-8 flex flex-col md:flex-row items-start md:items-end gap-6 border-b-4 border-black pb-8">
              <div className="flex-1 w-full">
                <div className="flex flex-wrap gap-2 mb-3">
                   <span className="px-3 py-1 bg-black text-white text-xs font-bold uppercase tracking-wider">Domain #{selectedItem.id}</span>
                   <span className="px-3 py-1 bg-[#FFD93D] border-2 border-black text-xs font-bold uppercase tracking-wider">{selectedItem.percentage}% Composition</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black uppercase leading-[0.9] mb-4 wrap-break-word">{selectedItem.name}</h2>
                <p className="text-lg font-medium leading-relaxed text-gray-800 border-l-4 border-black pl-4">
                  &quot;{selectedItem.description}&quot;
                </p>
              </div>
              
              <div className="bg-[#4DE1C1] border-4 border-black p-4 shadow-[6px_6px_0_black] shrink-0 w-full md:w-auto md:max-w-[300px]">
                <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                  <Award className="w-5 h-5" />
                  <span className="font-black uppercase text-sm">Key Strength</span>
                </div>
                <div className="font-mono font-black text-lg md:text-xl text-center md:text-right uppercase wrap-break-word leading-tight">
                  {selectedItem.keyStrength}
                </div>
              </div>
            </div>

            {/* 2. BENTO GRID */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-10">
                
                {/* COL 1: EVIDENCE & SKILLS */}
                <div className="md:col-span-4 space-y-6">
                    <div className="bg-white border-4 border-black p-5 shadow-[6px_6px_0_black] flex flex-col h-[300px]">
                        <h3 className="font-black uppercase text-lg mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5" /> Academic Track
                        </h3>
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                             {/* FILTER KOSONG: Hanya tampilkan jika grade ada isinya */}
                             {selectedItem.evidence && selectedItem.evidence
                                .filter(ev => ev.grade && ev.grade.trim() !== '' && ev.grade !== '-' && ev.grade !== 'null')
                                .map((ev, i) => (
                                <div key={i} className="flex justify-between items-center bg-gray-50 p-2 border border-gray-200">
                                    <span className="text-xs font-bold text-gray-700 truncate w-[70%]">{ev.subject}</span>
                                    <span className={`text-xs font-black px-2 py-0.5 border border-black ${(ev.grade || '').includes('A') ? 'bg-[#4DE1C1]' : 'bg-[#FFD93D]'}`}>
                                        {ev.grade}
                                    </span>
                                </div>
                             ))}
                        </div>
                    </div>

                    <div className="bg-[#4DE1C1] border-4 border-black p-5 shadow-[6px_6px_0_black]">
                        <h3 className="font-black uppercase text-sm mb-3 flex items-center gap-2">
                            <Code2 className="w-4 h-4" /> Skill Inventory
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {selectedItem.hardSkills && selectedItem.hardSkills.map((skill, i) => (
                                <span key={i} className="px-2 py-1 bg-white border-2 border-black font-bold text-[10px] uppercase shadow-[1px_1px_0_black]">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* COL 2: THESIS & STATS */}
                <div className="md:col-span-5 space-y-6">
                    
                    {/* Thesis Sparks */}
                    <div className="bg-[#FF90E8] border-4 border-black p-5 shadow-[6px_6px_0_black]">
                        <h3 className="font-black uppercase text-lg mb-4 flex items-center gap-2">
                            <Lightbulb className="w-5 h-5" /> Thesis Sparks
                        </h3>
                        <div className="space-y-3">
                             {selectedItem.projectIdeas && selectedItem.projectIdeas.map((idea, i) => (
                                <div key={i} className="bg-white border-2 border-black p-3 flex items-start gap-3">
                                    <span className="font-black text-[#FF90E8]">0{i+1}</span>
                                    <p className="text-xs font-bold uppercase leading-relaxed">
                                        {idea}
                                    </p>
                                </div>
                             ))}
                        </div>
                    </div>

                    {/* Stats (Force Show 3) */}
                    <div className="bg-white border-4 border-black p-5 shadow-[6px_6px_0_black]">
                        <h3 className="font-black uppercase text-lg mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" /> Performance
                        </h3>
                        <div className="space-y-6">
                        {selectedItem.academicStats && selectedItem.academicStats.map((stat, idx) => (
                            <div key={idx} className="relative">
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-bold uppercase">{stat.label}</span>
                                    <span className="text-sm font-black">{stat.score}/100</span>
                                </div>
                                <div className="h-3 bg-gray-200 border-2 border-black mb-1">
                                    <motion.div 
                                      initial={{ width: 0 }} 
                                      whileInView={{ width: `${stat.score}%` }} 
                                      viewport={{ once: true }} 
                                      transition={{ duration: 1 }} 
                                      className="h-full border-r-2 border-black" 
                                      style={{ backgroundColor: selectedItem.color }} 
                                    />
                                </div>
                                <p className="text-[10px] text-gray-500 italic leading-tight">
                                  {stat.reason}
                                </p>
                            </div>
                        ))}
                        </div>
                    </div>
                </div>

                {/* COL 3: ACTION PLAN & PLATFORMS */}
                <div className="md:col-span-3 space-y-6">
                    {/* Action Plan */}
                    <div className="bg-white border-4 border-black p-5 shadow-[6px_6px_0_black]">
                        <h3 className="font-black uppercase text-sm mb-2 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> Next Step
                        </h3>
                        <p className="font-medium text-sm leading-tight text-gray-700">
                            {selectedItem.actionPlan}
                        </p>
                    </div>

                     {/* Learning Platforms */}
                    <div className="bg-[#F3F4F6] border-4 border-black p-5 shadow-[6px_6px_0_black]">
                        <h3 className="font-black uppercase text-sm mb-3 flex items-center gap-2">
                            <MonitorPlay className="w-4 h-4" /> Platforms
                        </h3>
                        <div className="flex flex-col gap-2">
                             {selectedItem.learningPlatforms && selectedItem.learningPlatforms.map((platform, i) => (
                                <div key={i} className="flex items-center gap-2 bg-white border border-black p-2">
                                    <Globe className="w-3 h-3 text-gray-400" />
                                    <span className="text-[10px] font-bold uppercase truncate">{platform}</span>
                                </div>
                             ))}
                        </div>
                    </div>

                    {/* Roles */}
                    <div className="bg-[#FFD93D] border-4 border-black p-4 shadow-[6px_6px_0_black]">
                         <h3 className="font-black uppercase text-sm mb-2 border-b-2 border-black pb-1">Roles</h3>
                         <div className="flex flex-wrap gap-2">
                            {selectedItem.relatedRoles && selectedItem.relatedRoles.map((role, i) => (
                                <span key={i} className="text-[10px] font-bold underline decoration-black">
                                    {role}
                                </span>
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

export default function ResultPage() {
  return (
    <Suspense fallback={<BookLoader />}>
      <CompetencyResultContent />
    </Suspense>
  );
}