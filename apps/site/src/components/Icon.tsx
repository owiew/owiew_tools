import {
  ArrowRight, Check, ChevronRight, CircleAlert, CircleCheck, CodeXml, Copy, Download, ExternalLink,
  Info, Moon, Plus, Save, Search, ShieldCheck, Sun, Trash2, TriangleAlert,
} from "lucide-preact";
import { type ComponentType } from "preact";

/** Props aceitas pelos ícones Lucide (tamanho por token CSS, cor herdada). */
type IconComponent = ComponentType<{ size?: number | string; "aria-hidden"?: "true"; class?: string; strokeWidth?: number }>;

/** Ícones de INTERFACE usados no site; os de ferramenta ficam em ToolIcon.tsx (importar só o que usa mantém o bundle pequeno). */
const ICONS: Record<string, IconComponent> = {
  "arrow-right": ArrowRight, check: Check, "chevron-right": ChevronRight, "circle-alert": CircleAlert,
  "circle-check": CircleCheck, "code-xml": CodeXml, copy: Copy, download: Download,
  "external-link": ExternalLink, info: Info, moon: Moon, plus: Plus, save: Save, search: Search,
  "shield-check": ShieldCheck, sun: Sun, "trash-2": Trash2, "triangle-alert": TriangleAlert,
};

/**
 * Renderiza um ícone Lucide decorativo (SVG com currentColor, aria-hidden).
 *
 * O quê: nunca emoji; o tamanho vem da prop `size` (px) e a cor do texto pai.
 * Onde: componentes .astro (renderizado só no servidor, zero JS) e ilhas Preact.
 * Entradas: nome do ícone (chave de ICONS) e tamanho. Saída: SVG; nome
 * desconhecido renderiza nada (o check:tools reprova nome inválido).
 */
export function Icon({ name, size = 20, class: cls }: { name: string; size?: number; class?: string }) {
  const Cmp = ICONS[name];
  if (!Cmp) return null;
  return <Cmp size={size} aria-hidden="true" strokeWidth={1.75} {...(cls ? { class: cls } : {})} />;
}
