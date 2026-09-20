import { motion } from "framer-motion";
import { ArrowRight, LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
}

const FeatureCard = ({ icon: Icon, title, description, delay = 0 }: FeatureCardProps) => (
  <motion.article
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ delay, duration: 0.45 }}
    className="group flex min-h-[250px] flex-col rounded-[28px] border border-border/70 bg-card/55 p-6 transition-all duration-300 hover:border-primary/35 hover:bg-card/80 hover:shadow-[0_0_28px_hsl(var(--primary)/0.08)] sm:min-h-[280px] sm:p-8"
  >
    <div className="flex items-start justify-between">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 transition-colors group-hover:bg-primary/15">
        <Icon className="h-8 w-8 text-primary" />
      </div>
      <ArrowRight className="h-6 w-6 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
    </div>
    <div className="mt-auto pt-12">
      <h3 className="font-display text-2xl font-semibold text-foreground">{title}</h3>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">{description}</p>
    </div>
  </motion.article>
);

export default FeatureCard;