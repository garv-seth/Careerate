// Icon fallbacks for missing react-icons/si exports
import { Cloud } from "lucide-react";

// Mock the missing icons to prevent runtime errors
export const SiMicrosoft = Cloud;
export const SiAmazonaws = Cloud; 
export const SiMicrosoftazure = Cloud;

// Re-export any working icons from react-icons/si
export const SiAmazon = Cloud; // Fallback since the original might not work
export const SiGoogle = Cloud; // Fallback since the original might not work

// This module provides fallbacks for any missing react-icons
export const iconFallbacks = {
  SiMicrosoft: Cloud,
  SiAmazonaws: Cloud,
  SiMicrosoftazure: Cloud,
  SiAmazon: Cloud,
  SiGoogle: Cloud,
};