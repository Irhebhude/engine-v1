import { motion } from "framer-motion";
import { Brain, Target, Eye, Zap, Shield, Lock, Gauge, Users, Sparkles, Search, BarChart3, Layout } from "lucide-react";
import Header from "@/components/Header";
import AdSense from "@/components/AdSense";

const CORE_VALUES = [
  { icon: Sparkles, label: "Innovation" },
  { icon: Target, label: "Accuracy" },
  { icon: Eye, label: "Transparency" },
  { icon: Shield, label: "Privacy" },
  { icon: Lock, label: "Security" },
  { icon: Gauge, label: "Performance" },
  { icon: Users, label: "User-first design" },
];

const DIFFERENTIATORS = [
  { icon: Search, text: "Real-time web discovery" },
  { icon: BarChart3, text: "Intelligent search ranking" },
  { icon: Brain, text: "Advanced AI-powered insights" },
  { icon: Layout, text: "Clean and simple interface" },
  { icon: Zap, text: "High-speed performance" },
  { icon: Shield, text: "Strong privacy and security focus" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

const About = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <main className="pt-20 pb-16 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            About <span className="gradient-text">SEARCH-POI</span>
          </h1>
          <div className="h-1 w-16 mx-auto rounded-full bg-primary/60" />
        </motion.div>

        {/* Intro */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="glass rounded-2xl p-6 sm:p-8 mb-10 border border-border/30">
          <p className="text-muted-foreground leading-relaxed mb-4">
            <span className="text-foreground font-semibold">SEARCH-POI</span> is a next-generation real-time web search engine built to transform the way people explore, discover, and interact with information online.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Developed by <span className="text-foreground font-semibold">Prosper Ozoya Irhebhude</span>, Founder of <span className="text-primary font-semibold">POI FOUNDATION</span>, SEARCH-POI combines advanced intelligence, real-time data processing, and modern user experience to deliver fast, accurate, and meaningful search results across the entire internet.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Our mission is to build a smarter, faster, and more powerful search platform that goes beyond traditional keyword searching. SEARCH-POI uses intelligent ranking, real-time indexing, deep analysis, and user-focused design to provide a truly advanced discovery experience.
          </p>
        </motion.section>

        {/* Vision & Mission */}
        <div className="grid sm:grid-cols-2 gap-6 mb-10">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }} className="glass rounded-2xl p-6 border border-border/30">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Our Vision</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              To create the world's most intelligent and trusted digital discovery platform.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass rounded-2xl p-6 border border-border/30">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Our Mission</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              To empower users with fast, accurate, and intelligent access to global information using advanced technology and innovation.
            </p>
          </motion.div>
        </div>

        {/* Core Values */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mb-10">
          <h2 className="text-2xl font-bold text-foreground text-center mb-6">Core Values</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {CORE_VALUES.map((v, i) => (
              <motion.div
                key={v.label}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="glass rounded-xl px-4 py-3 flex items-center gap-2 border border-border/30"
              >
                <v.icon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{v.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* What makes us different */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="mb-10">
          <h2 className="text-2xl font-bold text-foreground text-center mb-6">What Makes SEARCH-POI Different</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DIFFERENTIATORS.map((d, i) => (
              <motion.div
                key={d.text}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="glass rounded-xl p-4 flex items-start gap-3 border border-border/30"
              >
                <d.icon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-muted-foreground">{d.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <AdSense adSlot="9944378861" adFormat="auto" className="mb-10" />

        {/* Founder */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="glass rounded-2xl p-6 sm:p-8 border border-primary/20 text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Users className="w-7 h-7 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-1">Prosper Ozoya Irhebhude</h3>
          <p className="text-primary font-medium text-sm mb-3">Founder, POI FOUNDATION</p>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto leading-relaxed">
            A technology innovator passionate about building intelligent digital platforms that empower users and redefine modern web experiences.
          </p>
        </motion.section>

        {/* Footer credit */}
        <div className="text-center text-xs text-muted-foreground">
          <p>SEARCH-POI • Created & Owned by <span className="text-foreground">Prosper Ozoya Irhebhude</span></p>
          <p className="mt-1">Founder of <span className="text-primary">POI FOUNDATION</span></p>
        </div>
      </div>
    </main>
  </div>
);

export default About;
