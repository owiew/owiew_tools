import { type ComponentChildren } from "preact";
import { Icon } from "../Icon";

/** Variante visual e ícone de cada tipo de aviso. */
const KIND = {
  info: { cls: "notice-info", icon: "info" },
  ok: { cls: "notice-ok", icon: "circle-check" },
  warn: { cls: "notice-warn", icon: "triangle-alert" },
  err: { cls: "notice-err", icon: "circle-alert" },
} as const;

/**
 * Aviso inline com ícone (nunca depende só de cor para comunicar gravidade).
 *
 * Onde: resultados de validação das ferramentas. Entradas: tipo e conteúdo.
 * Saída: bloco com role "alert" só para erros; os demais são texto normal.
 */
export function Notice({ kind, children }: { kind: keyof typeof KIND; children: ComponentChildren }) {
  const k = KIND[kind];
  return (
    <div class={`notice ${k.cls}`} {...(kind === "err" ? { role: "alert" } : {})}>
      <Icon name={k.icon} size={18} />
      <div>{children}</div>
    </div>
  );
}
