'use client'

import React from 'react';
import { BookOpen, UserCheck, Users } from 'lucide-react';
import Footer from './components/footer';

export default function EduixLanding() {
  return (
    <>
    <div className="min-h-screen bg-[#FFF8DC]">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-[#FFF8DC]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-semibold text-gray-800">Aspire</div>
            
            {/* Menu di tengah */}
            <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-700 hover:text-gray-900">Home</a>
              <span className="h-6 w-px bg-gray-300"></span>
              <a href="#" className="text-gray-700 hover:text-gray-900">About Site</a>
            </div>
            
            {/* Button tetap di kanan */}
            <button 
              className="px-6 py-2 border-2 border-gray-800 rounded text-gray-800 font-semibold transition-all duration-150"
              style={{
                boxShadow: '4px 4px 0 rgba(0,0,0,1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translate(2px, 2px)';
                e.currentTarget.style.boxShadow = '2px 2px 0 rgba(0,0,0,1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translate(0, 0)';
                e.currentTarget.style.boxShadow = '4px 4px 0 rgba(0,0,0,1)';
              }}
            >
              Sign up Free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-light text-gray-800 mb-2">
              Find your interest
            </h1>
            <h1 className="text-4xl md:text-5xl font-light text-gray-800 mb-6">
              The rest will fall into place
            </h1>
            <p className="text-gray-600 mb-8">30k+ Students Trust us</p>
            <button 
              className="px-8 py-3 border-2 border-gray-800 rounded text-gray-800 font-semibold transition-all duration-150"
              style={{
                boxShadow: '6px 6px 0 rgba(0,0,0,1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translate(3px, 3px)';
                e.currentTarget.style.boxShadow = '3px 3px 0 rgba(0,0,0,1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translate(0, 0)';
                e.currentTarget.style.boxShadow = '6px 6px 0 rgba(0,0,0,1)';
              }}
            >
              Get Started
            </button>
          </div>
          
          {/* Illustration */}
          <div className="relative flex justify-center items-center">
            <div className="relative">
              {/* Person illustration - simplified */}
              <div className="relative">
                <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Head */}
                  <circle cx="180" cy="100" r="40" fill="none" stroke="#000" strokeWidth="2"/>
                  {/* Hair */}
                  <path d="M140 80 Q140 50 160 50 Q180 50 190 60 Q200 50 210 60 Q215 70 210 90" fill="#000"/>
                  {/* Glasses */}
                  <circle cx="170" cy="100" r="8" fill="none" stroke="#000" strokeWidth="2"/>
                  <circle cx="190" cy="100" r="8" fill="none" stroke="#000" strokeWidth="2"/>
                  <line x1="178" y1="100" x2="182" y2="100" stroke="#000" strokeWidth="2"/>
                  {/* Smile */}
                  <path d="M170 110 Q180 115 190 110" fill="none" stroke="#000" strokeWidth="2"/>
                  {/* Body */}
                  <ellipse cx="180" cy="180" rx="50" ry="60" fill="none" stroke="#000" strokeWidth="2"/>
                  {/* Arms */}
                  <path d="M130 160 Q120 180 130 200" fill="none" stroke="#000" strokeWidth="2"/>
                  <path d="M230 160 Q240 180 230 200" fill="none" stroke="#000" strokeWidth="2"/>
                  {/* Tablet in hand */}
                  <rect x="90" y="180" width="60" height="45" rx="3" fill="none" stroke="#000" strokeWidth="2"/>
                  <rect x="95" y="185" width="50" height="30" fill="none" stroke="#000" strokeWidth="1"/>
                  <circle cx="120" cy="220" r="2" fill="#000"/>
                </svg>
                
                {/* Icons around person */}
                <div className="absolute -top-4 -left-8 bg-white p-3 rounded-lg shadow-md border border-gray-200">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                  </svg>
                </div>
                
                <div className="absolute top-8 -left-12 bg-white p-3 rounded-lg shadow-md border border-gray-200">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2">
                    <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                  </svg>
                </div>
                
                <div className="absolute top-16 left-4 bg-white p-3 rounded-lg shadow-md border border-gray-200">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2">
                    <rect x="3" y="5" width="18" height="14" rx="2"/>
                    <path d="M3 10h18"/>
                    <path d="M7 15h.01"/>
                    <path d="M11 15h2"/>
                  </svg>
                </div>
              </div>
              
              {/* Decorative line */}
              <div className="absolute -right-8 top-32">
                <svg width="50" height="50" viewBox="0 0 50 50">
                  <path d="M5 25 Q15 5 25 25 T45 25" fill="none" stroke="#000" strokeWidth="2"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div 
            className="bg-white border-4 border-gray-800 rounded-lg p-8 transition-all duration-150 hover:translate-x-1 hover:translate-y-1"
            style={{
              boxShadow: '8px 8px 0 rgba(0,0,0,1)',
            }}
          >
            <BookOpen className="w-10 h-10 mb-4 text-gray-800" strokeWidth={2}/>
            <h3 className="text-4xl font-bold text-gray-800 mb-2">1200+</h3>
            <p className="text-lg font-semibold text-gray-800 mb-4">Online Courses</p>
            <p className="text-sm text-gray-600">It is a long established fact that a reader will be distracted.</p>
          </div>

          {/* Card 2 */}
          <div 
            className="bg-white border-4 border-gray-800 rounded-lg p-8 transition-all duration-150 hover:translate-x-1 hover:translate-y-1"
            style={{
              boxShadow: '8px 8px 0 rgba(0,0,0,1)',
            }}
          >
            <UserCheck className="w-10 h-10 mb-4 text-gray-800" strokeWidth={2}/>
            <h3 className="text-4xl font-bold text-gray-800 mb-2">200</h3>
            <p className="text-lg font-semibold text-gray-800 mb-4">Certified Teacher</p>
            <p className="text-sm text-gray-600">It is a long established fact that a reader will be distracted.</p>
          </div>

          {/* Card 3 */}
          <div 
            className="bg-white border-4 border-gray-800 rounded-lg p-8 transition-all duration-150 hover:translate-x-1 hover:translate-y-1"
            style={{
              boxShadow: '8px 8px 0 rgba(0,0,0,1)',
            }}
          >
            <Users className="w-10 h-10 mb-4 text-gray-800" strokeWidth={2}/>
            <h3 className="text-4xl font-bold text-gray-800 mb-2">30K+</h3>
            <p className="text-lg font-semibold text-gray-800 mb-4">Students</p>
            <p className="text-sm text-gray-600">It is a long established fact that a reader will be distracted.</p>
          </div>
        </div>
      </div>
    </div>

    <Footer />
    </>
  );
}