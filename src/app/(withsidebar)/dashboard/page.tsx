'use client'

import React, { useState } from 'react';
import { Upload, FileText, BookOpen, Briefcase, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedType, setSelectedType] = useState<'course' | 'career' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);


  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleSubmit = async () => {
    if (!selectedFile || !selectedType) return;

    setIsUploading(true);

    try {
      // 1. Buat FormData
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', selectedType);

      // 2. Panggil API POST
      const res = await fetch('/api/transcripts', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      console.log('Upload success, ID:', data.id);
      
      // 3. Redirect ke halaman result yang sesuai
      // Kita bisa mengirim ID transcript lewat URL query param jika perlu
      router.push(`/result/${selectedType}?id=${data.id}`);

    } catch (error) {
      console.error('Error submitting:', error);
      alert('Gagal mengupload transcript. Silakan coba lagi.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8DC] p-6 flex items-center justify-center">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-black text-gray-800 mb-2 uppercase">
            Get Your Recommendations
          </h1>
          <p className="text-gray-600 text-sm">
            Upload your transcript and choose recommendation type
          </p>
        </motion.div>

        {/* Main Grid Layout */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          
          {/* LEFT: Upload Container */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="mb-3">
              <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                <motion.span 
                  className="w-6 h-6 bg-gray-800 text-white flex items-center justify-center text-xs"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", delay: 0.3 }}
                >
                  1
                </motion.span>
                Upload Transcript
              </h2>
            </div>

            <motion.div
              className={`border-4 border-gray-800 bg-white p-6 h-[400px] flex flex-col justify-center transition-colors duration-150 ${
                isDragging ? 'bg-gray-50' : ''
              }`}
              style={{
                boxShadow: '6px 6px 0 rgba(0,0,0,1)',
              }}
              whileHover={{ scale: 1.01 }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <AnimatePresence mode="wait">
                {!selectedFile ? (
                  <motion.div 
                    key="empty"
                    className="text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div 
                      className="w-16 h-16 bg-[#FFD93D] border-4 border-gray-800 flex items-center justify-center mx-auto mb-4"
                      style={{ boxShadow: '3px 3px 0 rgba(0,0,0,1)' }}
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Upload className="w-8 h-8 text-gray-800" strokeWidth={2.5} />
                    </motion.div>
                    
                    <h3 className="text-lg font-bold text-gray-800 mb-1">
                      Drop your file here
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      or click to browse
                    </p>
                    <p className="text-gray-500 text-xs mb-6">
                      PDF, JPG, PNG (Max 10MB)
                    </p>

                    <label htmlFor="file-upload">
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept=".pdf"
                        onChange={handleFileSelect}
                      />
                      <motion.span
                        className="inline-block px-6 py-2 font-bold text-gray-800 text-sm cursor-pointer"
                        style={{
                          backgroundColor: '#FFD93D',
                          border: '3px solid #000',
                          boxShadow: '4px 4px 0 rgba(0,0,0,1)',
                        }}
                        whileHover={{ 
                          x: 2, 
                          y: 2,
                          boxShadow: '2px 2px 0 rgba(0,0,0,1)'
                        }}
                        whileTap={{ 
                          x: 4, 
                          y: 4,
                          boxShadow: '0px 0px 0 rgba(0,0,0,1)'
                        }}
                      >
                        BROWSE FILES
                      </motion.span>
                    </label>
                  </motion.div>
                ) : (
                  <motion.div
                    key="uploaded"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <motion.div 
                      className="flex items-center justify-between p-3 border-2 border-gray-800 bg-gray-50 mb-4"
                      initial={{ x: -100 }}
                      animate={{ x: 0 }}
                      transition={{ type: "spring" }}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 bg-[#FFD93D] border-2 border-gray-800 flex items-center justify-center"
                          style={{ boxShadow: '2px 2px 0 rgba(0,0,0,1)' }}
                        >
                          <FileText className="w-5 h-5 text-gray-800" strokeWidth={2.5} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{selectedFile.name}</p>
                          <p className="text-xs text-gray-600">
                            {(selectedFile.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      
                      <motion.button
                        onClick={handleRemoveFile}
                        className="p-2 border-2 border-gray-800 bg-white"
                        style={{
                          boxShadow: '2px 2px 0 rgba(0,0,0,1)',
                        }}
                        whileHover={{ 
                          x: 1, 
                          y: 1,
                          boxShadow: '1px 1px 0 rgba(0,0,0,1)'
                        }}
                      >
                        <X className="w-4 h-4 text-gray-800" strokeWidth={2.5} />
                      </motion.button>
                    </motion.div>

                    <motion.div 
                      className="text-center pt-8"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <motion.div 
                        className="w-16 h-16 bg-green-400 border-4 border-gray-800 flex items-center justify-center mx-auto mb-4"
                        style={{ boxShadow: '3px 3px 0 rgba(0,0,0,1)' }}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring" }}
                      >
                        <Check className="w-8 h-8 text-gray-800" strokeWidth={3} />
                      </motion.div>
                      <p className="font-bold text-gray-800 text-lg">File Uploaded!</p>
                      <p className="text-gray-600 text-sm">Ready to get recommendations</p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* RIGHT: Selection Container */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="mb-3">
              <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                <motion.span 
                  className="w-6 h-6 bg-gray-800 text-white flex items-center justify-center text-xs"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", delay: 0.5 }}
                >
                  2
                </motion.span>
                Choose Type
              </h2>
            </div>

            <div className="space-y-4">
              {/* Course Card */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                onClick={() => setSelectedType('course')}
                className={`w-full p-5 border-4 border-gray-800 bg-white text-left ${
                  selectedType === 'course' ? 'bg-[#FFD93D]' : ''
                }`}
                style={{
                  boxShadow: '6px 6px 0 rgba(0,0,0,1)',
                }}
                whileHover={{ 
                  x: 2, 
                  y: 2,
                  boxShadow: '4px 4px 0 rgba(0,0,0,1)'
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-4">
                  <motion.div 
                    className="w-12 h-12 bg-gray-800 border-2 border-gray-800 flex items-center justify-center shrink-0"
                    style={{ boxShadow: '3px 3px 0 rgba(0,0,0,0.3)' }}
                    whileHover={{ rotate: 5 }}
                  >
                    <BookOpen className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </motion.div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-1 uppercase">
                      Course
                    </h3>
                    <p className="text-gray-600 text-xs leading-relaxed">
                      Get personalized course recommendations
                    </p>
                  </div>

                  <AnimatePresence>
                    {selectedType === 'course' && (
                      <motion.div 
                        className="w-6 h-6 bg-gray-800 border-2 border-gray-800 flex items-center justify-center shrink-0"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ type: "spring" }}
                      >
                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>

              {/* Career Card */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                onClick={() => setSelectedType('career')}
                className={`w-full p-5 border-4 border-gray-800 bg-white text-left ${
                  selectedType === 'career' ? 'bg-[#FFD93D]' : ''
                }`}
                style={{
                  boxShadow: '6px 6px 0 rgba(0,0,0,1)',
                }}
                whileHover={{ 
                  x: 2, 
                  y: 2,
                  boxShadow: '4px 4px 0 rgba(0,0,0,1)'
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-4">
                  <motion.div 
                    className="w-12 h-12 bg-gray-800 border-2 border-gray-800 flex items-center justify-center shrink-0"
                    style={{ boxShadow: '3px 3px 0 rgba(0,0,0,0.3)' }}
                    whileHover={{ rotate: 5 }}
                  >
                    <Briefcase className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </motion.div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-1 uppercase">
                      Career
                    </h3>
                    <p className="text-gray-600 text-xs leading-relaxed">
                      Discover ideal career paths for you
                    </p>
                  </div>

                  <AnimatePresence>
                    {selectedType === 'career' && (
                      <motion.div 
                        className="w-6 h-6 bg-gray-800 border-2 border-gray-800 flex items-center justify-center shrink-0"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ type: "spring" }}
                      >
                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>

              {/* Submit Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{
                    opacity: !selectedFile || !selectedType ? 0.5 : 1,
                    y: 0,
                    boxShadow: !selectedFile || !selectedType
                    ? "4px 4px 0 rgba(0,0,0,0.3)"
                    : "5px 5px 0 rgba(0,0,0,1)",
                }}
                transition={{ duration: 0.2 }}
                onClick={handleSubmit}
                disabled={!selectedFile || !selectedType || isUploading}
                className={`w-full py-3 font-bold text-gray-800 text-sm mt-6 ${
                    !selectedFile || !selectedType || isUploading ? "cursor-not-allowed" : ""
                }`}
                style={{
                    backgroundColor: "#FFD93D",
                    border: "3px solid #000",
                }}
                whileHover={
                    selectedFile && selectedType
                    ? {
                        x: 2,
                        y: 2,
                        boxShadow: "3px 3px 0 rgba(0,0,0,1)",
                        }
                    : {}
                }
                whileTap={
                    selectedFile && selectedType
                    ? {
                        x: 4,
                        y: 4,
                        boxShadow: "1px 1px 0 rgba(0,0,0,1)",
                        }
                    : {}
                }
                >
                GET RECOMMENDATIONS
            </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}