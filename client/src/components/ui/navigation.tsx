import React from "react";
import { Link, useLocation } from "wouter";
import { Code, Github, Twitter, Linkedin, Mail, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const Logo = ({ className }: { className?: string }) => (
  <Link href="/" className={`flex items-center gap-3 group ${className}`}>
    <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-300 group-hover:scale-110">
      <path d="M20 0L24.4903 15.5097L40 20L24.4903 24.4903L20 40L15.5097 24.4903L0 20L15.5097 15.5097L20 0Z" fill="url(#logo-gradient)"/>
      <defs>
        <linearGradient id="logo-gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F97316"/>
          <stop offset="1" stopColor="#F59E0B"/>
        </linearGradient>
      </defs>
    </svg>
    <span className="font-bold text-xl text-foreground">Careerate</span>
  </Link>
);

const NavLink = ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => {
  const [location] = useLocation();
  const isActive = location === href;

  return (
    <Link href={href}>
      <a className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
        isActive ? "text-foreground bg-primary/10" : "text-foreground/70 hover:text-foreground hover:bg-primary/10"
      } ${className}`}>
        {children}
      </a>
    </Link>
  );
};

export function Navigation() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const UnauthenticatedNav = () => (
    <>
      <NavLink href="/#features">Features</NavLink>
      <NavLink href="/#pricing">Pricing</NavLink>
      <NavLink href="/#docs">Docs</NavLink>
    </>
  );

  const AuthenticatedNav = () => (
    <>
      <NavLink href="/agent">Agent Suite</NavLink>
      <NavLink href="/projects">Projects</NavLink>
      <NavLink href="/dashboard">Overview</NavLink>
    </>
  );

  const AuthButtons = () => (
    <div className="flex items-center gap-2">
      {isAuthenticated ? (
        <div className="flex items-center gap-2">
          <Link href="/account">
            <Button variant="ghost" size="icon" className="rounded-full">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => window.location.href = '/api/logout'}>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </Button>
        </div>
      ) : (
        <>
          <Button variant="ghost" className="rounded-full text-sm">Sign In</Button>
          <Button className="rounded-full text-sm bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-lg shadow-orange-500/25">
            Get Started
          </Button>
        </>
      )}
    </div>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out">
      <div className="container mx-auto max-w-7xl">
        <nav className="w-full flex items-center justify-between p-2 rounded-full glass-pane transition-all duration-300 h-16">
          <Logo />

          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated ? <AuthenticatedNav /> : <UnauthenticatedNav />}
          </div>

          <div className="hidden md:flex items-center pr-2">
            <AuthButtons />
          </div>

          <div className="md:hidden pr-2">
            <Button size="icon" variant="ghost" className="rounded-full" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-xs z-40 bg-background/80 backdrop-blur-xl transition-transform duration-300 ease-in-out md:hidden ${
        isMenuOpen ? "translate-x-0" : "translate-x-full"
      }`}>
        <div className="h-full flex flex-col justify-between p-6 pt-24">
          <div className="flex flex-col gap-4">
            {isAuthenticated ? <AuthenticatedNav /> : <UnauthenticatedNav />}
          </div>
          <AuthButtons />
        </div>
      </div>
    </header>
  );
}
