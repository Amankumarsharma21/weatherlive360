import { Helmet } from "react-helmet-async";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  canonical?: string;
  jsonLd?: object;
}

export function PageLayout({ children, title, description, canonical, jsonLd }: PageLayoutProps) {
  const fullTitle = title ? `${title} | SmartWeather Pro` : "SmartWeather Pro — Real-time Weather & Smart Insights";
  const desc = description ?? "Real-time weather, air quality, 7-day forecast, and AI-powered lifestyle suggestions for any city worldwide.";
  return (
    <div className="min-h-screen flex flex-col ambient-bg">
      <Helmet>
        <title>{fullTitle}</title>
        <meta name="description" content={desc} />
        {canonical && <link rel="canonical" href={canonical} />}
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={desc} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
      </Helmet>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
