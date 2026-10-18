/** Identificador de clique de uma plataforma de anúncios. */
export interface ClickIdInfo {
  /** Nome do parâmetro em minúsculas. */
  readonly param: string;
  readonly platform: string;
  /** O que o parâmetro faz, em inglês técnico curto (a UI traduz o resto). */
  readonly note: "click" | "ios-web-to-app" | "web-to-app" | "campaign-manager";
}

/** Tabela de identificadores de clique conhecidos (chave em minúsculas). */
const CLICK_IDS: Readonly<Record<string, ClickIdInfo>> = {
  gclid: { param: "gclid", platform: "Google Ads", note: "click" },
  gbraid: { param: "gbraid", platform: "Google Ads", note: "web-to-app" },
  wbraid: { param: "wbraid", platform: "Google Ads", note: "ios-web-to-app" },
  dclid: { param: "dclid", platform: "Google Campaign Manager / DV360", note: "campaign-manager" },
  fbclid: { param: "fbclid", platform: "Meta", note: "click" },
  ttclid: { param: "ttclid", platform: "TikTok", note: "click" },
  msclkid: { param: "msclkid", platform: "Microsoft Advertising", note: "click" },
  twclid: { param: "twclid", platform: "X", note: "click" },
  li_fat_id: { param: "li_fat_id", platform: "LinkedIn", note: "click" },
  epik: { param: "epik", platform: "Pinterest", note: "click" },
  sccid: { param: "sccid", platform: "Snapchat", note: "click" },
  yclid: { param: "yclid", platform: "Yandex", note: "click" },
};

/**
 * Identifica se um parâmetro é um identificador de clique conhecido.
 *
 * Onde: inspetor de URL, para cada parâmetro da query.
 * Entrada: nome do parâmetro (qualquer caixa). Saída: info ou undefined.
 */
export function identifyClickId(param: string): ClickIdInfo | undefined {
  return Object.hasOwn(CLICK_IDS, param.toLowerCase()) ? CLICK_IDS[param.toLowerCase()] : undefined;
}
