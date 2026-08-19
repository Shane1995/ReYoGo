import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboardIcon,
  PackageIcon,
  ReceiptIcon,
  CoinsIcon,
  TruckIcon,
  PackagePlusIcon,
  UploadIcon,
  ListPlusIcon,
  FolderPlusIcon,
  TagsIcon,
  TrendingUpIcon,
  HistoryIcon,
  ArrowUpDownIcon,
  FileBarChart2Icon,
  ShoppingCartIcon,
  AlertTriangleIcon,
  TrashIcon,
  BuildingIcon,
  PercentIcon,
  ArchiveIcon,
  ClipboardListIcon,
} from 'lucide-react';
import { appConfig } from '@/config/app.config';

const iconRegistry: Readonly<Record<string, LucideIcon>> = {
  LayoutDashboard: LayoutDashboardIcon,
  Package: PackageIcon,
  Receipt: ReceiptIcon,
  Coins: CoinsIcon,
  Truck: TruckIcon,
  PackagePlus: PackagePlusIcon,
  Upload: UploadIcon,
  ListPlus: ListPlusIcon,
  FolderPlus: FolderPlusIcon,
  Tags: TagsIcon,
  TrendingUp: TrendingUpIcon,
  History: HistoryIcon,
  ArrowUpDown: ArrowUpDownIcon,
  FileBarChart2: FileBarChart2Icon,
  ShoppingCart: ShoppingCartIcon,
  AlertTriangle: AlertTriangleIcon,
  Trash: TrashIcon,
  Building: BuildingIcon,
  Percent: PercentIcon,
  Archive: ArchiveIcon,
  ClipboardList: ClipboardListIcon,
};

export function resolveIcon(name: string): LucideIcon {
  const icon = iconRegistry[name];
  if (!icon) throw new Error(`Unknown icon key: "${name}"`);
  return icon;
}

export function resolvePath(name: string): string {
  const path = appConfig.routes[name];
  if (!path) throw new Error(`Unknown path key: "${name}"`);
  return path;
}
