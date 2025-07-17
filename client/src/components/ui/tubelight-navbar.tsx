
<old_str>"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { 
  Home, 
  Bot, 
  Zap, 
  Cpu, 
  Star, 
  Settings,
  BarChart3,
  Cloud,
  Users,
  Activity
} from "lucide-react"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface NavBarProps {
  className?: string
}

export function NavBar({ className }: NavBarProps) {
  const { isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState("")
  const [isMobile, setIsMobile] = useState(false)

  // Define different nav items based on authentication status
  const publicNavItems: NavItem[] = [
    { name: 'Home', url: '#hero', icon: Home },
    { name: 'DevOps', url: '#devops-comparison', icon: Zap },
    { name: 'Agents', url: '#agents', icon: Bot },
    { name: 'Features', url: '#features', icon: Cpu },
    { name: 'Pricing', url: '#pricing', icon: Star }
  ]

  const authenticatedNavItems: NavItem[] = [
    { name: 'Dashboard', url: '/dashboard', icon: BarChart3 },
    { name: 'Agents', url: '/agents', icon: Bot },
    { name: 'Infrastructure', url: '/infrastructure', icon: Cloud },
    { name: 'Monitoring', url: '/monitoring', icon: Activity },
    { name: 'Settings', url: '/settings', icon: Settings }
  ]

  const items = isAuthenticated ? authenticatedNavItems : publicNavItems

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    // Set initial active tab based on current location
    if (isAuthenticated) {
      const currentPath = window.location.pathname
      const currentItem = items.find(item => item.url === currentPath)
      if (currentItem) {
        setActiveTab(currentItem.name)
      } else {
        setActiveTab(items[0].name)
      }
    } else {
      setActiveTab(items[0].name)
    }
  }, [isAuthenticated, items])

  const handleClick = (item: NavItem) => {
    setActiveTab(item.name)
    if (item.url.startsWith('#')) {
      const element = document.getElementById(item.url.substring(1))
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      window.location.href = item.url
    }
  }

  return (
    <div
      className={cn(
        "fixed top-6 left-1/2 -translate-x-1/2 z-[9999]",
        className,
      )}
    >
      <div className="flex items-center gap-3 bg-black/20 border border-white/20 backdrop-blur-xl py-1 px-1 rounded-full shadow-2xl">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name

          return (
            <button
              key={item.name}
              onClick={() => handleClick(item)}
              className={cn(
                "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors",
                "text-white/80 hover:text-blue-300",
                isActive && "text-blue-300",
              )}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden">
                <Icon size={18} strokeWidth={2.5} />
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-blue-500/20 rounded-full -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-400 rounded-t-full">
                    <div className="absolute w-12 h-6 bg-blue-400/30 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-blue-400/30 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-blue-400/30 rounded-full blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}</old_str>
<new_str>"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { 
  Home, 
  Bot, 
  Zap, 
  Cpu, 
  Star, 
  Settings,
  BarChart3,
  Cloud,
  Users,
  Activity,
  Menu,
  X,
  LogOut
} from "lucide-react"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface NavBarProps {
  className?: string
}

export function NavBar({ className }: NavBarProps) {
  const { isAuthenticated, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Define different nav items based on authentication status
  const publicNavItems: NavItem[] = [
    { name: 'Home', url: '#hero', icon: Home },
    { name: 'DevOps', url: '#devops-comparison', icon: Zap },
    { name: 'Agents', url: '#agents', icon: Bot },
    { name: 'Features', url: '#features', icon: Cpu },
    { name: 'Pricing', url: '#pricing', icon: Star }
  ]

  const authenticatedNavItems: NavItem[] = [
    { name: 'Dashboard', url: '/dashboard', icon: BarChart3 },
    { name: 'Agents', url: '/agents', icon: Bot },
    { name: 'Infrastructure', url: '/infrastructure', icon: Cloud },
    { name: 'Monitoring', url: '/monitoring', icon: Activity },
    { name: 'Settings', url: '/settings', icon: Settings }
  ]

  const items = isAuthenticated ? authenticatedNavItems : publicNavItems

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    handleResize()
    handleScroll()
    window.addEventListener("resize", handleResize)
    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  useEffect(() => {
    // Set initial active tab based on current location
    if (isAuthenticated) {
      const currentPath = window.location.pathname
      const currentItem = items.find(item => item.url === currentPath)
      if (currentItem) {
        setActiveTab(currentItem.name)
      } else {
        setActiveTab(items[0].name)
      }
    } else {
      setActiveTab(items[0].name)
    }
  }, [isAuthenticated, items])

  const handleClick = (item: NavItem) => {
    setActiveTab(item.name)
    setMobileMenuOpen(false)
    
    if (item.url.startsWith('#')) {
      const element = document.getElementById(item.url.substring(1))
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      window.location.href = item.url
    }
  }

  const handleLogout = () => {
    logout()
    setMobileMenuOpen(false)
    window.location.href = '/'
  }

  return (
    <>
      {/* Fixed Navigation Bar */}
      <motion.div
        className={cn(
          "fixed top-0 left-0 right-0 z-[9999] transition-all duration-300",
          scrolled ? "bg-black/40 backdrop-blur-xl border-b border-white/10" : "bg-transparent",
          className
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                CAREERATE
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {items.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.name

                return (
                  <button
                    key={item.name}
                    onClick={() => handleClick(item)}
                    className={cn(
                      "relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200",
                      "text-white/80 hover:text-blue-300 hover:bg-white/10",
                      isActive && "text-blue-300 bg-blue-500/20"
                    )}
                  >
                    <Icon size={16} />
                    <span className="text-sm font-medium">{item.name}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full border border-blue-400/30"
                        initial={false}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}
                  </button>
                )
              })}
              
              {/* Auth Button */}
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <LogOut size={16} />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              ) : (
                <button
                  onClick={() => window.location.href = '/auth'}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium transition-all duration-200 hover:from-blue-400 hover:to-purple-500"
                >
                  Get Started
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white hover:text-blue-300 transition-colors p-2"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/90 backdrop-blur-xl border-t border-white/10"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {items.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.name

                return (
                  <button
                    key={item.name}
                    onClick={() => handleClick(item)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left",
                      "text-white/80 hover:text-blue-300 hover:bg-white/10",
                      isActive && "text-blue-300 bg-blue-500/20"
                    )}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.name}</span>
                  </button>
                )
              })}
              
              {/* Mobile Auth Button */}
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <LogOut size={20} />
                  <span className="font-medium">Logout</span>
                </button>
              ) : (
                <button
                  onClick={() => window.location.href = '/auth'}
                  className="w-full mt-4 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium transition-all duration-200 hover:from-blue-400 hover:to-purple-500"
                >
                  Get Started
                </button>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Spacer to prevent content from being hidden behind fixed navbar */}
      <div className="h-16" />
    </>
  )
}</new_str>
