import { Wifi, WifiOff, Database, MapPin } from 'lucide-react';
import { useOfflineStatus } from '@/hooks/use-offline-status';
import { motion, AnimatePresence } from 'framer-motion';

const OfflineStatusBar = () => {
  const { isOnline, isOfflineReady, poiCount } = useOfflineStatus();

  const bgClass = !isOnline
    ? 'bg-amber-500/90 text-amber-950'
    : isOfflineReady
      ? 'bg-emerald-500/20 text-emerald-400'
      : 'bg-muted/50 text-muted-foreground';

  const icon = !isOnline ? (
    <WifiOff className="w-3.5 h-3.5" />
  ) : isOfflineReady ? (
    <Database className="w-3.5 h-3.5" />
  ) : (
    <Wifi className="w-3.5 h-3.5" />
  );

  const label = !isOnline
    ? 'Mode: Offline — Using local database'
    : isOfflineReady
      ? `Mode: Offline Ready — ${poiCount} POIs cached`
      : 'Mode: Online — Sync data for offline use';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`fixed top-0 left-0 right-0 z-[60] flex items-center justify-center gap-2 py-1 text-xs font-medium ${bgClass} backdrop-blur-sm`}
      >
        {icon}
        <span>{label}</span>
        {isOfflineReady && (
          <span className="flex items-center gap-1 ml-2 opacity-70">
            <MapPin className="w-3 h-3" /> GPS Ready
          </span>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default OfflineStatusBar;
