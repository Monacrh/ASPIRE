'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Menambahkan RefreshCw ke import
import { ArrowLeft, Brain, Target, BarChart, FileText, RefreshCw } from 'lucide-react';

// --- ELECTIVE COURSE DATA STRUCTURE ---
interface ElectiveCourse {
  id: string;
  code: string; // Course Code, e.g., IF4092
  title: string;
  credits: number; // SKS
  percentage: number; // Match Score based on transcript
  color: string;
  description: string;
  level: 'Undergraduate' | 'Master' | 'Specialization';
  tags: string[];
  skills: string[]; // Competencies gained
  // CLO Logic: 4 CLOs, each 4 weeks
  clos: {
    id: number;
    weeks: string;
    title: string;
    description: string;
  }[];
  composition: {
    type: string;
    percentage: number;
  }[];
  stats: {
    theory: number;
    project: number;
    exam: number;
  };
  prerequisites: string[];
}

const electiveCourses: ElectiveCourse[] = [
  {
    id: '1',
    code: 'CS4092',
    title: 'Advanced Generative AI',
    credits: 3,
    percentage: 40, // Changed from 92
    color: '#FFD93D',
    description: 'An elective to dive deep into Transformer architectures and LLMs. You will learn model fine-tuning, RAG systems, and AI ethics. Highly recommended based on your high grades in Linear Algebra and Probability.',
    level: 'Undergraduate',
    tags: ['Trending', 'High Relevance'],
    skills: ['PyTorch', 'Hugging Face', 'Prompt Eng', 'Vector DB'],
    clos: [
      { id: 1, weeks: 'Weeks 1-4', title: 'Deep Learning Foundation', description: 'Understanding Neural Networks basics, Backpropagation, and RNN/LSTM architectures as a foundation for sequence modeling.' },
      { id: 2, weeks: 'Weeks 5-8', title: 'Transformer Architecture', description: 'In-depth study of Self-Attention mechanisms, Encoder-Decoder structures, and BERT/GPT architectures.' },
      { id: 3, weeks: 'Weeks 9-12', title: 'LLM Adaptation & RAG', description: 'Fine-tuning techniques (PEFT/LoRA) and Retrieval Augmented Generation for specific contexts.' },
      { id: 4, weeks: 'Weeks 13-16', title: 'Final Project & Ethics', description: 'End-to-end implementation of GenAI applications and analysis of social impact/model bias.' }
    ],
    composition: [
      { type: 'Project', percentage: 50 },
      { type: 'Theory', percentage: 30 },
      { type: 'Quiz', percentage: 20 }
    ],
    stats: { theory: 30, project: 60, exam: 10 },
    prerequisites: ['CS2010 (Algorithms)', 'MA2031 (Statistics)'],
  },
  {
    id: '2',
    code: 'IS3104',
    title: 'Human-Computer Interaction',
    credits: 3,
    percentage: 30, // Changed from 78
    color: '#FF90E8',
    description: 'Focuses on User-Centered Design (UCD) interfaces. This course complements your technical skills with design empathy and usability testing capabilities.',
    level: 'Undergraduate',
    tags: ['Design', 'Soft Skill'],
    skills: ['Figma', 'Usability Testing', 'User Research', 'Prototyping'],
    clos: [
      { id: 1, weeks: 'Weeks 1-4', title: 'Design Thinking Framework', description: 'Basic concepts of Empathize, Define, and Ideate within the context of software development.' },
      { id: 2, weeks: 'Weeks 5-8', title: 'Prototyping & Wireframing', description: 'Creating Low-fidelity to High-fidelity prototypes using industry tools (Figma).' },
      { id: 3, weeks: 'Weeks 9-12', title: 'Evaluation & Testing', description: 'Heuristic Evaluation methods and Usability Testing with real users.' },
      { id: 4, weeks: 'Weeks 13-16', title: 'Interface Implementation', description: 'Translating designs into responsive and accessible frontend code.' }
    ],
    composition: [
      { type: 'Group Task', percentage: 60 },
      { type: 'Essay', percentage: 20 },
      { type: 'Presentation', percentage: 20 }
    ],
    stats: { theory: 40, project: 50, exam: 10 },
    prerequisites: ['None'],
  },
  {
    id: '3',
    code: 'SE4201',
    title: 'Software Architecture',
    credits: 4,
    percentage: 20, // Changed from 65
    color: '#4DE1C1',
    description: 'Learn how to design large-scale systems. From Monolith to Microservices, covering essential design patterns every Software Architect must know.',
    level: 'Undergraduate',
    tags: ['System Design', 'Hard Skill'],
    skills: ['Microservices', 'Docker/K8s', 'Cloud Design', 'UML'],
    clos: [
      { id: 1, weeks: 'Weeks 1-4', title: 'Architectural Styles', description: 'Introduction to Layered, Event-Driven, Microkernel, and Microservices architecture patterns.' },
      { id: 2, weeks: 'Weeks 5-8', title: 'Design Patterns', description: 'Applying GoF Patterns (Factory, Singleton, Observer) in production code.' },
      { id: 3, weeks: 'Weeks 9-12', title: 'Cloud Native Design', description: 'Designing scalable and resilient systems in Cloud environments (AWS/GCP).' },
      { id: 4, weeks: 'Weeks 13-16', title: 'Architecture Documentation', description: 'Documenting architectural decisions using C4 Model and ADR.' }
    ],
    composition: [
      { type: 'Diagrams', percentage: 40 },
      { type: 'Coding', percentage: 40 },
      { type: 'Report', percentage: 20 }
    ],
    stats: { theory: 50, project: 30, exam: 20 },
    prerequisites: ['CS3001 (OOP)'],
  },
  {
    id: '4',
    code: 'BA3022',
    title: 'Tech Entrepreneurship',
    credits: 2,
    percentage: 10, // Changed from 50
    color: '#FFFFFF',
    description: 'A cross-major course. Learn how to turn code into a business. Covers idea validation, Business Model Canvas, and investor pitching.',
    level: 'Undergraduate',
    tags: ['Business', 'Management'],
    skills: ['Business Canvas', 'Pitching', 'Product Mgmt', 'Market Analysis'],
    clos: [
      { id: 1, weeks: 'Weeks 1-4', title: 'Ideation & Validation', description: 'Finding Market Fit problems and validating startup ideas.' },
      { id: 2, weeks: 'Weeks 5-8', title: 'Business Modeling', description: 'Filling out the Business Model Canvas and designing monetization strategies.' },
      { id: 3, weeks: 'Weeks 9-12', title: 'MVP Development', description: 'Strategies for building a Minimum Viable Product with limited resources.' },
      { id: 4, weeks: 'Weeks 13-16', title: 'Fundraising & Pitch', description: 'Business presentation techniques and negotiation with potential investors.' }
    ],
    composition: [
      { type: 'Pitch Deck', percentage: 50 },
      { type: 'Validation', percentage: 30 },
      { type: 'Theory', percentage: 20 }
    ],
    stats: { theory: 60, project: 40, exam: 0 },
    prerequisites: ['None'],
  }
];

// --- MATH HELPER ---
const getCoordinatesForPercent = (percent: number) => {
  const x = Math.cos(2 * Math.PI * percent);
  const y = Math.sin(2 * Math.PI * percent);
  return [x, y];
};

export default function ElectiveResultPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // NEW STATE: Untuk menghandle animasi loading
  const [isRegenerating, setIsRegenerating] = useState(false);
  
  const selectedCourse = electiveCourses.find(r => r.id === selectedId);

  useEffect(() => {
    if (selectedId) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedId]);

  // NEW FUNCTION: Handle Regenerate
  const handleRegenerate = () => {
    if (isRegenerating) return;
    setIsRegenerating(true);
    
    // Simulasi delay fetch data (1.5 detik)
    setTimeout(() => {
        setIsRegenerating(false);
        // Reset pilihan jika ada
        setSelectedId(null); 
    }, 1500);
  };

  // --- CHART LOGIC ---
  const chartData = electiveCourses.reduce((acc, slice) => {
    const total = electiveCourses.reduce((sum, item) => sum + item.percentage, 0);
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
                        <Brain className="w-6 h-6" strokeWidth={3} />
                    </button>
                )}
               
                <h1 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter">
                    Result<span className="text-[#FF6B6B]">.</span>
                </h1>
            </motion.div>
            
            <div className="hidden md:block px-4 py-2 bg-[#FF90E8] border-4 border-black font-black uppercase shadow-[4px_4px_0_black] transform rotate-2">
                Course
            </div>
      </div>

      {/* --- CHART AREA --- */}
      <motion.div 
        className="w-full flex flex-col items-center justify-center relative z-10"
        animate={{ 
            height: selectedId ? '250px' : '65vh', 
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
                    // Posisi: Pojok kanan atas dari area chart container
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

           <motion.div
             className="relative aspect-square"
             animate={{ 
                width: selectedId ? '160px' : 'min(90vw, 400px)',
                opacity: isRegenerating ? 0.5 : 1, // Redup saat regenerasi
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
                             Tap Suggested Course 👆
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
                        Analyzing Transcript...
                    </span>
                </motion.div>
            )}
           </AnimatePresence>
      </motion.div>

      {/* --- CONTENT AREA (Bento Grid) --- */}
      <AnimatePresence mode="wait">
        {selectedCourse && (
            <motion.div
                key={selectedCourse.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full max-w-6xl mx-auto px-4 sm:px-6"
            >
                {/* 1. IDENTITY HEADER */}
                <div className="mb-8 flex flex-col md:flex-row items-start md:items-end gap-6 border-b-4 border-black pb-8">
                    <div className="flex-1">
                        <div className="flex flex-wrap gap-2 mb-3">
                            <span className="px-3 py-1 bg-black text-white text-xs font-bold uppercase tracking-wider">
                                {selectedCourse.code}
                            </span>
                            {selectedCourse.tags.map((tag) => (
                                <span key={tag} className="px-3 py-1 bg-white border-2 border-black text-xs font-bold uppercase">
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black uppercase leading-[0.9] mb-4">
                            {selectedCourse.title}
                        </h2>
                        <p className="text-lg font-bold leading-relaxed text-gray-700 max-w-2xl">
                            {selectedCourse.description}
                        </p>
                    </div>
                    
                    {/* Credits Box (Replaces Price) */}
                    <div className="bg-[#4DE1C1] border-4 border-black p-5 shadow-[8px_8px_0_black] shrink-0 w-full md:w-auto text-center md:text-right transform rotate-1">
                        <div className="text-xs font-black uppercase mb-1">Course Weight</div>
                        <div className="font-mono font-black text-5xl mb-1">{selectedCourse.credits}</div>
                        <div className="text-sm font-black uppercase">Credits / SKS</div>
                    </div>
                </div>

                {/* 2. BENTO GRID LAYOUT */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-20">
                    
                    {/* COL 1: SPECS (Span 4) */}
                    <div className="md:col-span-4 space-y-6">
                        
                         {/* Assessment Stats */}
                         <div className="bg-[#F3F4F6] border-4 border-black p-5 shadow-[6px_6px_0_black]">
                             <h3 className="font-black uppercase text-lg mb-4 flex items-center gap-2">
                                <BarChart className="w-5 h-5" /> Assessment
                             </h3>
                             <div className="space-y-4">
                                {Object.entries(selectedCourse.stats).map(([key, value]) => (
                                    <div key={key}>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-xs font-bold uppercase">{key}</span>
                                            <span className="text-xs font-black">{value}%</span>
                                        </div>
                                        <div className="h-3 bg-white border-2 border-black rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${value}%` }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.8 }}
                                                className="h-full bg-black"
                                            />
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>

                        {/* Prerequisites */}
                        <div className="bg-[#FF90E8] border-4 border-black p-5 shadow-[6px_6px_0_black]">
                             <h3 className="font-black uppercase text-lg mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5" /> Prerequisites
                             </h3>
                             <div className="bg-white border-2 border-black p-3">
                                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Must Have Passed:</p>
                                <ul className="space-y-2">
                                    {selectedCourse.prerequisites.map((req, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm font-black">
                                            <div className="w-2 h-2 bg-black rounded-full" /> {req}
                                        </li>
                                    ))}
                                </ul>
                             </div>
                        </div>

                    </div>

                    {/* COL 2: CLO / SYLLABUS (Span 5) */}
                    <div className="md:col-span-5 space-y-6">
                         
                        {/* Course Learning Outcomes */}
                        <div className="bg-white border-4 border-black p-5 shadow-[6px_6px_0_black]">
                            <h3 className="font-black uppercase text-lg mb-4 flex items-center gap-2 border-b-4 border-black pb-2 w-full">
                                <Target className="w-5 h-5" /> Learning Outcomes (CLO)
                            </h3>
                            <div className="space-y-4">
                                {selectedCourse.clos.map((clo, idx) => (
                                    <div key={idx} className="relative pl-6 border-l-4 border-black/10 hover:border-black transition-colors group">
                                        <div className="absolute -left-1.5 top-0 w-3 h-3 bg-black rounded-full" />
                                        
                                        <div className="inline-block bg-[#FFD93D] px-2 py-0.5 border border-black text-[10px] font-black uppercase mb-1">
                                            {clo.weeks}
                                        </div>
                                        
                                        <h4 className="font-black text-sm uppercase mb-1 group-hover:underline decoration-2 underline-offset-2">
                                            CLO {clo.id}: {clo.title}
                                        </h4>
                                        <p className="text-xs font-bold text-gray-600 leading-relaxed">
                                            {clo.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* COL 3: SKILLS & EXTRAS (Span 3) */}
                    <div className="md:col-span-3 space-y-6">
                        
                         {/* Learning Method */}
                         <div className="bg-white border-4 border-black p-4 shadow-[6px_6px_0_black]">
                            <h3 className="font-black uppercase text-sm mb-3 border-b-2 border-black pb-2 bg-black text-white inline-block px-1">
                                Method
                            </h3>
                            <div className="flex flex-col gap-2">
                                {selectedCourse.composition.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 border border-black">
                                        <span className="text-xs font-bold uppercase">{item.type}</span>
                                        <span className="text-xs font-black">{item.percentage}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Skills Gained */}
                        <div className="bg-white border-4 border-black p-4 shadow-[6px_6px_0_black]">
                             <h3 className="font-black uppercase text-sm mb-3 border-b-2 border-black pb-2">
                                Competencies
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {selectedCourse.skills.map((skill) => (
                                    <span key={skill} className="bg-[#E0E7FF] border-2 border-black px-2 py-1 text-[10px] font-bold uppercase">
                                        {skill}
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