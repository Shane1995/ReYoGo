import { PackageIcon, UtensilsIcon, GlassWaterIcon } from "lucide-react";

export type TypeConfig = {
  color: string;
  badgeClass: string;
  treeLine: string;
  icon: React.FC<{ className?: string }>;
};

export const KNOWN_TYPE_CONFIG: Record<string, TypeConfig> = {
  food: {
    color: "text-emerald-700 dark:text-emerald-400",
    badgeClass: "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300",
    treeLine: "border-emerald-200 dark:border-emerald-800",
    icon: UtensilsIcon,
  },
  drink: {
    color: "text-sky-700 dark:text-sky-400",
    badgeClass: "border-transparent bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300",
    treeLine: "border-sky-200 dark:border-sky-800",
    icon: GlassWaterIcon,
  },
  "non-perishable": {
    color: "text-amber-700 dark:text-amber-400",
    badgeClass: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300",
    treeLine: "border-amber-200 dark:border-amber-800",
    icon: PackageIcon,
  },
};

export const FALLBACK_PALETTE: TypeConfig[] = [
  { color: "text-violet-700 dark:text-violet-400", badgeClass: "border-transparent bg-violet-100 text-violet-800 dark:bg-violet-900/60 dark:text-violet-300", treeLine: "border-violet-200 dark:border-violet-800", icon: PackageIcon },
  { color: "text-rose-700 dark:text-rose-400", badgeClass: "border-transparent bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300", treeLine: "border-rose-200 dark:border-rose-800", icon: PackageIcon },
  { color: "text-teal-700 dark:text-teal-400", badgeClass: "border-transparent bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300", treeLine: "border-teal-200 dark:border-teal-800", icon: PackageIcon },
  { color: "text-orange-700 dark:text-orange-400", badgeClass: "border-transparent bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-300", treeLine: "border-orange-200 dark:border-orange-800", icon: PackageIcon },
];

export function getTypeConfig(type: string, allTypes: string[]): TypeConfig {
  if (KNOWN_TYPE_CONFIG[type]) return KNOWN_TYPE_CONFIG[type];
  const idx = allTypes.indexOf(type);
  return FALLBACK_PALETTE[idx % FALLBACK_PALETTE.length] ?? FALLBACK_PALETTE[0];
}
