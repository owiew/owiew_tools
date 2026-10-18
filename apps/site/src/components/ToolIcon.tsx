import {
  BadgeDollarSign, Calculator, ChartLine, Combine, Eye, FlaskConical, Funnel, HandCoins, KeyRound,
  LayoutTemplate, Link, Link2, ListFilter, Megaphone, MessageCircle, Percent, QrCode, ScanSearch, Search,
  Tags, Target, TrendingUp, Users, Wallet, Wrench,
} from "lucide-preact";
import { type ComponentType } from "preact";

/** Props aceitas pelos ícones Lucide. */
type IconComponent = ComponentType<{ size?: number | string; "aria-hidden"?: "true"; strokeWidth?: number }>;

/**
 * Ícones permitidos em `tool.json` (campo `icon`) e em `categories.json`.
 * Este arquivo só é importado por componentes .astro (renderizados no build),
 * então não entra no bundle do navegador. Falta um ícone Lucide? Acrescente
 * uma linha no FIM do mapa (ISC, mesmo pacote); o `check:tools` valida o nome.
 */
const TOOL_ICONS: Record<string, IconComponent> = {
  calculator: Calculator,
  "badge-dollar-sign": BadgeDollarSign,
  "chart-line": ChartLine,
  combine: Combine,
  eye: Eye,
  "flask-conical": FlaskConical,
  funnel: Funnel,
  "hand-coins": HandCoins,
  "key-round": KeyRound,
  "layout-template": LayoutTemplate,
  link: Link,
  "link-2": Link2,
  "list-filter": ListFilter,
  megaphone: Megaphone,
  "message-circle": MessageCircle,
  percent: Percent,
  "qr-code": QrCode,
  "scan-search": ScanSearch,
  search: Search,
  tags: Tags,
  target: Target,
  "trending-up": TrendingUp,
  users: Users,
  wallet: Wallet,
  wrench: Wrench,
};

/**
 * Ícone decorativo de ferramenta ou categoria (SVG com currentColor, aria-hidden).
 *
 * Onde: ToolCard, Header e Footer (somente .astro). Entradas: nome e tamanho.
 * Saída: SVG; nome desconhecido não renderiza nada (o check:tools reprova).
 */
export function ToolIcon({ name, size = 20 }: { name: string; size?: number }) {
  const Cmp = TOOL_ICONS[name];
  return Cmp ? <Cmp size={size} aria-hidden="true" strokeWidth={1.75} /> : null;
}
