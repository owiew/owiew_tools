import { DEFAULT_RULES, type NamingRules, coerceRules } from "@owiew/core";
import { useEffect, useState } from "preact/hooks";

const KEY = "owiew-tools:utm-rules";

/**
 * Estado do padrão de nomenclatura com persistência opcional no localStorage.
 *
 * O quê: carrega o padrão salvo depois da hidratação (evita divergir do HTML
 * renderizado no build) e expõe salvar/restaurar. Todo acesso ao storage está
 * em try/catch: janela privada ou site data bloqueado não quebram a página.
 * Onde: Ui.tsx do Gerador de UTM. Fluxo: localStorage -> coerceRules -> estado
 * (valor salvo nunca é confiável: pode estar corrompido ou editado).
 * Saída: regras, setter, `save`, `reset`, flag de armazenamento indisponível
 * e flag "salvo agora".
 */
export function useSavedRules() {
  const [rules, setRules] = useState<NamingRules>(DEFAULT_RULES);
  const [storageOff, setStorageOff] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setRules(coerceRules(JSON.parse(raw)));
    } catch {
      // JSON corrompido ou storage bloqueado: segue com o padrão da casa.
      setStorageOff(true);
    }
  }, []);

  /** Grava o padrão atual; falha vira aviso na UI, nunca exceção. */
  function save(): void {
    try {
      localStorage.setItem(KEY, JSON.stringify(rules));
      setSaved(true);
      setStorageOff(false);
    } catch {
      setStorageOff(true);
      setSaved(false);
    }
  }

  /** Volta ao padrão recomendado e apaga o salvo (se der). */
  function reset(): void {
    setRules(DEFAULT_RULES);
    setSaved(false);
    try {
      localStorage.removeItem(KEY);
    } catch {
      setStorageOff(true);
    }
  }

  return { rules, setRules: (r: NamingRules) => { setRules(r); setSaved(false); }, save, reset, storageOff, saved };
}
