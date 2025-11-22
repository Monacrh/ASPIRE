'use client'

import React from 'react';
import { BookOpen, UserCheck, Users } from 'lucide-react';
import Footer from './components/footer';
import { useRouter } from "next/navigation";
import Image from 'next/image';

export default function EduixLanding() {
  
  const router = useRouter();

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
              onClick={() => router.push("/auth")}
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
      <div className="max-w-7xl mx-auto px-6 -pt-1 pb-1">
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
              onClick={() => router.push("/auth")}
            >
              Get Started
            </button>
          </div>
          
          {/* Illustration */}
          <div className="relative flex justify-center items-center">
            <div className="relative">
              {/* Person illustration - simplified */}
              <Image 
                src="/image/hero.png"
                alt="Hero Illustration"
                width={300}
                height={300}
                className="rounded-lg"
              />
              
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