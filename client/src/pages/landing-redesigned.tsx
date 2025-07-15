import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MorphingText } from "@/components/ui/morphing-text";
import { Menu, X } from "lucide-react";
import careerateLogo from "@assets/CareerateLogo.png";
import { useAuth } from "@/hooks/useAuth";

export default function LandingRedesigned() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();

  const handleNavigation = () => {
    if (isAuthenticated) {
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/api/login';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">

      {/* Fixed Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
        <nav className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img src={careerateLogo} alt="CAREERATE" className="w-8 h-8 rounded-lg" />
              <span className="text-xl font-bold bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">CAREERATE</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">
                Pricing
              </a>
              <a href="#about" className="text-gray-300 hover:text-white transition-colors">
                About
              </a>
              <Button 
                onClick={handleNavigation}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white px-6 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : isAuthenticated ? 'Dashboard' : 'Get Started'}
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white hover:bg-white/10"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </nav>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-slate-950/95 backdrop-blur-xl border-b border-white/10 px-6 py-4"
          >
            <div className="space-y-4">
              <a href="#features" className="block text-gray-300 hover:text-white transition-colors py-2">
                Features
              </a>
              <a href="#pricing" className="block text-gray-300 hover:text-white transition-colors py-2">
                Pricing
              </a>
              <a href="#about" className="block text-gray-300 hover:text-white transition-colors py-2">
                About
              </a>
              <Button 
                onClick={handleNavigation}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white px-6 py-3 rounded-lg transition-all duration-300 shadow-lg disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : isAuthenticated ? 'Dashboard' : 'Get Started'}
              </Button>
            </div>
          </motion.div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="text-center max-w-4xl mx-auto px-6">

          {/* Main Hero Text with Morphing Effect */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-8"
          >
            <MorphingText
              texts={["Introducing", "Vibe Hosting", "Agent DevOps", "Autonomous Infrastructure"]}
              className="text-6xl md:text-8xl font-black text-white mb-4"
              morphTime={3000}
              cooldownTime={1000}
            />
          </motion.div>

          {/* Simple Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-2xl md:text-3xl text-gray-300 font-light mb-12"
          >
            Agentic DevOps & SRE
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <Button 
              onClick={handleNavigation}
              disabled={isLoading}
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-12 py-4 text-xl rounded-xl transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 hover:scale-105 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
            </Button>
          </motion.div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6 bg-slate-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <img src={careerateLogo} alt="CAREERATE" className="w-6 h-6 rounded-lg" />
              <span className="text-lg font-bold bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">CAREERATE</span>
            </div>
            <div className="text-gray-400 text-sm text-center md:text-right">
              © 2025 CAREERATE. The future of autonomous DevOps.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}