// Fotos de cupom: ficam no IndexedDB do navegador (bem mais espaço que o localStorage)
// e são reduzidas antes de salvar (lado maior de 1280 px, JPEG).

const BANCO = "meu_financeiro";
const TABELA = "cupons";

function abrir() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("Este navegador não permite guardar fotos."));
      return;
    }
    const pedido = indexedDB.open(BANCO, 1);
    pedido.onupgradeneeded = () => pedido.result.createObjectStore(TABELA);
    pedido.onsuccess = () => resolve(pedido.result);
    pedido.onerror = () => reject(pedido.error);
  });
}

async function usar(modo, acao) {
  const banco = await abrir();
  try {
    return await new Promise((resolve, reject) => {
      const transacao = banco.transaction(TABELA, modo);
      const pedido = acao(transacao.objectStore(TABELA));
      transacao.oncomplete = () => resolve(pedido ? pedido.result : undefined);
      transacao.onerror = () => reject(transacao.error);
      transacao.onabort = () => reject(transacao.error);
    });
  } finally {
    banco.close();
  }
}

export function salvarCupom(id, blob) {
  return usar("readwrite", (tabela) => tabela.put(blob, id));
}

export function lerCupom(id) {
  return usar("readonly", (tabela) => tabela.get(id));
}

export function apagarCupom(id) {
  return usar("readwrite", (tabela) => tabela.delete(id));
}

export function limparCupons() {
  return usar("readwrite", (tabela) => tabela.clear());
}

export async function comprimirImagem(arquivo, ladoMaximo = 1280, qualidade = 0.72) {
  const url = URL.createObjectURL(arquivo);
  try {
    const imagem = new Image();
    imagem.src = url;
    await imagem.decode();

    const escala = Math.min(1, ladoMaximo / Math.max(imagem.naturalWidth, imagem.naturalHeight));
    const largura = Math.max(1, Math.round(imagem.naturalWidth * escala));
    const altura = Math.max(1, Math.round(imagem.naturalHeight * escala));

    const canvas = document.createElement("canvas");
    canvas.width = largura;
    canvas.height = altura;
    const contexto = canvas.getContext("2d");
    contexto.fillStyle = "#ffffff";
    contexto.fillRect(0, 0, largura, altura);
    contexto.drawImage(imagem, 0, 0, largura, altura);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", qualidade));
    if (!blob) throw new Error("Não foi possível processar a imagem.");
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function dataURLParaBlob(dataURL) {
  const resposta = await fetch(dataURL);
  return resposta.blob();
}
