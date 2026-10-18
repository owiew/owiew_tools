/**
 * Baixa um Blob como arquivo, 100% local (link temporário com URL de objeto).
 *
 * Onde: botão "baixar PNG" do gerador de QR Code. Entradas: nome do arquivo e
 * Blob. Efeito: dispara o download no navegador; nenhuma requisição de rede.
 */
export function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
