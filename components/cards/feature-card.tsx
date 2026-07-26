'use client';

import { motion } from 'framer-motion';
import { Link as LinkIcon, BarChart3, QrCode, Zap, Share2, Palette, Music, Award, LucideIcon } from 'lucide-react';
import { FeatureItem } from '@/types';
import { Badge } from '@/components/ui/badge';

const iconMap: Record<string, LucideIcon> = {
  Link: LinkIcon,
  BarChart3,
  QrCode,
  Zap,
  Share2,
  Palette,
  Music,
  Award,
};

interface FeatureCardProps {
  feature: FeatureItem;
  index: number;
}

export function FeatureCard({ feature, index }: FeatureCardProps) {
  const IconComponent = iconMap[feature.iconName] || LinkIcon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ scale: 1.03, rotate: index % 2 === 0 ? 1 : -1 }}
      className="rounded-3xl border-[3px] border-[#111111] bg-white p-7 shadow-[6px_6px_0px_0px_#111111] transition-all flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-5">
          <div
            className="p-4 rounded-2xl border-[3px] border-[#111111] shadow-[3px_3px_0px_0px_#111111]"
            style={{ backgroundColor: feature.bgColor }}
          >
            <IconComponent className="w-7 h-7 text-[#111111] stroke-[2.5]" />
          </div>
          {feature.badge && (
            <Badge variant="default" className="text-xs font-black">
              {feature.badge}
            </Badge>
          )}
        </div>
        <h3 className="text-2xl font-black text-[#111111] mb-2">{feature.title}</h3>
        <p className="text-base font-bold text-[#111111]/75 leading-relaxed">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
}
