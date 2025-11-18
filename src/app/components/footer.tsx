// src/components/Footer.tsx
'use client'

import Link from 'next/link';
import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer 
      className="py-16"
      style={{
        backgroundColor: '#FFF8DC',
        borderTop: '4px solid #000',
      }}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Logo & Description */}
          <div className="md:col-span-1">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">
              Aspire
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Empowering learners worldwide with quality education. Learn anything, teach everything, grow together.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-gray-800 mb-6 text-lg">
              Quick Links
            </h4>
            <ul className="space-y-3 text-gray-600">
              <li>
                <Link
                  href="/"
                  className="hover:text-gray-900 transition duration-200 text-sm"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/courses"
                  className="hover:text-gray-900 transition duration-200 text-sm"
                >
                  Browse Courses
                </Link>
              </li>
              <li>
                <Link
                  href="/teachers"
                  className="hover:text-gray-900 transition duration-200 text-sm"
                >
                  Become a Teacher
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-gray-900 transition duration-200 text-sm"
                >
                  About Site
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h4 className="font-bold text-gray-800 mb-6 text-lg">
              Resources
            </h4>
            <ul className="space-y-3 text-gray-600">
              <li>
                <a 
                  href="#" 
                  className="hover:text-gray-900 transition duration-200 text-sm"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="hover:text-gray-900 transition duration-200 text-sm"
                >
                  Student Guide
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="hover:text-gray-900 transition duration-200 text-sm"
                >
                  Teaching Tips
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="hover:text-gray-900 transition duration-200 text-sm"
                >
                  Blog
                </a>
              </li>
            </ul>
          </div>
          
          {/* Connect & Newsletter */}
          <div>
            <h4 className="font-bold text-gray-800 mb-6 text-lg">
              Stay Connected
            </h4>
            
            {/* Social Icons */}
            <div className="flex space-x-3 mb-6">
              <a 
                href="#" 
                className="w-10 h-10 border-2 border-gray-800 bg-white flex items-center justify-center transition-all duration-150 hover:translate-x-1 hover:translate-y-1"
                style={{
                  boxShadow: '4px 4px 0 rgba(0,0,0,1)',
                }}
              >
                <span className="text-gray-800 font-bold text-sm">f</span>
              </a>
              
              <a 
                href="#" 
                className="w-10 h-10 border-2 border-gray-800 bg-white flex items-center justify-center transition-all duration-150 hover:translate-x-1 hover:translate-y-1"
                style={{
                  boxShadow: '4px 4px 0 rgba(0,0,0,1)',
                }}
              >
                <span className="text-gray-800 font-bold text-sm">𝕏</span>
              </a>
              
              <a 
                href="#" 
                className="w-10 h-10 border-2 border-gray-800 bg-white flex items-center justify-center transition-all duration-150 hover:translate-x-1 hover:translate-y-1"
                style={{
                  boxShadow: '4px 4px 0 rgba(0,0,0,1)',
                }}
              >
                <span className="text-gray-800 font-bold text-sm">in</span>
              </a>
            </div>
            
            {/* Newsletter */}
            <div>
              <h5 className="font-semibold text-gray-800 mb-3 text-sm">
                Newsletter
              </h5>
              <div className="flex flex-col gap-3">
                <input 
                  type="email" 
                  placeholder="your@email.com" 
                  className="px-4 py-2 focus:outline-none text-sm bg-white"
                  style={{
                    border: '2px solid #000',
                  }}
                />
                <button 
                  className="px-4 py-2 font-semibold transition-all duration-150 text-sm"
                  style={{
                    backgroundColor: '#000',
                    color: '#FFF8DC',
                    border: '2px solid #000',
                    boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translate(2px, 2px)';
                    e.currentTarget.style.boxShadow = '2px 2px 0 rgba(0,0,0,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translate(0, 0)';
                    e.currentTarget.style.boxShadow = '4px 4px 0 rgba(0,0,0,0.3)';
                  }}
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Divider */}
        <div 
          className="mb-8"
          style={{
            height: '2px',
            backgroundColor: '#000',
          }}
        />
        
        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-sm">
            © {currentYear} Aspire. All rights reserved.
          </p>
          
          <div className="flex space-x-6">
            <a 
              href="#" 
              className="text-gray-600 hover:text-gray-900 transition text-sm"
            >
              Privacy Policy
            </a>
            <a 
              href="#" 
              className="text-gray-600 hover:text-gray-900 transition text-sm"
            >
              Terms of Service
            </a>
            <a 
              href="#" 
              className="text-gray-600 hover:text-gray-900 transition text-sm"
            >
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;