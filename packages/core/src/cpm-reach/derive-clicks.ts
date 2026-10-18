import { type Result, fail, ok } from "../result";
import { mulDiv } from "./mul-div";

/** Cliques e CPC derivados. */
export interface ClicksCpc {
  readonly clicks: number | null;
  readonly cpcCents: number | null;
}

/**
 * Deriva cliques e CPC a partir de impressões, verba e CTR opcional.
 *
 * O quê: cliques = impressões x CTR (para baixo); CPC = verba / cliques (ao
 * centavo mais próximo). Com CTR ausente nada é derivado; com CTR zero (ou
 * cliques arredondados a zero) o CPC não existe e vira null, sem divisão por zero.
 * Onde: etapa final de `calcCpmReach`. Entradas: impressões, verba, CTR em
 * pontos-base ou undefined. Saída: Result com os dois campos. Nunca lança.
 */
export function deriveClicks(
  impressions: number,
  spendCents: number,
  ctrBp: number | undefined,
): Result<ClicksCpc, "overflow"> {
  if (ctrBp === undefined) return ok({ clicks: null, cpcCents: null });
  const clicks = mulDiv(impressions, ctrBp, 10_000, "floor");
  if (clicks === null) return fail("overflow");
  if (clicks === 0) return ok({ clicks, cpcCents: null });
  const cpc = mulDiv(spendCents, 1, clicks, "round");
  return cpc === null ? fail("overflow") : ok({ clicks, cpcCents: cpc });
}
