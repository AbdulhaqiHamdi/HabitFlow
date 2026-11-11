import React from 'react';
import {
  Dumbbell,
  BookOpen,
  Laptop,
  Droplets,
  Heart,
  Wallet,
  Footprints,
  Moon,
  Smile,
  Target,
  Flame,
  Coffee,
  Music,
  Apple,
  Sparkles,
  CheckCircle2,
  ListTodo,
  Calendar,
  BarChart3,
  Trophy,
  Settings,
  ChevronRight,
  ChevronLeft,
  Plus,
  Pencil,
  Trash2,
  Archive,
  Download,
  Upload,
  RefreshCw,
  Sun,
  ShieldCheck,
  Check,
  LucideIcon,
} from 'lucide-react';

interface HabitIconProps {
  name: string;
  className?: string;
}

const ICON_MAP: Record<string, LucideIcon> = {
  dumbbell: Dumbbell,
  book: BookOpen,
  laptop: Laptop,
  droplet: Droplets,
  heart: Heart,
  wallet: Wallet,
  run: Footprints,
  moon: Moon,
  smile: Smile,
  target: Target,
  flame: Flame,
  coffee: Coffee,
  music: Music,
  apple: Apple,
  lotus: Sparkles,
};

export const HabitIcon: React.FC<HabitIconProps> = ({ name, className = 'w-5 h-5' }) => {
  const IconComponent = ICON_MAP[name?.toLowerCase()];
  if (IconComponent) {
    return <IconComponent className={className} />;
  }

  // If it's an emoji or unknown string
  if (name && name.length <= 4) {
    return <span className="inline-block text-base leading-none select-none">{name}</span>;
  }

  return <Target className={className} />;
};

export {
  Dumbbell,
  BookOpen,
  Laptop,
  Droplets,
  Heart,
  Wallet,
  Footprints,
  Moon,
  Smile,
  Target,
  Flame,
  Coffee,
  Music,
  Apple,
  Sparkles,
  CheckCircle2,
  ListTodo,
  Calendar,
  BarChart3,
  Trophy,
  Settings,
  ChevronRight,
  ChevronLeft,
  Plus,
  Pencil,
  Trash2,
  Archive,
  Download,
  Upload,
  RefreshCw,
  Sun,
  ShieldCheck,
  Check,
};
