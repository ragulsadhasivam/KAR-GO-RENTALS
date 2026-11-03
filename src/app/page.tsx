import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionAdminId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";
import { LandingPage } from "@/components/marketing/LandingPage";
import { BOOKING_PHONE } from "@/components/marketing/bookingPhone";
import { FAQ_ITEMS } from "@/components/marketing/faq";
import { WEBSITE_ONLY_FLEET } from "@/components/marketing/websiteOnlyFleet";

export const metadata: Metadata = {
  title: "Self-Drive Car Rental in Karur | KAR GO RENTALS",
  description:
    "Rent insured self-drive cars in Karur with doorstep delivery. Baleno and Ertiga with published daily, extra-hour and extra-km rates. Book by call or WhatsApp.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "KAR GO RENTALS",
    title: "Self-Drive Car Rental in Karur | KAR GO RENTALS",
    description:
      "Insured self-drive cars delivered to your door in Karur. Clear rates, book by call or WhatsApp.",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "KAR GO RENTALS self-drive cars" }],
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Self-Drive Car Rental in Karur | KAR GO RENTALS",
    description: "Insured self-drive cars delivered to your door. Book by call or WhatsApp.",
    images: ["/og.jpg"],
  },
};

export default async function RootPage() {
  const adminId = await getSessionAdminId();

  const business = await prisma.business.findFirst();
  if (!business?.setupCompletedAt) {
    redirect(adminId ? "/dashboard" : "/login");
  }

  const vehicles = await prisma.vehicle.findMany({
    where: { archived: false },
    include: { pricing: true },
    orderBy: { createdAt: "asc" },
    take: 6,
  });

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "AutoRental",
      name: business.name,
      url: SITE_URL,
      image: `${SITE_URL}/og.jpg`,
      telephone: BOOKING_PHONE,
      email: business.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: business.address,
        addressLocality: business.city,
        addressRegion: business.state,
        addressCountry: "IN",
      },
      areaServed: business.city,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ_ITEMS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <LandingPage
        isAuthenticated={!!adminId}
        businessName={business.name}
        email={business.email}
        address={business.address}
        city={business.city}
        state={business.state}
        rentalTerms={business.rentalTerms}
        vehicles={vehicles.map((v) => ({
          id: v.id,
          make: v.make,
          model: v.model,
          variant: v.variant,
          fuelType: v.fuelType,
          imageUrl: v.imageUrl,
          dailyRate: v.pricing?.dailyRate ?? null,
          extraKmRate: v.pricing ? 10 : null,
        })).concat(WEBSITE_ONLY_FLEET)}
      />
    </>
  );
}
