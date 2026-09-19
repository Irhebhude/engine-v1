import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, Zap, Globe, Shield, Cpu, Layers, MapPin, Crown, Building2, TrendingUp, BarChart3, LineChart, Radio, Database, Code } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import FeatureCard from "@/components/FeatureCard";
import Header from "@/components/Header";
import AdSense from "@/components/AdSense";
import SEOHead from "@/components/SEOHead";
import LiveActivityFeed from "@/components/LiveActivityFeed";
import TrendingTopics from "@/components/TrendingTopics";
import LocationSearch from "@/components/LocationSearch";
import FintechDashboard from "@/components/FintechDashboard";
import OfflineStatusBar from "@/components/OfflineStatusBar";
import LiveRates from "@/components/LiveRates";
import heroBg from "@/assets/hero-bg.jpg";
import { Button } from "@/components/ui/button";

const FEATURES = [
  { icon: Brain, title: "AI-First Search", description: "Direct intelligent answers instead of 10 blue links. Understands meaning, intent, and context." },
  { icon: Zap, title: "Real-Time Results", description: "Live data streaming. Breaking news, stock prices, sports scores — updated in real-time." },
  { icon: Globe, title: "Deep Web Understanding", description: "Semantic analysis across billions of pages. Finds answers others miss." },
  { icon: Shield, title: "Privacy First", description: "No tracking. No profiling. No selling your data. Search freely." },
  { icon: Cpu, title: "Multi-Model AI", description: "Powered by multiple AI models working in parallel for the most accurate answers." },
  { icon: Layers, title: "Research Mode", description: "One query generates comprehensive, academic-quality research reports." },
  { icon: TrendingUp, title: "Fintech Intelligence", description: "Real-time market analytics, FX rates, and commodity tracking for smart financial decisions." },
  { icon: BarChart3, title: "Business Analytics", description: "Custom dashboards tracking key metrics, user engagement, and market performance." },
  { icon: LineChart, title: "Market Analysis", description: "AI-driven market insights, trend predictions, and competitive intelligence reports." },
];

const FINTECH_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "SEARCH-POI",
  url: "https://engine-v1.lovable.app/",
  description: "AI-powered intelligence ecosystem for search, fintech analytics, market analysis, and business verification. Real-time data streaming with multi-model AI.",
  applicationCategory: "SearchApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "NGN",
    description: "Free AI-powered search with premium tier at ₦1,000/month",
  },
  creator: {
    "@type": "Organization",
    name: "POI Foundation",
    founder: { "@type": "Person", name: "Prosper Ozoya Irhebhude" },
  },
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: "https://engine-v1.lovable.app/search?q={search_term_string}" },
    "query-input": "required name=search_term_string",
  },
  featureList: [
    "AI-Powered Search Engine",
    "Real-Time Market Analytics",
    "Fintech Intelligence Dashboard",
    "Business Verification System",
    "Knowledge Vault Repository",
    "Commodity Price Tracking",
    "Multi-Model AI Processing",
    "Location-Based Services",
  ],
};

const Index = () => {
  const navigate = useNavigate();
  const [showLocationSearch, setShowLocationSearch] = useState(false);

  const handleSearch = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <SEOHead
        title="SEARCH-POI — AI Search Engine & Fintech Intelligence"
        description="Next-gen AI search with real-time market analytics, fintech intelligence, business verification & deep research. Instant answers powered by multi-model AI. Try free."
        path="/"
        keywords={[
          "AI search engine", "fintech intelligence", "market analytics",
          "real-time search", "business verification", "commodity tracking",
          "AI answers", "deep research", "SEARCH-POI", "POI Foundation",
          "alternative to Google", "Nigerian fintech", "FX rates",
          "price comparison", "knowledge vault", "data visualization",
        ]}
        jsonLd={FINTECH_JSON_LD}
      />
      <Header />

      <div className="absolute inset-x-0 top-0 z-0 h-[720px]">
        <img
          src={heroBg}
          alt="SEARCH-POI AI-powered search engine background"
          className="w-full h-full object-cover opacity-10"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
      </div>

      <div className="absolute inset-x-0 top-0 z-0 h-[720px] grid-bg opacity-20" />

      {/* Main content */}
      <main className="relative z-10 pt-20 sm:pt-28 pb-24 px-3 sm:px-4">
        <div className="mx-auto max-w-6xl">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center min-h-[560px] flex flex-col items-center justify-center py-10 sm:py-16"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs text-primary font-medium mb-6"
            >
              <Shield className="w-3.5 h-3.5" />
              Independent · Owned by POI Foundation
            </motion.div>
            <img src="/pwa-icon.png" alt="SEARCH-POI logo" className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl object-cover border border-primary/30 mb-5 shadow-[0_0_36px_hsl(var(--primary)/0.18)]" />
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-normal mb-3">
              <span className="text-foreground">SEARCH</span>
              <span className="gradient-text">-POI</span>
            </h1>
            <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-7 leading-relaxed px-2">
              Don't search. <span className="text-foreground">Ask.</span> The reasoning engine for African intelligence.
            </p>
            <div className="w-full max-w-3xl"><SearchBar onSearch={handleSearch} /></div>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              {["Lagos businesses", "Fuel price today", "FX rate USD/NGN", "Startup ideas 2026"].map((query) => (
                <Button key={query} variant="outline" size="sm" className="rounded-full border-border/70 bg-card/40 text-muted-foreground" onClick={() => handleSearch(query)}>{query}</Button>
              ))}
              <Button onClick={() => setShowLocationSearch(true)} variant="outline" size="sm" className="rounded-full border-primary/40 text-primary"><MapPin /> Near me</Button>
            </div>
            <p className="workspace-label mt-7">SEARCH-POI ENGINE V1 · MULTI-STEP REASONING</p>
          </motion.div>

          <section aria-labelledby="signal-heading" className="mb-6">
            <div className="flex items-end justify-between mb-3 px-1">
              <div><p className="workspace-label">Live signal desk</p><h2 id="signal-heading" className="text-xl font-semibold">What Africa is asking now</h2></div>
              <Radio className="w-5 h-5 text-primary animate-pulse" />
            </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-3"
          >
            <TrendingTopics />
            <LiveActivityFeed />
          </motion.div>
          </section>

          <section aria-labelledby="intelligence-heading" className="mb-6">
            <div className="mb-3 px-1"><p className="workspace-label">Intelligence feeds</p><h2 id="intelligence-heading" className="text-xl font-semibold">Live markets, models and space</h2></div>
            <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-3"
          >
            <FintechDashboard />
            </motion.div>

          {/* Live rates + offline readiness */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="grid grid-cols-1 lg:grid-cols-[0.72fr_1.28fr] gap-3"
          >
            <OfflineStatusBar />
            <LiveRates />
            </motion.div>
          </section>

          <section aria-labelledby="capabilities-heading" className="mt-8">
            <div className="mb-3 px-1"><p className="workspace-label">System capabilities</p><h2 id="capabilities-heading" className="text-2xl sm:text-3xl font-semibold">One workspace. <span className="gradient-text">Every answer.</span></h2></div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {FEATURES.map((feature, i) => (
              <FeatureCard key={feature.title} {...feature} delay={0.08 * i} />
            ))}
          </div>
          </section>

          {/* Premium & Business CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8"
          >
            <Link
              to="/premium"
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors min-h-[52px]"
            >
              <Crown className="w-4 h-4" />
              Go Premium — ₦1,000/mo
            </Link>
            <Link
              to="/business"
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-secondary border border-border text-foreground font-semibold hover:bg-secondary/80 transition-colors min-h-[52px]"
            >
              <Building2 className="w-4 h-4" />
              Business Dashboard
            </Link>
          </motion.div>

          {/* Ad placement */}
          <AdSense adSlot="9944378861" adFormat="horizontal" className="mt-8 sm:mt-12" />

          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-16 border-t border-border/60 pt-8 text-sm text-muted-foreground"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
              <div className="col-span-2 sm:col-span-1"><div className="flex items-center gap-2 mb-3"><img src="/pwa-icon.png" alt="" className="w-9 h-9 rounded-lg" /><strong className="text-foreground text-lg">SEARCH<span className="text-primary">-POI</span></strong></div><p>Independent intelligence for African decisions.</p></div>
              <div><p className="workspace-label mb-3">Product</p><div className="space-y-2"><Link to="/search" className="block hover:text-primary">Search</Link><Link to="/insights" className="block hover:text-primary">Insights</Link><Link to="/pricing" className="block hover:text-primary">Pricing</Link></div></div>
              <div><p className="workspace-label mb-3">Foundation</p><div className="space-y-2"><Link to="/about" className="block hover:text-primary">About POI</Link><Link to="/contact" className="block hover:text-primary">Contact</Link><Link to="/policies" className="block hover:text-primary">Policies</Link></div></div>
              <div><p className="workspace-label mb-3">Build</p><div className="space-y-2"><Link to="/developer" className="flex items-center gap-1 hover:text-primary"><Code className="w-3 h-3" /> Developer API</Link><Link to="/business" className="block hover:text-primary">Business dashboard</Link><Link to="/referral" className="block hover:text-primary">Refer & earn</Link></div></div>
            </div>
            <div className="mt-8 pt-4 border-t border-border/50 flex flex-wrap gap-3 justify-between"><span><Database className="inline w-3.5 h-3.5 text-primary mr-1" /> Crawler-owned · African-first</span><span>© 2026 POI Foundation · Made in Nigeria</span></div>
          </motion.footer>
        </div>
      </main>

      <LocationSearch isOpen={showLocationSearch} onClose={() => setShowLocationSearch(false)} />
    </div>
  );
};

export default Index;
