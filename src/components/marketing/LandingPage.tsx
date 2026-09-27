"use client";

import { LandingNavbar } from "./LandingNavbar";
import { Hero } from "./Hero";
import { FleetHero } from "./FleetHero";
import { TrustStrip } from "./TrustStrip";
import { ServiceStory } from "./ServiceStory";
import { FleetShowcase, type FleetVehicle } from "./FleetShowcase";
import { HowItWorks } from "./HowItWorks";
import { WhyChooseUs } from "./WhyChooseUs";
import { CTASection } from "./CTASection";
import { MarketingFooter } from "./MarketingFooter";

export function LandingPage({
  isAuthenticated,
  businessName,
  email,
  address,
  city,
  state,
  vehicles,
}: {
  isAuthenticated: boolean;
  businessName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  vehicles: FleetVehicle[];
}) {
  return (
    <div className="theme-marketing min-h-screen bg-base text-ink-1 overflow-x-hidden">
      <LandingNavbar businessName={businessName} isAuthenticated={isAuthenticated} />
      <main>
        <Hero city={city} />
        <FleetHero />
        <TrustStrip />
        <ServiceStory />
        <WhyChooseUs />
        <FleetShowcase vehicles={vehicles} />
        <HowItWorks />
        <CTASection />
      </main>
      <MarketingFooter businessName={businessName} email={email} address={address} city={city} state={state} />
    </div>
  );
}
