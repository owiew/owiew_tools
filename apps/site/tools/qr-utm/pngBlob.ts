import { type QrPlan } from "@owiew/core/qr";

/**
 * Desenha o QR Code planejado num canvas e devolve o PNG.
 *
 * O quê: usa o MESMO caminho do SVG (`plan.path`) com escala inteira por módulo,
 * então o PNG sai nítido e idêntico à prévia. Roda só no navegador (canvas local).
 * Onde: botão "baixar PNG". Entradas: plano e cores `#hex` já validadas.
 * Saída: Promise com o Blob PNG; rejeita se o navegador não gerar a imagem.
 */
export function pngBlob(plan: QrPlan, fg: string, bg: string): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = plan.imageSizePx;
  canvas.height = plan.imageSizePx;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.reject(new Error("canvas-unavailable"));
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.scale(plan.pixelsPerModule, plan.pixelsPerModule);
  ctx.fillStyle = fg;
  ctx.fill(new Path2D(plan.path));
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("png-failed"))), "image/png");
  });
}
