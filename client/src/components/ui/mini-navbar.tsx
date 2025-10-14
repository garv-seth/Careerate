import React from "react";
import { Link } from "wouter";

const Logo = () => (
  <Link href="/" className="flex items-center gap-3 group">
    <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-300 group-hover:scale-110">
      <path d="M20 0L24.4903 15.5097L40 20L24.4903 24.4903L20 40L15.5097 24.4903L0 20L15.5097 15.5097L20 0Z" fill="url(#logo-gradient)"/>
      <defs>
        <linearGradient id="logo-gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F97316"/>
          <stop offset="1" stopColor="#F59E0B"/>
        </linearGradient>
      </defs>
    </svg>
    <span className="font-bold text-xl text-white">Careerate</span>
  </Link>
);

export function Navbar() {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 p-6">
      <nav className="flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-4">
          <Link href="/" className="text-white/80 hover:text-white transition-colors">
            Features
          </Link>
          <Link href="/" className="text-white/80 hover:text-white transition-colors">
            Pricing
          </Link>
          <Link href="/" className="text-white/80 hover:text-white transition-colors">
            Docs
          </Link>
        </div>
      </nav>
    </header>
  );
}
