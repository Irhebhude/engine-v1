import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart3, Brain, Building2, Code, Cpu, Crown, Database, Globe, Heart,
  Layers, LineChart, MapPin, Shield, TrendingUp, Zap,
} from "lucide-react";
import SearchBar from "@/components/SearchBar";
import FeatureCard from "@/components/FeatureCard";
import Header from "@/components/Header";
import AdSense from "@/components/AdSense";
import SEOHead from "@/components/SEOHead";
import LiveActivityFeed from "@/components/LiveActivityFeed";
import TrendingTopics from "@/components/TrendingTopics";
import LocationSearch from "@/components/LocationSearch";
import FintechDashboard from "@/components/FintechDashboard";
import LiveRates from "@/components/LiveRates";
import { Button } from "@/components/ui/button";

const FEATURES = [
  { icon: Brain, title: "Reasoning AI", description: "Multi-step logic, not just keywords." },
  { icon: Zap, title: "Real-Time", description: "Live data, fresh answers." },
  { icon: Globe, title: "Deep Web", description: "Semantic discovery across trusted public sources." },
  { icon: Shield, title: "Privacy First", description: "No tracking, no profiling." },
  { icon: Cpu, title: "Multi-Model", description: "Multiple intelligence models working in parallel." },
  { icon: Layers, title: "Research Mode", description: "Academic-quality reports with evidence." },
  { icon: TrendingUp, title: "Fintech Pulse", description: "Live FX, crypto, and commodities." },
  { icon: BarChart3, title: "Business Insights", description: "Custom analytics dashboards." },
  { icon: LineChart, title: "Market Edge", description: "Trend prediction and intelligence reports." },
];

const FINTECH_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "SEARCH-POI",
  url: "https://engine-v1.lovable.app/",
  description: "African-first search and reasoning intelligence with live market, location, and research data.",
  applicationCategory: "SearchApplication",
  operatingSystem: "Web",
  creator: { "@type": "Organization", name: "POI Foundation" },
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: "https://engine-v1.lovable.app/search?q={search_term_string}" },
    "query-input": "required name=search_term_string",
  },
};

const Index = () => {
  const navigate = useNavigate();
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const handleSearch = (query: string) => navigate(`/search?q=${encodeURIComponent(query)}`);

  return (
    <div className="relative min-h-screen bg-background">
      <SEOHead
        title="SEARCH-POI — African Search & Reasoning Intelligence"
        description="Ask SEARCH-POI for grounded African business intelligence, live market data, location discovery, and evidence-led research."
        path="/"
        keywords={["African search engine", "business intelligence", "live market data", "POI Foundation", "SEARCH-POI"]}
        jsonLd={FINTECH_JSON_LD}
      />
      <Header />

      <main className="relative overflow-visible pb-28">
        <section className="relative border-b border-border/40 px-4 py-20 sm:px-8 sm:py-28">
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-20" />
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="relative mx-auto flex max-w-5xl flex-col items-center text-center">
            <div className="mb-8 inline-flex min-h-12 items-center gap-2 rounded-full border border-primary/35 bg-primary/5 px-5 text-sm font-medium text-primary">
              <Shield className="h-4 w-4" /> Independent · Owned by POI Foundation
            </div>
            <img src="/pwa-icon.png" alt="SEARCH-POI logo" className="mb-8 h-28 w-28 rounded-[28px] border border-primary/30 object-cover shadow-[0_0_42px_hsl(var(--primary)/0.16)] sm:h-32 sm:w-32" />
            <h1 className="font-display text-5xl font-bold text-foreground sm:text-7xl md:text-8xl">
              SEARCH<span className="gradient-text">-POI</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-2xl">
              Don&apos;t search. <span className="text-foreground">Ask.</span> The reasoning engine for African intelligence.
            </p>
            <div className="mt-12 w-full max-w-4xl"><SearchBar onSearch={handleSearch} /></div>
            <div className="mt-7 flex max-w-3xl flex-wrap items-center justify-center gap-3">
              {["Lagos businesses", "Fuel price today", "FX rate USD/NGN", "Startup ideas 2026"].map((query) => (
                <Button key={query} variant="outline" className="min-h-12 rounded-full border-border/80 bg-card/50 px-5 text-muted-foreground hover:border-primary/35 hover:text-primary" onClick={() => handleSearch(query)}>{query}</Button>
              ))}
              <Button onClick={() => setShowLocationSearch(true)} variant="outline" className="min-h-12 rounded-full border-primary/40 bg-primary/5 px-5 text-primary"><MapPin className="h-4 w-4" /> Near me</Button>
            </div>
            <p className="workspace-label mt-10">SEARCH-POI ENGINE V1 · MULTI-STEP REASONING</p>
          </motion.div>
        </section>

        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <section className="py-20 sm:py-28" aria-labelledby="rates-heading">
            <div className="mb-8 max-w-2xl"><p className="workspace-label mb-3">Live financial signals</p><h2 id="rates-heading" className="font-display text-3xl font-semibold sm:text-5xl">Rates and prices, <span className="gradient-text">right now.</span></h2></div>
            <LiveRates />
          </section>

          <section className="pb-20 sm:pb-28" aria-labelledby="intelligence-heading">
            <div className="mb-8 max-w-2xl"><p className="workspace-label mb-3">Intelligence layer</p><h2 id="intelligence-heading" className="font-display text-3xl font-semibold sm:text-5xl">Markets, models and space.</h2></div>
            <FintechDashboard />
          </section>

          <section className="pb-20 sm:pb-28" aria-labelledby="signals-heading">
            <div className="mb-8 max-w-2xl"><p className="workspace-label mb-3">Live signal desk</p><h2 id="signals-heading" className="font-display text-3xl font-semibold sm:text-5xl">What Africa is asking now.</h2></div>
            <div className="grid gap-6 lg:grid-cols-2"><TrendingTopics /><LiveActivityFeed /></div>
          </section>

          <section className="pb-20 sm:pb-28" aria-labelledby="capabilities-heading">
            <h2 id="capabilities-heading" className="mb-10 font-display text-4xl font-semibold leading-tight sm:text-6xl">One workspace. <span className="gradient-text">Every answer.</span></h2>
            <div className="grid gap-5 md:grid-cols-2">
              {FEATURES.map((feature, index) => <FeatureCard key={feature.title} {...feature} delay={0.04 * index} />)}
            </div>
          </section>

          <section className="pb-20 sm:pb-28">
            <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
              <Link to="/premium" className="flex min-h-[96px] items-center justify-center gap-3 rounded-[28px] bg-primary px-6 text-xl font-bold text-primary-foreground shadow-[0_0_32px_hsl(var(--primary)/0.18)] transition-transform hover:-translate-y-1 sm:text-2xl"><Crown className="h-6 w-6" /> Go Premium — ₦1,000/mo</Link>
              <Link to="/business" className="flex min-h-[96px] items-center justify-center gap-3 rounded-[28px] border border-border/80 bg-card/60 px-6 text-xl font-semibold text-foreground transition-colors hover:border-primary/35"><Building2 className="h-6 w-6 text-primary" /> Business Dashboard</Link>
            </div>
            <AdSense adSlot="9944378861" adFormat="horizontal" className="mt-16" />
          </section>
        </div>
      </main>

      <footer className="border-t border-border/60 bg-card/20 px-4 py-20 text-muted-foreground sm:px-8 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div><div className="mb-6 flex items-center gap-3"><img src="/pwa-icon.png" alt="" className="h-14 w-14 rounded-2xl" /><strong className="font-display text-2xl text-foreground">SEARCH<span className="text-primary">-POI</span></strong></div><p className="text-lg leading-relaxed">An independent intelligence engine.<br />Owned &amp; operated by <span className="text-foreground">POI Foundation.</span></p></div>
            <div><p className="workspace-label mb-5 text-foreground">Product</p><div className="space-y-4 text-lg"><Link to="/search" className="block hover:text-primary">Search</Link><Link to="/insights" className="block hover:text-primary">Insights</Link><Link to="/pricing" className="block hover:text-primary">Pricing</Link><Link to="/premium" className="block hover:text-primary">Premium</Link></div></div>
            <div><p className="workspace-label mb-5 text-foreground">Foundation</p><div className="space-y-4 text-lg"><Link to="/about" className="block hover:text-primary">About POI</Link><Link to="/contact" className="block hover:text-primary">Contact</Link><Link to="/policies" className="block hover:text-primary">Policies</Link><Link to="/policies" className="flex items-center gap-2 hover:text-primary"><Shield className="h-4 w-4" /> Rights &amp; Ownership</Link><Link to="/feedback" className="block hover:text-primary">Feedback</Link></div></div>
            <div><p className="workspace-label mb-5 text-foreground">Build</p><div className="space-y-4 text-lg"><Link to="/developer" className="flex items-center gap-2 hover:text-primary"><Code className="h-4 w-4" /> Developer API</Link><Link to="/business" className="block hover:text-primary">Business Dashboard</Link><Link to="/referral" className="block hover:text-primary">Refer &amp; Earn</Link><Link to="/waitlist" className="block hover:text-primary">Join Waitlist</Link></div></div>
          </div>
          <div className="mt-16 flex flex-col gap-5 border-t border-border/60 pt-8 text-base lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-5"><span><Shield className="mr-2 inline h-4 w-4 text-primary" />Independent · Crawler-owned</span><span><Globe className="mr-2 inline h-4 w-4 text-primary" />African-first intelligence</span></div>
            <span>© 2026 <span className="text-foreground">POI Foundation</span> · Made with <Heart className="inline h-4 w-4 text-primary" /> in Nigeria</span>
          </div>
        </div>
      </footer>
      <LocationSearch isOpen={showLocationSearch} onClose={() => setShowLocationSearch(false)} />
    </div>
  );
};

export default Index;