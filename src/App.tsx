import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ReferralGate from "@/components/ReferralGate";

// Lazy-loaded pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Policies = lazy(() => import("./pages/Policies"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Feedback = lazy(() => import("./pages/Feedback"));
const Auth = lazy(() => import("./pages/Auth"));
const Referral = lazy(() => import("./pages/Referral"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const TrendingContent = lazy(() => import("./pages/TrendingContent"));
const Waitlist = lazy(() => import("./pages/Waitlist"));
const Premium = lazy(() => import("./pages/Premium"));
const BusinessDashboard = lazy(() => import("./pages/BusinessDashboard"));
const SharedSearch = lazy(() => import("./pages/SharedSearch"));
const KnowledgeVault = lazy(() => import("./pages/KnowledgeVault"));
const POIPointsDashboard = lazy(() => import("./pages/POIPointsDashboard"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public routes */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/referral" element={<Referral />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/policies" element={<Policies />} />
              <Route path="/trending/:slug" element={<TrendingContent />} />
              <Route path="/waitlist" element={<Waitlist />} />
              <Route path="/premium" element={<Premium />} />
              <Route path="/business" element={<BusinessDashboard />} />
              <Route path="/shared/:slug" element={<SharedSearch />} />
              <Route path="/vaults/:slug" element={<KnowledgeVault />} />
              <Route path="/points" element={<ReferralGate><POIPointsDashboard /></ReferralGate>} />

              {/* Protected routes */}
              <Route path="/" element={<ReferralGate><Index /></ReferralGate>} />
              <Route path="/search" element={<ReferralGate><SearchResults /></ReferralGate>} />
              <Route path="/about" element={<ReferralGate><About /></ReferralGate>} />
              <Route path="/contact" element={<ReferralGate><Contact /></ReferralGate>} />
              <Route path="/feedback" element={<ReferralGate><Feedback /></ReferralGate>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
