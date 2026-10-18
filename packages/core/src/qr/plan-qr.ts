import { encode } from "uqr";
import { type Result, fail, ok } from "../result";
import { parseHttpUrl } from "../url/parse-http-url";
import { type UtmError, buildUtmUrl } from "../utm/build-utm-url";
import { DEFAULT_RULES } from "../utm/rules";
import { contrastRatio, parseHexColor } from "./contrast";
import { type QrMatrix, qrPathData, renderQrSvg } from "./render";

/** Nível de correção de erro: L 7%, M 15%, Q 25%, H 30% dos dados recuperáveis. */
export type EccLevel = "L" | "M" | "Q" | "H";

/** Níveis aceitos, em ordem crescente de robustez. */
export const ECC_LEVELS: readonly EccLevel[] = ["L", "M", "Q", "H"];

/** Limites das opções (px do lado da imagem e módulos de margem). */
export const MIN_SIZE_PX = 128;
export const MAX_SIZE_PX = 2048;
export const MAX_MARGIN = 16;
/** Zona de silêncio mínima da especificação do QR Code (ISO/IEC 18004). */
export const RECOMMENDED_MARGIN = 4;
/** Contraste mínimo exigido entre módulos e fundo (razão WCAG). */
export const MIN_CONTRAST = 4;
/** Tamanho máximo do texto codificado. */
export const MAX_PAYLOAD_CHARS = 2000;

/** UTM opcional anexada ao link antes de gerar o código. */
export interface QrUtm {
  readonly source: string;
  readonly medium: string;
  readonly campaign: string;
  readonly term?: string;
  readonly content?: string;
}

/** Entrada do planejamento: campos crus do formulário. */
export interface QrInput {
  readonly url: string;
  readonly utm?: QrUtm;
  readonly ecc: EccLevel;
  readonly sizePx: number;
  readonly margin: number;
  readonly fg: string;
  readonly bg: string;
}

/** Erros que impedem o QR Code. */
export type QrError =
  | UtmError
  | "invalid-ecc"
  | "invalid-size"
  | "invalid-margin"
  | "invalid-color"
  | "low-contrast"
  | "size-too-small"
  | "too-long";

/** Avisos que não impedem o QR Code. */
export type QrWarning = "scheme-assumed" | "margin-small" | "inverted" | "size-rounded";

/** QR Code planejado, com tudo que a UI precisa para mostrar e baixar. */
export interface QrPlan {
  /** Texto codificado (o link final, com UTM quando houver). */
  readonly payload: string;
  readonly matrix: QrMatrix;
  readonly version: number;
  readonly margin: number;
  /** Pixels por módulo inteiros (PNG nítido, sem suavização). */
  readonly pixelsPerModule: number;
  /** Lado real da imagem: pixelsPerModule x (módulos + 2 x margem). */
  readonly imageSizePx: number;
  readonly contrast: number;
  readonly path: string;
  readonly svg: string;
  readonly warnings: readonly QrWarning[];
}

/**
 * Resolve o link que vira QR Code, com ou sem UTM (padrão da casa).
 *
 * Onde: etapa interna de `planQr`. Entradas: link cru, UTM opcional, lista de
 * avisos. Saída: Result com o texto final do link.
 */
function resolvePayload(input: QrInput, warnings: QrWarning[]): Result<string, UtmError> {
  const u = input.utm;
  const hasUtm = u !== undefined && [u.source, u.medium, u.campaign, u.term ?? "", u.content ?? ""].some((v) => v.trim() !== "");
  if (hasUtm) {
    const built = buildUtmUrl(input.url, u, DEFAULT_RULES);
    if (!built.ok) return fail(built.error);
    if (built.value.warnings.some((w) => w.code === "scheme-assumed")) warnings.push("scheme-assumed");
    return ok(built.value.url);
  }
  const parsed = parseHttpUrl(input.url);
  if (!parsed.ok) {
    const map = { empty: "empty-url", "too-long": "url-too-long", invalid: "invalid-url", "unsupported-scheme": "unsupported-scheme" } as const;
    return fail(map[parsed.error]);
  }
  if (parsed.value.assumedScheme) warnings.push("scheme-assumed");
  return ok(parsed.value.url.href);
}

/**
 * Valida as opções visuais (tamanho, margem, correção de erro, cores, contraste).
 *
 * Onde: etapa interna de `planQr`. Entrada: opções cruas. Saída: Result com as
 * cores normalizadas e o contraste calculado, ou o primeiro erro.
 */
function checkOptions(input: QrInput, warnings: QrWarning[]): Result<{ contrast: number }, QrError> {
  if (!ECC_LEVELS.includes(input.ecc)) return fail("invalid-ecc");
  if (!Number.isInteger(input.sizePx) || input.sizePx < MIN_SIZE_PX || input.sizePx > MAX_SIZE_PX) return fail("invalid-size");
  if (!Number.isInteger(input.margin) || input.margin < 0 || input.margin > MAX_MARGIN) return fail("invalid-margin");
  const fg = parseHexColor(input.fg);
  const bg = parseHexColor(input.bg);
  if (!fg.ok || !bg.ok) return fail("invalid-color");
  const contrast = contrastRatio(fg.value, bg.value);
  if (contrast < MIN_CONTRAST) return fail("low-contrast");
  const lum = (c: readonly number[]): number => 0.2126 * (c[0] ?? 0) + 0.7152 * (c[1] ?? 0) + 0.0722 * (c[2] ?? 0);
  if (lum(fg.value) > lum(bg.value)) warnings.push("inverted");
  if (input.margin < RECOMMENDED_MARGIN) warnings.push("margin-small");
  return ok({ contrast });
}

/**
 * Planeja o QR Code inteiro: link (com UTM), opções, matriz, SVG e tamanho.
 *
 * O quê: tudo roda local; a matriz vem da biblioteca `uqr` (MIT, sem dependências
 * nem rede) e o SVG/PNG são desenhados aqui a partir dela. Recusa contraste
 * abaixo de 4:1 porque o código deixa de ser lido.
 * Onde: ilha do gerador de QR Code, a cada alteração. Entrada: campos crus.
 * Saída: Result com o plano ou código de erro estável. Sem efeitos.
 */
export function planQr(input: QrInput): Result<QrPlan, QrError> {
  const warnings: QrWarning[] = [];
  const payload = resolvePayload(input, warnings);
  if (!payload.ok) return fail(payload.error);
  const opts = checkOptions(input, warnings);
  if (!opts.ok) return fail(opts.error);
  if (payload.value.length > MAX_PAYLOAD_CHARS) return fail("too-long");
  let version: number;
  let data: boolean[][];
  try {
    const r = encode(payload.value, { ecc: input.ecc, border: 0, boostEcc: false });
    version = r.version;
    data = r.data;
  } catch {
    return fail("too-long");
  }
  const modules = data.length + input.margin * 2;
  const pixelsPerModule = Math.floor(input.sizePx / modules);
  if (pixelsPerModule < 1) return fail("size-too-small");
  const imageSizePx = pixelsPerModule * modules;
  if (imageSizePx !== input.sizePx) warnings.push("size-rounded");
  const fg = input.fg.trim().toLowerCase();
  const bg = input.bg.trim().toLowerCase();
  return ok({
    payload: payload.value, matrix: data, version, margin: input.margin, pixelsPerModule, imageSizePx,
    contrast: opts.value.contrast, path: qrPathData(data, input.margin),
    svg: renderQrSvg(data, { margin: input.margin, sizePx: imageSizePx, fg, bg }), warnings,
  });
}
