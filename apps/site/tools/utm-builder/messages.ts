import { type UtmWarning } from "@owiew/core";
import { type UtmStrings } from "./strings";

/**
 * Traduz os avisos do core (códigos) em frases no idioma da página.
 *
 * Onde: lista de avisos sob o resultado e coluna do lote. Entradas: avisos do
 * `buildUtmUrl` e textos do idioma. Saída: uma frase por aviso.
 */
export function warningTexts(warnings: readonly UtmWarning[], s: UtmStrings): string[] {
  return warnings.map((w) => {
    if (w.code === "scheme-assumed") return s.warnings.schemeAssumed;
    if (w.code === "utm-replaced") return s.warnings.replaced(w.keys.join(", "));
    return s.warnings.normalized(w.key, w.from, w.to);
  });
}
