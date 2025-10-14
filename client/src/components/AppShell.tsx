import { useState, useEffect, ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Sparkles, Code, Cloud, Shield, User, Settings, LogOut, Brain, BarChart3, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LoginModal } from "@/components/LoginModal";
import { cn } from "@/lib/utils";

const Logo = ({ isAuthenticated }: { isAuthenticated: boolean }) => (
    <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-3 group pl-2">
        <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-300 group-hover:scale-110">
            <path d="M20 0L24.4903 15.5097L40 20L24.4903 24.4903L20 40L15.5097 24.4903L0 20L15.5097 15.5097L20 0Z" fill="url(#logo-gradient)"/>
            <defs>
                <linearGradient id="logo-gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F97316"/>
                    <stop offset="1" stopColor="#F59E0B"/>
                </linearGradient>
            </defs>
        </svg>
        <span className="text-display font-bold text-lg text-foreground">Careerate</span>
    </Link>
);

const Footer = () => (
    <footer className="border-t border-white/10 mt-20">
      <div className="container mx-auto px-4 py-12">
         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-8">
            <div className="col-span-full lg:col-span-1">
                <h3 className="text-display font-semibold text-lg mb-2">Careerate</h3>
                <p className="text-sm text-foreground/60">The future of development is autonomous.</p>
            </div>
            <div>
                <h4 className="font-semibold mb-4">Platform</h4>
                <ul className="space-y-3">
                    <li><Link href="/"><a className="text-sm text-foreground/60 hover:text-foreground transition">Features</a></Link></li>
                    <li><Link href="#pricing"><a className="text-sm text-foreground/60 hover:text-foreground transition">Pricing</a></Link></li>
                    <li><Link href="/integrations"><a className="text-sm text-foreground/60 hover:text-foreground transition">Integrations</a></Link></li>
                </ul>
            </div>
            <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-3">
                    <li><a href="#about" className="text-sm text-foreground/60 hover:text-foreground transition">About</a></li>
                    <li><a href="#contact" className="text-sm text-foreground/60 hover:text-foreground transition">Contact</a></li>
                </ul>
            </div>
            <div>
                <h4 className="font-semibold mb-4">Resources</h4>
                <ul className="space-y-3">
                    <li><a href="#docs" className="text-sm text-foreground/60 hover:text-foreground transition">Documentation</a></li>
                    <li><a href="#support" className="text-sm text-foreground/60 hover:text-foreground transition">Support</a></li>
                </ul>
            </div>
            <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="space-y-3">
                    <li><Link href="/privacy"><a className="text-sm text-foreground/60 hover:text-foreground transition">Privacy Policy</a></Link></li>
                    <li><Link href="/terms"><a className="text-sm text-foreground/60 hover:text-foreground transition">Terms of Service</a></Link></li>
                </ul>
            </div>
         </div>
         <div className="border-t border-white/10 pt-8 text-center text-sm text-foreground/60">
          <p>© {new Date().getFullYear()} Careerate. All rights reserved.</p>
         </div>
      </div>
    </footer>
  )

const NavLink = ({ href, children, isPageLink = false }: { href: string; children: React.ReactNode; isPageLink?: boolean }) => {
    const [location, setLocation] = useLocation();
    const isActive = location === href || (href.includes('#') && window.location.hash === href.split('#')[1]);

    const commonClasses = "px-3 py-2 rounded-full text-sm font-medium transition-all duration-300";

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();

        if (isPageLink) {
            setLocation(href);
        } else if (href.startsWith('#')) {
            document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
        } else if (href.includes('#')) {
            const [path, hash] = href.split('#');
            if (path) setLocation(path);
            window.location.hash = hash;
        } else {
            window.location.href = href;
        }
    };

    if (isPageLink) {
        return (
            <a
                href={href}
                onClick={handleClick}
                className={cn(
                    commonClasses,
                    isActive ? "text-foreground bg-primary/10" : "text-foreground/70 hover:text-foreground hover:bg-primary/10"
                )}
            >
                {children}
            </a>
        )
    }

    return (
        <a
            href={href}
            className={cn(commonClasses, "text-foreground/80 hover:text-foreground hover:bg-primary/10")}
            onClick={handleClick}
        >
            {children}
        </a>
    );
};


export function AppShell({ children, className, hideFooter = false }: { children: ReactNode; className?: string; hideFooter?: boolean }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const { isAuthenticated, isLoading } = useAuth();
    const [isScrolled, setIsScrolled] = useState(false);
    const [location] = useLocation();
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const UnauthenticatedNav = () => (
        <>
            <NavLink href="/">Features</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>
            <NavLink href="#docs">Docs</NavLink>
        </>
    );

    const AuthenticatedNav = () => (
        <>
            <Link href="/dashboard">
                <a className={cn(
                    "px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center",
                    location === "/dashboard" ? "text-foreground bg-primary/10" : "text-foreground/70 hover:text-foreground hover:bg-primary/10"
                )}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Dashboard
                </a>
            </Link>
            <Link href="/agent">
                <a className={cn(
                    "px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center",
                    location === "/agent" ? "text-foreground bg-primary/10" : "text-foreground/70 hover:text-foreground hover:bg-primary/10"
                )}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Agent Suite
                </a>
            </Link>
            <Link href="/deploy">
                <a className={cn(
                    "px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center",
                    location === "/deploy" ? "text-foreground bg-primary/10" : "text-foreground/70 hover:text-foreground hover:bg-primary/10"
                )}>
                    <Cloud className="h-4 w-4 mr-2" />
                    Deploy
                </a>
            </Link>
            <Link href="/integrations">
                <a className={cn(
                    "px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center",
                    location === "/integrations" ? "text-foreground bg-primary/10" : "text-foreground/70 hover:text-foreground hover:bg-primary/10"
                )}>
                    <Shield className="h-4 w-4 mr-2" />
                    Integrations
                </a>
            </Link>
            <Link href="/settings">
                <a className={cn(
                    "px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center",
                    location === "/settings" ? "text-foreground bg-primary/10" : "text-foreground/70 hover:text-foreground hover:bg-primary/10"
                )}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                </a>
            </Link>
        </>
    );


    const AuthButtons = () => (
        <div className="flex items-center gap-2">
            {isAuthenticated ? (
                 <div className="flex items-center gap-2">
                     <Link href="/account">
                        <Button variant="ghost" size="icon" className="rounded-full" title="Account Settings">
                            <User className="h-5 w-5 text-foreground/70 hover:text-foreground transition-colors" />
                        </Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="rounded-full" onClick={() => window.location.href = '/api/logout'} title="Sign Out">
                        <LogOut className="h-5 w-5 text-foreground/70 hover:text-foreground transition-colors" />
                    </Button>
                 </div>
            ) : (
                <>
                    <Button variant="ghost" className="rounded-full text-sm" onClick={() => setIsLoginModalOpen(true)} disabled={isLoading}>
                        Sign In
                    </Button>
                    <Button
                        className="rounded-full text-sm bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-lg shadow-orange-500/25"
                        onClick={() => document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' })}
                        disabled={isLoading}
                    >
                        Get Started
                    </Button>
                </>
            )}
        </div>
    );

    const rootBackground = className ? className : "bg-background";

    return (
        <div className={cn("min-h-screen text-foreground", rootBackground)}>
            <header className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out",
                isScrolled ? "pt-2" : "pt-4 md:pt-6"
            )}>
                <div className="container mx-auto max-w-7xl">
                    <nav className={cn(
                        "w-full flex items-center justify-between p-2 rounded-full glass-pane transition-all duration-300",
                        isScrolled ? "h-14" : "h-16"
                    )}>
                        <Logo isAuthenticated={isAuthenticated} />

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
            </header>
            
            <div className={cn(
                "fixed top-0 right-0 h-full w-full max-w-xs z-40 bg-background/80 backdrop-blur-xl transition-transform duration-300 ease-in-out md:hidden",
                isMenuOpen ? "translate-x-0" : "translate-x-full"
            )}>
                <div className="h-full flex flex-col justify-between p-6 pt-24">
                    <div className="flex flex-col gap-4">
                        {isAuthenticated ? <AuthenticatedNav /> : <UnauthenticatedNav />}
                    </div>
                    <AuthButtons />
                </div>
            </div>

            <main className="pt-24 md:pt-28">
                {children}
            </main>

            {!hideFooter && <Footer />}

            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
            />
        </div>
    );
}
