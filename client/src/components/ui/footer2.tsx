
import React from "react";
import { Link } from "wouter";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import careerateLogoSrc from "@assets/CareerateICON.png";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";

interface MenuItem {
  title: string;
  links: {
    text: string;
    url: string;
  }[];
}

interface Footer2Props {
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  menuItems?: MenuItem[];
}

const Footer2 = ({
  logo = {
    src: careerateLogoSrc,
    alt: "Careerate Logo",
    title: "Careerate",
    url: "/",
  },
  menuItems = [
    {
      title: "Product",
      links: [
        { text: "Overview", url: "/overview" },
        { text: "Pricing", url: "/pricing" },
        { text: "Features", url: "/features" },
        { text: "Updates", url: "/updates" },
      ],
    },
    {
      title: "Company",
      links: [
        { text: "About", url: "/about" },
        { text: "Team", url: "/team" },
        { text: "Blog", url: "/blog" },
        { text: "Careers", url: "/careers" },
      ],
    },
    {
      title: "Resources",
      links: [
        { text: "Help Center", url: "/help" },
        { text: "Support", url: "/support" },
        { text: "API Docs", url: "/api-docs" },
      ],
    },
  ],
}: Footer2Props) => {
  const { theme, setTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLDivElement;
      const isAtBottom = Math.abs(target.scrollHeight - target.scrollTop - target.clientHeight) < 50;
      setIsVisible(isAtBottom);
    };

    const container = document.querySelector('.scroll-container');
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <footer className={cn(
      "w-full mt-auto flex justify-center pb-4 pt-2 bg-background/95 backdrop-blur-sm border-t border-border z-10",
    )}>
      <div className="py-4 px-6 max-w-screen-xl w-full">
        <div className="flex flex-wrap items-center justify-center gap-8">
          {menuItems.map((section, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2">
              <h3 className="font-semibold text-sm text-foreground/80">{section.title}</h3>
              <div className="flex gap-4">
                {section.links.map((link, linkIdx) => (
                  <a
                    key={linkIdx}
                    href={link.url}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.text}
                  </a>
                ))}
              </div>
            </div>
          ))}

          <div className="flex items-center gap-4 border-l border-border pl-4">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                className="bg-background/5"
                aria-label="Toggle theme"
              />
              <Moon className="h-4 w-4" />
            </div>
            <p className="text-sm text-muted-foreground">
              Made with <span className="text-blue-500">♥</span> in Seattle
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export { Footer2 };
export default Footer2;
