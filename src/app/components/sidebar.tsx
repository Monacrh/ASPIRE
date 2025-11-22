'use client'

import React, { useState } from 'react';
import { Menu, X, Plus, Clock, User, ChevronDown, Briefcase, BookOpen } from 'lucide-react';
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants } from 'framer-motion';

export default function RetroSidebar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  
  const [courseHistory] = useState([
    { id: 1, title: 'Introduction to React', date: '2h ago', type: 'course' },
    { id: 2, title: 'CSS Grid Layout', date: '1d ago', type: 'course' },
  ]);

  const [careerHistory] = useState([
    { id: 4, title: 'Frontend Path', date: '1w ago', type: 'career' },
    { id: 5, title: 'UI/UX Guide', date: '2w ago', type: 'career' },
  ]);

  const userAccount = {
    name: 'John Doe',
    email: 'john@aspire.com',
    avatar: 'JD'
  };

  const colors = {
    yellow: '#FFD93D',
    cyan: '#4DE1C1',
    pink: '#FF90E8',
    white: '#FFFFFF',
    dark: '#1a1a1a'
  };

  // --- ANIMATION VARIANTS (FIXED) ---
  
  // PERBAIKAN 2: Tambahkan ': Variants' di sini
  const sidebarVariants: Variants = {
    open: { 
      width: '20rem', 
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    closed: { 
      width: '6rem', 
      transition: { type: "spring", stiffness: 300, damping: 30 }
    }
  };

  // PERBAIKAN 3: Tambahkan ': Variants' di sini
  const containerVariants: Variants = {
    open: {
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    },
    closed: {
      transition: { staggerChildren: 0.05, staggerDirection: -1 }
    }
  };

  // PERBAIKAN 4: Tambahkan ': Variants' di sini
  const itemVariants: Variants = {
    open: { 
      opacity: 1, 
      x: 0, 
      display: 'block',
      transition: { type: "spring", stiffness: 300, damping: 24 }
    },
    closed: { 
      opacity: 0, 
      x: -20, 
      transitionEnd: { display: 'none' } 
    }
  };

  // PERBAIKAN 5: Tambahkan ': Variants' di sini
  const buttonClick: Variants = {
    rest: { x: 0, y: 0, boxShadow: '4px 4px 0px rgba(0,0,0,1)' },
    hover: { x: 2, y: 2, boxShadow: '2px 2px 0px rgba(0,0,0,1)' },
    tap: { x: 4, y: 4, boxShadow: '0px 0px 0px rgba(0,0,0,1)' }
  };

  return (
    <div className="flex h-screen bg-[#F3F4F6] font-sans overflow-hidden">
      
      <motion.aside
        initial={false}
        animate={isOpen ? "open" : "closed"}
        variants={sidebarVariants}
        className="bg-white border-r-4 border-black flex flex-col relative z-10"
        style={{ boxShadow: '6px 0 0 rgba(0,0,0,0.1)' }}
      >
        
        {/* --- HEADER --- */}
        <div className="p-5 border-b-4 border-black bg-white flex items-center justify-between h-24 overflow-hidden">
          <button 
            onClick={() => router.push("/dashboard")}
            className="flex items-center"  // supaya tidak merusak layout
          >
            <AnimatePresence mode="wait">
              {isOpen && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, transition: { duration: 0.1 } }}
                  className="flex items-center gap-3 whitespace-nowrap cursor-pointer"
                >
                  <div className="w-10 h-10 bg-black flex items-center justify-center transform -rotate-3 shadow-[3px_3px_0_#FF90E8]">
                    <span className="text-white font-black text-xl">A</span>
                  </div>
                  <h1 className="text-2xl font-black tracking-tighter text-black uppercase italic">
                    Aspire<span className="text-[#FF90E8]">.</span>
                  </h1>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
          {/* Toggle Button */}
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            variants={buttonClick}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            className={`p-2 border-2 border-black bg-[${colors.cyan}] ${!isOpen && 'mx-auto'}`}
            style={{ backgroundColor: colors.cyan }}
          >
            {isOpen ? <X className="w-6 h-6 text-black" strokeWidth={3} /> : <Menu className="w-6 h-6 text-black" strokeWidth={3} />}
          </motion.button>
        </div>

        {/* --- ACTION BUTTON --- */}
        <div className="p-5 border-b-4 border-black bg-[#fafafa] min-h-[100px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.button
                onClick={() => router.push("/dashboard")}
                key="full-btn"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.1 } }}
                variants={buttonClick}
                whileHover="hover"
                whileTap="tap"
                className="w-full py-4 px-4 font-black text-black border-2 border-black flex items-center justify-center gap-2 bg-[#FFD93D]"
              >
                <Plus className="w-6 h-6" strokeWidth={3} />
                <span className="text-sm uppercase tracking-wider">New Upload</span>
              </motion.button>
            ) : (
              <motion.button
                key="icon-btn"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.1 } }}
                variants={buttonClick}
                whileHover="hover"
                whileTap="tap"
                className="h-14 w-14 rounded-full font-black text-black border-2 border-black flex items-center justify-center bg-[#FFD93D]"
              >
                <Plus className="w-6 h-6" strokeWidth={3} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* --- SCROLLABLE CONTENT --- */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat">
          
          <motion.div 
            variants={containerVariants}
            initial="closed"
            animate={isOpen ? "open" : "closed"}
            className="p-5 space-y-8"
          >
            
            {/* Section: Courses */}
            <motion.div variants={itemVariants} className="space-y-3">
              <div className="flex items-center gap-2 mb-4 bg-black text-white p-1 w-max px-3 transform -rotate-1 shadow-[2px_2px_0px_rgba(77,225,193,1)]">
                <BookOpen className="w-4 h-4" />
                <h2 className="font-bold text-xs uppercase tracking-widest">Courses</h2>
              </div>

              {courseHistory.map((item) => (
                <motion.button
                  onClick={() => router.push("/result/course")}
                  key={item.id}
                  variants={buttonClick}
                  whileHover="hover"
                  whileTap="tap"
                  className="w-full text-left p-3 border-2 border-black bg-white group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-2 h-full bg-[#FF90E8] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-200 border-r-2 border-black"></div>
                  <div className="pl-1 group-hover:pl-3 transition-all duration-200">
                    <h3 className="font-bold text-black text-sm leading-tight mb-1">{item.title}</h3>
                    <div className="flex items-center gap-1 text-xs font-mono text-gray-600 bg-gray-100 w-max px-1 border border-black">
                      <Clock className="w-3 h-3" />
                      {item.date}
                    </div>
                  </div>
                </motion.button>
              ))}
            </motion.div>

            {/* Section: Career */}
            <motion.div variants={itemVariants} className="space-y-3">
              <div className="flex items-center gap-2 mb-4 bg-black text-white p-1 w-max px-3 transform rotate-1 shadow-[2px_2px_0px_#FFD93D]">
                <Briefcase className="w-4 h-4" />
                <h2 className="font-bold text-xs uppercase tracking-widest">Career</h2>
              </div>

              {careerHistory.map((item) => (
                <motion.button
                  onClick={() => router.push("/result/career")}
                  key={item.id}
                  variants={buttonClick}
                  whileHover="hover"
                  whileTap="tap"
                  className="w-full text-left p-3 border-2 border-black bg-white group relative"
                >
                  <div className="absolute top-0 left-0 w-2 h-full bg-[#4DE1C1] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-200 border-r-2 border-black"></div>
                  <div className="pl-1 group-hover:pl-3 transition-all duration-200">
                    <h3 className="font-bold text-black text-sm leading-tight mb-1">{item.title}</h3>
                    <p className="text-xs font-mono text-gray-500">{item.date}</p>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          </motion.div>

          {/* Collapsed Icons View */}
          {!isOpen && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute top-[200px] left-0 w-full flex flex-col items-center space-y-4 pointer-events-none"
            >
                {/* Ambil 1 course dan 1 career secara seimbang */}
                {[courseHistory[0], careerHistory[0]].filter(Boolean).map((item, idx) => (
                <motion.div
                    key={idx}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: idx * 0.1, type: "spring" }}
                    className="pointer-events-auto"
                >
                    <div className="w-10 h-10 border-2 border-black flex items-center justify-center bg-white shadow-[3px_3px_0_black]">
                    {item.type === 'course' ? <BookOpen className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
                    </div>
                </motion.div>
                ))}
            </motion.div>
            )}
        </div>

        {/* --- USER ID CARD --- */}
        <div className="border-t-4 border-black p-4 bg-[#FF90E8] overflow-hidden">
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.button 
                key="full-user"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                variants={buttonClick}
                whileHover="hover"
                whileTap="tap"
                className="w-full p-3 border-2 border-black bg-white flex items-center gap-3 relative z-10"
              >
                <div className="w-10 h-10 bg-black flex items-center justify-center border border-black shrink-0">
                  <span className="text-white font-bold font-mono">{userAccount.avatar}</span>
                </div>
                <div className="flex-1 text-left overflow-hidden whitespace-nowrap">
                  <p className="font-black text-black text-sm truncate uppercase">{userAccount.name}</p>
                  <p className="text-xs font-mono text-gray-600 truncate">{userAccount.email}</p>
                </div>
                <ChevronDown className="w-5 h-5 text-black shrink-0" strokeWidth={3} />
              </motion.button>
            ) : (
              <motion.button 
                key="icon-user"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-12 h-12 bg-black border-2 border-white flex items-center justify-center mx-auto shadow-lg"
              >
                <User className="w-6 h-6 text-white" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>
    </div>
  );
}