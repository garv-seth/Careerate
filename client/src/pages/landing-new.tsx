import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ThreeHero } from '@/components/ui/three-hero';
import { Menu, X, GitBranch } from 'lucide-react';
import careerateLogo from '@assets/CareerateLogo.png';

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleDemoClick = () => {
    // Open YouTube demo video
    window.open('https://www.youtube.com/watch?v=demo-video', '_blank');
  };

  const handleAuthLogin = () => {
    // Navigate to Azure B2C authentication
    window.location.href = '/api/auth/azure';
  };

  // Close mobile menu when scrolling
  useEffect(() => {
    const handleScroll = () => setMobileMenuOpen(false);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="text-white">
      
      {/* Fixed Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 p-4 lg:p-6">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <img src={careerateLogo} alt="CAREERATE" className="w-10 h-10 rounded-lg" />
            <div>
              <span className="text-xl font-bold">CAREERATE</span>
            </div>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-8">
            <a href="#vibe-hosting" className="hover:text-blue-300 transition-colors">Vibe Hosting</a>
            <a href="#agents" className="hover:text-blue-300 transition-colors">AI Agents</a>
            <a href="#workflow" className="hover:text-blue-300 transition-colors">Workflow</a>
            <Button variant="outline" onClick={handleDemoClick} className="border-gray-400/40 text-gray-300 hover:bg-gray-800/40">
              <GitBranch className="mr-2 h-4 w-4" />
              Connect GitHub
            </Button>
            <Button onClick={handleAuthLogin} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              Launch Platform
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden mt-4 bg-black/90 backdrop-blur-sm rounded-2xl border border-white/10 p-4"
          >
            <div className="flex flex-col space-y-4">
              <a href="#vibe-hosting" className="hover:text-blue-300 transition-colors py-2">Vibe Hosting</a>
              <a href="#agents" className="hover:text-blue-300 transition-colors py-2">AI Agents</a>
              <a href="#workflow" className="hover:text-blue-300 transition-colors py-2">Workflow</a>
              <Button variant="outline" onClick={handleDemoClick} className="border-gray-400/40 text-gray-300 hover:bg-gray-800/40 mt-4">
                <GitBranch className="mr-2 h-4 w-4" />
                Connect GitHub
              </Button>
              <Button onClick={handleAuthLogin} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                Launch Platform
              </Button>
            </div>
          </motion.div>
        )}
      </header>

      {/* ONLY the ThreeHero Component - it handles everything */}
      <ThreeHero />
    </div>
  );
}