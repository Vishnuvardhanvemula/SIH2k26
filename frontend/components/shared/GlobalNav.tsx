'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function GlobalNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-abyss/70 backdrop-blur-xl border-b border-white/10 py-3' 
          : 'bg-transparent border-b border-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* Brand */}
        <Link href="/" className="flex items-center group">
          <span className="font-display font-bold tracking-widest text-white group-hover:text-biolume transition-colors leading-none text-lg">
            OCEANROOT
          </span>
        </Link>

        {/* Links & CTA */}
        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="font-ui text-sm font-medium text-foam-dim hover:text-white transition-colors relative group">
              Home
              <span className="absolute -bottom-2 left-0 right-0 h-[2px] bg-white scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out" />
            </Link>
            <Link href="/#platform" className="font-ui text-sm font-medium text-foam-dim hover:text-white transition-colors relative group">
              Platform
              <span className="absolute -bottom-2 left-0 right-0 h-[2px] bg-white scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out" />
            </Link>
            <Link href="/#capabilities" className="font-ui text-sm font-medium text-foam-dim hover:text-white transition-colors relative group">
              Capabilities
              <span className="absolute -bottom-2 left-0 right-0 h-[2px] bg-white scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out" />
            </Link>
            <Link href="/#data" className="font-ui text-sm font-medium text-foam-dim hover:text-white transition-colors relative group">
              Data
              <span className="absolute -bottom-2 left-0 right-0 h-[2px] bg-white scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out" />
            </Link>
            <Link href="/about" className="font-ui text-sm font-medium text-foam-dim hover:text-white transition-colors relative group">
              About
              <span className="absolute -bottom-2 left-0 right-0 h-[2px] bg-white scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out" />
            </Link>
          </div>
          
          <Link 
            href="/explore" 
            className={`
              group flex items-center gap-2
              font-ui text-xs font-bold px-5 py-2.5 rounded-full transition-all duration-300
              ${scrolled 
                ? 'bg-white text-abyss hover:bg-biolume shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(76,224,210,0.3)]' 
                : 'bg-white/10 text-white border border-white/20 hover:bg-white hover:text-abyss backdrop-blur-md'}
            `}
          >
            Launch <span className="hidden sm:inline">Explorer</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
