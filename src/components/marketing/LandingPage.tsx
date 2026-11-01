import { LandingNavbar } from "./LandingNavbar";
import { Hero } from "./Hero";
import { FleetShowcase, type FleetVehicle } from "./FleetShowcase";
import { RatesAndRules } from "./RatesAndRules";
import { HowItWorks } from "./HowItWorks";
import { WhyChooseUs } from "./WhyChooseUs";
import { FAQ } from "./FAQ";
import { CTASection } from "./CTASection";
import { MarketingFooter } from "./MarketingFooter";
import { MobileActionBar } from "./MobileActionBar";

export function LandingPage({
  isAuthenticated,
  businessName,
  email,
  address,
  city,
  state,
  rentalTerms,
  vehicles,
}: {
  isAuthenticated: boolean;
  businessName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  rentalTerms: string | null;
  vehicles: FleetVehicle[];
}) {
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${businessName} ${address} ${city}`
  )}`;

  return (
    <div className="theme-marketing min-h-screen overflow-x-hidden bg-base text-ink-1">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-gold-500 focus:px-4 focus:py-2 focus:text-black"
      >
        Skip to content
      </a>
      <LandingNavbar businessName={businessName} isAuthenticated={isAuthenticated} />
      <main id="main">
        <Hero city={city} />
        <FleetShowcase vehicles={vehicles} />
        <RatesAndRules vehicles={vehicles} rentalTerms={rentalTerms} />
        <HowItWorks />
        <WhyChooseUs />
        <FAQ />
        <CTASection city={city} mapsHref={mapsHref} />
      </main>
      <MarketingFooter
        businessName={businessName}
        email={email}
        address={address}
        city={city}
        state={state}
        mapsHref={mapsHref}
      />
      <MobileActionBar />
    </div>
  );
}
