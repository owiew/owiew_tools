import { type AppLocale } from "../money/locale";
import { type Result, fail, ok } from "../result";
import { type DateFormat, type NamingDate } from "./types";

const MONTHS: Record<AppLocale, readonly string[]> = {
  "pt-br": ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"],
  en: ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"],
  es: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
};

/** Completa com zeros à esquerda até 2 dígitos. */
const pad2 = (n: number): string => String(n).padStart(2, "0");

/**
 * Diz se uma data de calendário existe (mês 1-12, dia dentro do mês, bissexto).
 *
 * Onde: parseIsoDate e formatNamingDate. Entrada: data. Saída: boolean.
 */
export function isValidDate(d: NamingDate): boolean {
  if (![d.year, d.month, d.day].every(Number.isInteger)) return false;
  if (d.year < 1000 || d.year > 9999 || d.month < 1 || d.month > 12 || d.day < 1) return false;
  const days = new Date(Date.UTC(2000, d.month, 0)).getUTCDate();
  const leap = (d.year % 4 === 0 && d.year % 100 !== 0) || d.year % 400 === 0;
  return d.day <= (d.month === 2 && !leap ? 28 : days);
}

/**
 * Lê uma data ISO "AAAA-MM-DD" (o valor de um input type=date).
 *
 * Onde: UI do gerador de nomenclatura. Entrada: texto. Saída: Result com a
 * data ou "invalid-date". Nunca lança.
 */
export function parseIsoDate(text: string): Result<NamingDate, "invalid-date"> {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text.trim());
  if (!m) return fail("invalid-date");
  const d = { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) };
  return isValidDate(d) ? ok(d) : fail("invalid-date");
}

/**
 * Formata a data no formato escolhido.
 *
 * Onde: buildName (bloco "date"). Entradas: data, formato e idioma (nomes
 * abreviados dos meses). Saída: texto como "20261101", "2026-11" ou "nov26";
 * data inexistente devolve "". Sem efeitos.
 */
export function formatNamingDate(d: NamingDate, format: DateFormat, locale: AppLocale): string {
  if (!isValidDate(d)) return "";
  const yy = pad2(d.year % 100);
  switch (format) {
    case "YYYYMMDD": return `${d.year}${pad2(d.month)}${pad2(d.day)}`;
    case "YYYY-MM-DD": return `${d.year}-${pad2(d.month)}-${pad2(d.day)}`;
    case "YYYYMM": return `${d.year}${pad2(d.month)}`;
    case "YYYY-MM": return `${d.year}-${pad2(d.month)}`;
    case "YYMMDD": return `${yy}${pad2(d.month)}${pad2(d.day)}`;
    case "MMMYY": return `${MONTHS[locale][d.month - 1] ?? ""}${yy}`;
  }
}
