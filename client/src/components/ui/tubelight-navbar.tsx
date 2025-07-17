"use client"

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
      const currentHash = window.location.hash
      const currentItem = items.find(item => item.url === currentHash)
      if (currentItem) {
        setActiveTab(currentItem.name)
      } else {
        setActiveTab(items[0].name)
      }
    }
  }, [isAuthenticated, items])

  const handleNavClick = (item: NavItem) => {
    setActiveTab(item.name)
    
    if (isAuthenticated && item.url.startsWith('/')) {
      // Navigate to page for authenticated users
      window.location.href = item.url
    } else {
      // Smooth scroll to section for public nav
      const element = document.querySelector(item.url)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  if (!isAuthenticated) {
    return null // Don't show navbar on landing page
  }

  return (
    <div className={cn(
      "fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4",
      className
    )}>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 300,
          damping: 30,
          duration: 0.8 
        }}
        className="
          relative
          backdrop-blur-3xl
          bg-white/5
          border border-white/20
          rounded-full
          px-6 py-3
          shadow-2xl
          shadow-purple-500/20
          before:absolute
          before:inset-0
          before:rounded-full
          before:bg-gradient-to-r
          before:from-blue-500/10
          before:via-purple-500/10
          before:to-pink-500/10
          before:opacity-50
          before:blur-xl
          before:-z-10
        "
      >
        <div className="flex items-center justify-center space-x-2">
          {items.map((item) => (
            <motion.button
              key={item.name}
              onClick={() => handleNavClick(item)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300",
                "text-sm font-medium",
                activeTab === item.name
                  ? "text-white"
                  : "text-white/70 hover:text-white"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {activeTab === item.name && (
                <motion.div
                  layoutId="activeTab"
                  className="
                    absolute inset-0 
                    bg-gradient-to-r from-blue-500/30 to-purple-500/30
                    rounded-full
                    backdrop-blur-sm
                    border border-white/20
                  "
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              )}
              <item.icon className="w-4 h-4 relative z-10" />
              {!isMobile && (
                <span className="relative z-10">{item.name}</span>
              )}
            </motion.button>
          ))}
        </div>

        {/* Floating glow effect */}
        <motion.div
          className="
            absolute -inset-4 
            bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 
            rounded-full 
            blur-xl 
            opacity-30
            animate-pulse
            -z-20
          "
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.nav>
    </div>
  )
}