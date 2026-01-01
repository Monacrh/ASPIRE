'use client'

import React, { useState } from 'react';
import { Menu, X, Plus, Clock, User, ChevronDown, Briefcase, BookOpen, LogOut, Trash2 } from 'lucide-react';
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Transcript } from '@/src/types/transcript';
import useSWR, { useSWRConfig } from 'swr';
import DeleteModal from './delete-modal';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function RetroSidebar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // State Modal
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  });

  const { mutate } = useSWRConfig(); 
  const { data: apiResponse, isLoading } = useSWR('/api/transcripts', fetcher);

  const transcripts = apiResponse?.data || [];
  const courses = transcripts.filter((t: Transcript) => t.recommendationType === 'course');
  const careers = transcripts.filter((t: Transcript) => t.recommendationType === 'career');

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
      router.push('/auth');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const triggerDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    const idToDelete = deleteModal.id;
    if (!idToDelete) return;

    // Tutup modal & set loading pada item sidebar
    setDeleteModal({ isOpen: false, id: null });
    setIsDeleting(idToDelete);

    try {
      const res = await fetch(`/api/transcripts/${idToDelete}`, { method: 'DELETE' });
      if (res.ok) {
        mutate('/api/transcripts');
        router.push('/dashboard');
      } else {
        alert("Failed to delete");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(null);
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, id: null });
  };

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleNavigate = (type: 'course' | 'career', id: string) => {
    router.push(`/result/${type}?id=${id}`);
  };

  // Variants
  const sidebarVariants: Variants = {
    open: { width: '20rem', transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: { width: '6rem', transition: { type: "spring", stiffness: 300, damping: 30 } }
  };

  const containerVariants: Variants = {
    open: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
    closed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } }
  };

  const itemVariants: Variants = {
    open: { opacity: 1, x: 0, display: 'block', transition: { type: "spring", stiffness: 300, damping: 24 } },
    closed: { opacity: 0, x: -20, transitionEnd: { display: 'none' } }
  };

  const buttonClick: Variants = {
    rest: { x: 0, y: 0, boxShadow: '4px 4px 0px rgba(0,0,0,1)' },
    hover: { x: 2, y: 2, boxShadow: '2px 2px 0px rgba(0,0,0,1)' },
    tap: { x: 4, y: 4, boxShadow: '0px 0px 0px rgba(0,0,0,1)' }
  };

  return (
    <>
      {/* --- GUNAKAN KOMPONEN BARU DI SINI --- */}
      <DeleteModal 
        isOpen={deleteModal.isOpen} 
        onClose={cancelDelete} 
        onConfirm={confirmDelete} 
      />

      <div className="flex h-screen bg-[#F3F4F6] font-sans overflow-hidden">
        <motion.aside
          initial={false}
          animate={isOpen ? "open" : "closed"}
          variants={sidebarVariants}
          className="bg-white border-r-4 border-black flex flex-col relative z-50"
          style={{ boxShadow: '6px 0 0 rgba(0,0,0,0.1)' }}
        >
          {/* Header */}
          <div className="p-5 border-b-4 border-black bg-white flex items-center justify-between h-24 overflow-hidden shrink-0">
            <button onClick={() => router.push("/dashboard")} className="flex items-center">
              <AnimatePresence mode="wait">
                {isOpen && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
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
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              variants={buttonClick}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              className="p-2 border-2 border-black bg-[#4DE1C1]"
            >
              {isOpen ? <X className="w-6 h-6 text-black" strokeWidth={3} /> : <Menu className="w-6 h-6 text-black" strokeWidth={3} />}
            </motion.button>
          </div>

          {/* New Upload Button */}
          <div className="p-5 border-b-4 border-black bg-[#fafafa] min-h-[100px] flex items-center justify-center shrink-0">
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.button
                  onClick={() => router.push("/dashboard")}
                  key="full-btn"
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
                  onClick={() => router.push("/dashboard")}
                  key="icon-btn"
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

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat">
            <motion.div 
              variants={containerVariants}
              initial="closed"
              animate={isOpen ? "open" : "closed"}
              className="p-5 space-y-8"
            >
              {/* Courses */}
              {(courses.length > 0 || isLoading) && (
                <motion.div variants={itemVariants} className="space-y-3">
                  <div className="flex items-center gap-2 mb-4 bg-black text-white p-1 w-max px-3 transform -rotate-1 shadow-[2px_2px_0px_rgba(77,225,193,1)]">
                    <BookOpen className="w-4 h-4" />
                    <h2 className="font-bold text-xs uppercase tracking-widest">Courses</h2>
                  </div>

                  {isLoading ? (
                    <div className="text-xs text-gray-500 animate-pulse">Loading history...</div>
                  ) : (
                    courses.map((item: Transcript) => (
                      <motion.div
                        key={item._id?.toString()}
                        variants={buttonClick}
                        whileHover="hover"
                        whileTap="tap"
                        className="w-full text-left p-3 border-2 border-black bg-white group relative overflow-hidden cursor-pointer"
                        onClick={() => handleNavigate('course', item._id!.toString())}
                      >
                        <div className="absolute top-0 left-0 w-2 h-full bg-[#FF90E8] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-200 border-r-2 border-black"></div>
                        <div className="pl-1 group-hover:pl-3 transition-all duration-200 pr-6">
                          <h3 className="font-bold text-black text-sm leading-tight mb-1 truncate">{item.fileName}</h3>
                          <div className="flex items-center gap-1 text-xs font-mono text-gray-600 bg-gray-100 w-max px-1 border border-black">
                            <Clock className="w-3 h-3" />
                            {formatDate(item.createdAt)}
                          </div>
                        </div>
                        <button 
                          onClick={(e) => triggerDelete(e, item._id!.toString())}
                          disabled={isDeleting === item._id?.toString()}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-red-100 rounded-full transition-colors opacity-0 group-hover:opacity-100 z-10"
                        >
                          {isDeleting === item._id?.toString() ? (
                            <span className="w-4 h-4 block rounded-full border-2 border-gray-400 border-t-black animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 text-red-600" />
                          )}
                        </button>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}

              {/* Careers */}
              {(careers.length > 0 || isLoading) && (
                <motion.div variants={itemVariants} className="space-y-3">
                  <div className="flex items-center gap-2 mb-4 bg-black text-white p-1 w-max px-3 transform rotate-1 shadow-[2px_2px_0px_#FFD93D]">
                    <Briefcase className="w-4 h-4" />
                    <h2 className="font-bold text-xs uppercase tracking-widest">Career</h2>
                  </div>

                  {isLoading ? (
                    <div className="text-xs text-gray-500 animate-pulse">Loading history...</div>
                  ) : (
                    careers.map((item: Transcript) => (
                      <motion.div
                        key={item._id?.toString()}
                        variants={buttonClick}
                        whileHover="hover"
                        whileTap="tap"
                        className="w-full text-left p-3 border-2 border-black bg-white group relative cursor-pointer"
                        onClick={() => handleNavigate('career', item._id!.toString())}
                      >
                        <div className="absolute top-0 left-0 w-2 h-full bg-[#4DE1C1] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-200 border-r-2 border-black"></div>
                        <div className="pl-1 group-hover:pl-3 transition-all duration-200 pr-6">
                          <h3 className="font-bold text-black text-sm leading-tight mb-1 truncate">{item.fileName}</h3>
                          <p className="text-xs font-mono text-gray-500">{formatDate(item.createdAt)}</p>
                        </div>
                        <button 
                          onClick={(e) => triggerDelete(e, item._id!.toString())}
                          disabled={isDeleting === item._id?.toString()}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-red-100 rounded-full transition-colors opacity-0 group-hover:opacity-100 z-10"
                        >
                          {isDeleting === item._id?.toString() ? (
                            <span className="w-4 h-4 block rounded-full border-2 border-gray-400 border-t-black animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 text-red-600" />
                          )}
                        </button>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}
            </motion.div>

             {/* Collapsed Icons */}
             {!isOpen && (
               <div className="absolute top-[200px] left-0 w-full flex flex-col items-center space-y-4 pointer-events-none">
                   {courses.length > 0 && <div className="w-10 h-10 border-2 border-black flex items-center justify-center bg-white shadow-[3px_3px_0_black]"><BookOpen className="w-5 h-5"/></div>}
                   {careers.length > 0 && <div className="w-10 h-10 border-2 border-black flex items-center justify-center bg-white shadow-[3px_3px_0_black]"><Briefcase className="w-5 h-5"/></div>}
               </div>
            )}
          </div>

          {/* User Account */}
          <div className="border-t-4 border-black p-4 bg-[#FF90E8] overflow-visible relative shrink-0">
            <AnimatePresence>
              {showUserMenu && isOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full left-4 right-4 mb-2 bg-white border-4 border-black shadow-[4px_4px_0_black] z-50 overflow-hidden"
                >
                  <button 
                    onClick={handleLogout}
                    className="w-full p-3 flex items-center gap-3 hover:bg-gray-100 transition-colors text-red-600 font-bold uppercase text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.button 
                  key="full-user"
                  onClick={() => setShowUserMenu(!showUserMenu)} 
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -50, opacity: 0 }}
                  variants={buttonClick}
                  whileHover="hover"
                  whileTap="tap"
                  className="w-full p-3 border-2 border-black bg-white flex items-center gap-3 relative z-10"
                >
                  <div className="w-10 h-10 bg-black flex items-center justify-center border border-black shrink-0">
                    <span className="text-white font-bold font-mono">U</span>
                  </div>
                  <div className="flex-1 text-left overflow-hidden whitespace-nowrap">
                    <p className="font-black text-black text-sm truncate uppercase">My Account</p>
                    <p className="text-xs font-mono text-gray-600 truncate">Logged In</p>
                  </div>
                  <motion.div animate={{ rotate: showUserMenu ? 180 : 0 }}>
                      <ChevronDown className="w-5 h-5 text-black shrink-0" strokeWidth={3} />
                  </motion.div>
                </motion.button>
              ) : (
                <motion.button 
                  key="icon-user"
                  onClick={() => setIsOpen(true)}
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
    </>
  );
}