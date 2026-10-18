import { serializeCsv } from "../csv/serialize";
import { type RsaCheck } from "./google-rsa";
import { type MetaCheck } from "./meta";

/**
 * Exporta a verificação de anúncio em CSV (plataforma, campo, posição, texto, contagem, limite, situação).
 *
 * O quê: uma linha por campo preenchido. Todo texto passa por `serializeCsv`,
 * que neutraliza CSV injection (=, +, -, @) e remove byte nulo.
 * Onde: botão "Exportar CSV" da ferramenta. Entradas: resultado do Google e/ou
 * do Meta (um dos dois pode ser null). Saída: texto CSV com BOM. Sem efeitos.
 */
export function adsToCsv(google: RsaCheck | null, meta: MetaCheck | null): string {
  const rows: string[][] = [["platform", "field", "position", "text", "length", "limit", "status"]];
  const status = (over: number): string => (over > 0 ? `over by ${over}` : "ok");
  if (google) {
    google.headlines.forEach((f, i) => { if (!f.empty) rows.push(["google", "headline", String(i + 1), f.text.trim(), String(f.length), String(f.limit), status(f.over)]); });
    google.descriptions.forEach((f, i) => { if (!f.empty) rows.push(["google", "description", String(i + 1), f.text.trim(), String(f.length), String(f.limit), status(f.over)]); });
    ([["path1", google.path1], ["path2", google.path2]] as const).forEach(([name, f]) => {
      if (!f.empty) rows.push(["google", name, "1", f.text.trim(), String(f.length), String(f.limit), status(f.over)]);
    });
  }
  if (meta) {
    for (const [name, f] of [["primary_text", meta.primary], ["headline", meta.headline], ["description", meta.description]] as const) {
      if (!f.empty) rows.push(["meta", name, "1", f.text.trim(), String(f.length), String(f.limit), status(f.over)]);
    }
  }
  return serializeCsv(rows, { bom: true });
}
