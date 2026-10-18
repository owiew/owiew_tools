import { type Result } from "@owiew/core";
import {
  DEFAULT_NAMING_OPTIONS, MAX_BLOCK_INPUT, TEXT_BLOCK_KEYS, buildName, parseIsoDate,
  type BlockKey, type DateFormat, type NameOutput, type NamingError, type NamingInput, type NamingOptions, type TextBlockKey,
} from "@owiew/core/naming";
import { useMemo, useState } from "preact/hooks";
import { type Lang } from "../../src/i18n/locales";
import { BatchPanel } from "./BatchPanel";
import { BlocksPanel } from "./BlocksPanel";
import { OptionsPanel } from "./OptionsPanel";
import { ResultPanel } from "./ResultPanel";
import { strings } from "./strings";
import "./styles.css";

const DEFAULT_ORDER: readonly BlockKey[] = ["channel", "objective", "audience", "offer", "date"];
/** Data de exemplo fixa: o HTML do build é idêntico em todo build (sem relógio). */
const EXAMPLE_DATE = "2026-11-01";
const NO_LISTS: Record<TextBlockKey, string> = { channel: "", objective: "", audience: "", offer: "" };

/**
 * Ilha do Gerador de nomenclatura de campanhas.
 *
 * Onde: montada por Page.astro. Entrada: idioma da página. Fluxo: blocos, ordem,
 * data e padrão de escrita -> core.buildName (um nome) ou core.buildNameBatch
 * (combinações) -> copiar, decodificar e baixar CSV. Valores de exemplo vêm
 * preenchidos para a página já sair com um nome; o relógio só é lido no clique
 * de "usar a data de hoje". Nenhuma requisição de rede, nada é persistido.
 */
export default function CampaignNaming({ lang }: { lang: Lang }) {
  const s = strings(lang);
  const [tab, setTab] = useState<"single" | "batch">("single");
  const [order, setOrder] = useState<BlockKey[]>([...DEFAULT_ORDER]);
  const [values, setValues] = useState<Record<TextBlockKey, string>>({ ...s.example });
  const [dateIso, setDateIso] = useState(EXAMPLE_DATE);
  const [dateFormat, setDateFormat] = useState<DateFormat>("YYYYMMDD");
  const [options, setOptions] = useState<NamingOptions>(DEFAULT_NAMING_OPTIONS);
  const [lists, setLists] = useState<Record<TextBlockKey, string>>(NO_LISTS);

  const parsedDate = useMemo(() => (dateIso.trim() === "" ? null : parseIsoDate(dateIso)), [dateIso]);
  const dateError = parsedDate && !parsedDate.ok ? (s.dateErrors[parsedDate.error] ?? parsedDate.error) : null;
  const valueErrors = useMemo(() => {
    const out: Partial<Record<TextBlockKey, string>> = {};
    for (const k of TEXT_BLOCK_KEYS) if ([...values[k]].length > MAX_BLOCK_INPUT) out[k] = s.fieldTooLong;
    return out;
  }, [values, s]);
  const input: NamingInput = useMemo(
    () => ({ order, values, date: parsedDate && parsedDate.ok ? parsedDate.value : null, dateFormat, locale: lang, options }),
    [order, values, parsedDate, dateFormat, lang, options],
  );
  const result: Result<NameOutput, NamingError> = useMemo(() => buildName(input), [input]);

  return (
    <div class="tool-ui">
      <div class="btn-row" role="group" aria-label={`${s.single} / ${s.batch}`}>
        <button type="button" class={tab === "single" ? "btn btn-primary" : "btn"} aria-pressed={tab === "single"} onClick={() => setTab("single")}>{s.single}</button>
        <button type="button" class={tab === "batch" ? "btn btn-primary" : "btn"} aria-pressed={tab === "batch"} onClick={() => setTab("batch")}>{s.batch}</button>
      </div>
      <BlocksPanel
        s={s} order={order} onOrder={setOrder} values={values} onValue={(k, v) => setValues({ ...values, [k]: v })}
        dateIso={dateIso} onDate={setDateIso} dateFormat={dateFormat} onDateFormat={setDateFormat} dateError={dateError} valueErrors={valueErrors}
      />
      <OptionsPanel s={s} options={options} onChange={setOptions} />
      {tab === "single" ? (
        <ResultPanel s={s} result={result} separator={options.separator} />
      ) : (
        <BatchPanel s={s} input={input} order={order} lists={lists} onList={(k, t) => setLists({ ...lists, [k]: t })} />
      )}
    </div>
  );
}
