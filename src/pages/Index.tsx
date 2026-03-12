import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, Zap, Globe, Shield, Cpu, Layers, MapPin } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import FeatureCard from "@/components/FeatureCard";
import Header from "@/components/Header";
import AdSense from "@/components/AdSense";
import SEOHead from "@/components/SEOHead";
import LiveActivityFeed from "@/components/LiveActivityFeed";
import TrendingTopics from "@/components/TrendingTopics";
import LocationSearch from "@/components/LocationSearch";
import heroBg from "@/assets/hero-bg.jpg";

const FEATURES = [
  { icon: Brain, title: "AI-First Search", description: "Direct intelligent answers instead of 10 blue links. Understands meaning, intent, and context." },
  { icon: Zap, title: "Real-Time Results", description: "Live data streaming. Breaking news, stock prices, sports scores — updated in real-time." },
  { icon: Globe, title: "Deep Web Understanding", description: "Semantic analysis across billions of pages. Finds answers others miss." },
  { icon: Shield, title: "Privacy First", description: "No tracking. No profiling. No selling your data. Search freely." },
  { icon: Cpu, title: "Multi-Model AI", description: "Powered by multiple AI models working in parallel for the most accurate answers." },
  { icon: Layers, title: "Research Mode", description: "One query generates comprehensive, academic-quality research reports." },
];

const Index = () => {
  const navigate = useNavigate();
  const [showLocationSearch, setShowLocationSearch] = useState(false);

  const handleSearch = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <SEOHead
        title="SEARCH-POI — AI-Powered Search Engine | Smarter Than Google"
        description="Get instant AI answers, deep research reports, tech blueprints & real-time web results. The next-gen search engine by POI Foundation."
        path="/"
      />
      <Header />

      {/* Hero background */}
      <div className="absolute inset-0 z-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 z-0 grid-bg opacity-30" />

      {/* Main content */}
      <main className="relative z-10 pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs text-primary font-medium mb-6"
            >
              <Zap className="w-3 h-3" />
              Next-Gen AI Search Engine
            </motion.div>

            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-4">
              <span className="text-foreground">SEARCH</span>
              <span className="gradient-text">-POI</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              The world's most intelligent search engine. Ask anything — get
              <span className="text-foreground font-medium"> direct AI answers</span>, not just links.
            </p>

            <SearchBar onSearch={handleSearch} />

            <div className="flex items-center justify-center gap-4 mt-4">
              <p className="text-xs text-muted-foreground">
                Powered by multi-model AI • Built by POI Foundation
              </p>
              <button
                onClick={() => setShowLocationSearch(true)}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
              >
                <MapPin className="w-3 h-3" />
                Location Search
              </button>
            </div>
          </motion.div>

          {/* Real-time widgets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12"
          >
            <TrendingTopics />
            <LiveActivityFeed />
          </motion.div>

          {/* Features grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {FEATURES.map((feature, i) => (
              <FeatureCard key={feature.title} {...feature} delay={0.1 * i} />
            ))}
          </div>

          {/* Ad placement */}
          <AdSense adSlot="9944378861" adFormat="horizontal" className="mt-12" />

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center mt-20 text-xs text-muted-foreground"
          >
            <p>Founded by <span className="text-foreground">Prosper Ozoya Irhebhude</span> • POI Foundation</p>
            <p className="mt-1">AI-First Search • Privacy Focused • Open Intelligence</p>
            <p className="mt-2"><a href="/policies" className="text-primary hover:underline">Policies & Governance</a></p>
          </motion.div>
        </div>
      </main>

      <LocationSearch isOpen={showLocationSearch} onClose={() => setShowLocationSearch(false)} />
    </div>
  );
};

export default Index;
