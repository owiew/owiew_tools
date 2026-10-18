/**
 * Baixa um texto como arquivo, 100% local (Blob + link temporário).
 *
 * Onde: botão "exportar CSV". Entradas: nome do arquivo, conteúdo e tipo MIME.
 * Efeito: dispara o download no navegador; nenhuma requisição de rede.
 */
export function downloadText(filename: string, content: string, mime: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
