import Navigation from "@/components/navigation";
import { IlluminatedHero } from "@/components/ui/illuminated-hero";
import FeaturesSection from "@/components/features-section";
import HowItWorks from "@/components/how-it-works";
import DashboardPreview from "@/components/dashboard-preview";
import PricingSection from "@/components/pricing-section";
import CTASection from "@/components/cta-section";
import Footer from "@/components/footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <IlluminatedHero />
      <div id="features" className="bg-background">
        <FeaturesSection />
        <HowItWorks />
        <DashboardPreview />
        <PricingSection />
        <CTASection />
        <Footer />
      </div>
    </div>
  );
}
