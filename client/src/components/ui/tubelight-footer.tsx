
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
  Activity,
  LogOut,
  User
} from "lucide-react"

interface FooterNavItem {
  name: string
  url: string
  icon: LucideIcon
  action?: () => void
}

interface TubelightFooterProps {
  className?: string
}

export function TubelightFooter({ className }: TubelightFooterProps) {
  const { isAuthenticated, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("")
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Define different footer nav items based on authentication status
  const publicFooterItems: FooterNavItem[] = [
    { name: 'Home', url: '#hero', icon: Home },
    { name: 'About', url: '#about', icon: User },
    { name: 'Pricing', url: '#pricing', icon: Star }
  ]

  const authenticatedFooterItems: FooterNavItem[] = [
    { name: 'Dashboard', url: '/dashboard', icon: BarChart3 },
    { name: 'Profile', url: '/profile', icon: User },
    { name: 'Settings', url: '/settings', icon: Settings },
    { name: 'Logout', url: '#', icon: LogOut, action: logout }
  ]

  const items = isAuthenticated ? authenticatedFooterItems : publicFooterItems

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

  const handleClick = (item: FooterNavItem) => {
    if (item.action) {
      item.action()
      return
    }

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
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999]",
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
                item.name === 'Logout' && "text-red-300 hover:text-red-200"
              )}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden">
                <Icon size={18} strokeWidth={2.5} />
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp-footer"
                  className="absolute inset-0 w-full bg-blue-500/20 rounded-full -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-400 rounded-b-full">
                    <div className="absolute w-12 h-6 bg-blue-400/30 rounded-full blur-md -bottom-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-blue-400/30 rounded-full blur-md -bottom-1" />
                    <div className="absolute w-4 h-4 bg-blue-400/30 rounded-full blur-sm bottom-0 left-2" />
                  </div>
                </motion.div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
