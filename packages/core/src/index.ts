export { type Result, fail, ok } from "./result";
export { mulDivRound } from "./money/bigint-math";
export { APP_LOCALES, type AppLocale, defaultCurrency, intlLocale } from "./money/locale";
export { type ParseNumberError, parseScaled } from "./money/parse-scaled";
export { formatBp, formatCents, formatNumber, parseMoneyToCents, parsePercentToBp } from "./money/format";
export { detectDelimiter, parseCsv } from "./csv/parse";
export { escapeCsvCell, neutralizeFormula, serializeCsv } from "./csv/serialize";
export { MAX_URL_LENGTH, type ParseUrlError, type ParsedUrl, parseHttpUrl } from "./url/parse-http-url";
export { type ClickIdInfo, identifyClickId } from "./url/click-ids";
export { type DecodeError, decodeComponent, encodeComponent } from "./url/codec";
export { type Inspection, type Issue, type IssueCode, type ParamInfo, inspectUrl } from "./url/inspect-url";
export { DEFAULT_RULES, type NamingRules, coerceRules } from "./utm/rules";
export { normalizeValue } from "./utm/normalize-value";
export {
  UTM_KEYS, type UtmError, type UtmFields, type UtmOutput, type UtmWarning, buildUtmUrl,
} from "./utm/build-utm-url";
export {
  type BatchError, type BatchMode, type BatchResult, type BatchRow, MAX_BATCH_ROWS,
  batchToCsv, buildBatch, parseBatch,
} from "./utm/batch";
export { type RoasError, type RoasInput, type RoasResult, type RoasVerdict, calcRoas } from "./roas/calc-roas";
