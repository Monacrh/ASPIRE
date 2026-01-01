'use client'

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteModal({ isOpen, onClose, onConfirm }: DeleteModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, rotate: -5 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.9, opacity: 0, rotate: 5 }}
            className="bg-white border-4 border-black p-6 max-w-sm w-full shadow-[8px_8px_0_black] relative"
          >
            {/* Ikon Peringatan */}
            <div className="absolute -top-6 -left-6 bg-[#FF6B6B] border-4 border-black p-3 shadow-[4px_4px_0_black] rotate-[-10deg]">
              <AlertTriangle className="w-8 h-8 text-white" strokeWidth={3} />
            </div>

            <h2 className="text-2xl font-black uppercase mb-2 mt-2">Delete History?</h2>
            <p className="font-medium text-gray-600 mb-6 text-sm border-l-4 border-black pl-3">
              This action is permanent and cannot be undone. Are you sure?
            </p>

            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 py-3 font-bold border-2 border-black bg-white hover:bg-gray-100 shadow-[4px_4px_0_black] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-[2px_2px_0_black] transition-all active:shadow-none active:translate-y-1 active:translate-x-1"
              >
                CANCEL
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-3 font-bold border-2 border-black bg-[#FF6B6B] text-white shadow-[4px_4px_0_black] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-[2px_2px_0_black] transition-all active:shadow-none active:translate-y-1 active:translate-x-1"
              >
                YES, DELETE
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}