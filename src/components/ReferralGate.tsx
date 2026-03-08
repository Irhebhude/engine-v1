import { motion } from "framer-motion";
import { Lock, Gift, Users, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const ADMIN_EMAIL = "prosperozoya50@gmail.com";

interface ReferralGateProps {
  children: React.ReactNode;
}

const ReferralGate = ({ children }: ReferralGateProps) => {
  const { user, profile, loading } = useAuth();

  if (loading) return <>{children}</>;

  // Admin bypass
  if (user?.email === ADMIN_EMAIL) return <>{children}</>;

  // Not logged in — show sign up gate
  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Unlock <span className="text-primary">SEARCH-POI</span>
          </h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            To use SEARCH-POI, sign up and refer <strong className="text-foreground">10 real users</strong> who verify their email and use the platform. Once done, your access unlocks automatically!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/auth"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
            >
              Sign Up Now
              <ExternalLink className="w-4 h-4" />
            </Link>
            <Link
              to="/referral"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-primary/30 text-primary font-semibold hover:bg-primary/10 transition-colors"
            >
              <Gift className="w-4 h-4" />
              How It Works
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Logged in but hasn't referred 10 verified users — check profile
  // We need to check referral count. We'll use a dedicated component that fetches this.
  return <ReferralCheck>{children}</ReferralCheck>;
};

const ReferralCheck = ({ children }: { children: React.ReactNode }) => {
  const { user, profile } = useAuth();
  const [unlocked, setUnlocked] = useState<boolean | null>(null);

  // Need useState and useEffect
  const { useState: us, useEffect: ue } = require("react");

  return <ReferralCheckInner>{children}</ReferralCheckInner>;
};

export default ReferralGate;
