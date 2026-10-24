import type { ComponentType, SVGProps } from 'react';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Baby,
  Banknote,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Briefcase,
  Bus,
  Calculator,
  CalendarCheck,
  CalendarDays,
  Car,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CircleHelp,
  ClipboardList,
  Coins,
  Compass,
  Download,
  ExternalLink,
  FileText,
  Filter,
  GraduationCap,
  Heart,
  HeartHandshake,
  Home,
  Info,
  KeyRound,
  Leaf,
  LifeBuoy,
  Lightbulb,
  ListChecks,
  LockKeyhole,
  Menu,
  Minus,
  Pencil,
  PiggyBank,
  Plus,
  Printer,
  Receipt,
  RotateCcw,
  Save,
  Scale,
  ScrollText,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Stethoscope,
  Sunrise,
  Trash2,
  TrendingUp,
  Upload,
  User,
  Users,
  Wallet,
  X,
} from 'lucide-react';

export type IconName =
  | 'activity'
  | 'arrow-left'
  | 'arrow-right'
  | 'baby'
  | 'banknote'
  | 'book-open'
  | 'bookmark'
  | 'bookmark-check'
  | 'briefcase'
  | 'bus'
  | 'calculator'
  | 'calendar-check'
  | 'calendar-days'
  | 'car'
  | 'check'
  | 'chevron-down'
  | 'chevron-left'
  | 'chevron-right'
  | 'circle-alert'
  | 'circle-check'
  | 'circle-help'
  | 'clipboard-list'
  | 'coins'
  | 'compass'
  | 'download'
  | 'external-link'
  | 'file-text'
  | 'filter'
  | 'graduation-cap'
  | 'heart'
  | 'heart-handshake'
  | 'home'
  | 'info'
  | 'key-round'
  | 'leaf'
  | 'life-buoy'
  | 'lightbulb'
  | 'list-checks'
  | 'lock-keyhole'
  | 'menu'
  | 'minus'
  | 'pencil'
  | 'piggy-bank'
  | 'plus'
  | 'printer'
  | 'receipt'
  | 'rotate-ccw'
  | 'save'
  | 'scale'
  | 'scroll-text'
  | 'search'
  | 'shield-check'
  | 'sliders-horizontal'
  | 'stethoscope'
  | 'sunrise'
  | 'trash-2'
  | 'trending-up'
  | 'upload'
  | 'user'
  | 'users'
  | 'wallet'
  | 'x';

type LucideComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string; strokeWidth?: number | string }>;

const ICONS: Record<IconName, LucideComponent> = {
  activity: Activity,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  baby: Baby,
  banknote: Banknote,
  'book-open': BookOpen,
  bookmark: Bookmark,
  'bookmark-check': BookmarkCheck,
  briefcase: Briefcase,
  bus: Bus,
  calculator: Calculator,
  'calendar-check': CalendarCheck,
  'calendar-days': CalendarDays,
  car: Car,
  check: Check,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'circle-alert': CircleAlert,
  'circle-check': CircleCheck,
  'circle-help': CircleHelp,
  'clipboard-list': ClipboardList,
  coins: Coins,
  compass: Compass,
  download: Download,
  'external-link': ExternalLink,
  'file-text': FileText,
  filter: Filter,
  'graduation-cap': GraduationCap,
  heart: Heart,
  'heart-handshake': HeartHandshake,
  home: Home,
  info: Info,
  'key-round': KeyRound,
  leaf: Leaf,
  'life-buoy': LifeBuoy,
  lightbulb: Lightbulb,
  'list-checks': ListChecks,
  'lock-keyhole': LockKeyhole,
  menu: Menu,
  minus: Minus,
  pencil: Pencil,
  'piggy-bank': PiggyBank,
  plus: Plus,
  printer: Printer,
  receipt: Receipt,
  'rotate-ccw': RotateCcw,
  save: Save,
  scale: Scale,
  'scroll-text': ScrollText,
  search: Search,
  'shield-check': ShieldCheck,
  'sliders-horizontal': SlidersHorizontal,
  stethoscope: Stethoscope,
  sunrise: Sunrise,
  'trash-2': Trash2,
  'trending-up': TrendingUp,
  upload: Upload,
  user: User,
  users: Users,
  wallet: Wallet,
  x: X,
};

interface IconProps {
  name: IconName | string;
  size?: number;
  className?: string;
  strokeWidth?: number;
  'aria-hidden'?: boolean;
  title?: string;
}

/** Simple line icon. Decorative by default (aria-hidden) unless a title is given. */
export function Icon({ name, size = 18, className, strokeWidth = 1.75, title }: IconProps) {
  const Component = ICONS[name as IconName] || Info;
  return <Component size={size} className={className} strokeWidth={strokeWidth} aria-hidden={title ? undefined : true} focusable={false} role={title ? 'img' : undefined} aria-label={title} />;
}
