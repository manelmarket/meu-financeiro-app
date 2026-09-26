// IA de verdade: Google Gemini ou Anthropic Claude, chamados direto do navegador.
// A chave de API fica guardada só neste aparelho (localStorage), fora dos dados do app.

import { CATEGORIAS } from "./categorias.js";
import { dataValida, montarData, parseValor } from "./formato.js";

const CHAVE_CONFIG = "meu_financeiro_ia";
const TEMPO_LIMITE_MS = 90000;

export const PROVEDORES = {
  gemini: {
    nome: "Google Gemini",
    detalhe: "tem plano gratuito para testar",
    modeloPadrao: "gemini-3.8-flash",
    ondePegar: "aistudio.google.com → Get API key"
  },
  claude: {
    nome: "Anthropic Claude",
    detalhe: "pago por uso",
    modeloPadrao: "claude-sonnet-5",
    ondePegar: "platform.claude.com → API keys"
  }
};

// ---------- configuração ----------

export function lerConfigIA() {
  try {
    const cfg = JSON.parse(localStorage.getItem(CHAVE_CONFIG) || "null");
    if (cfg && PROVEDORES[cfg.provedor] && cfg.chave) return cfg;
  } catch {
    // sem configuração
  }
  return null;
}

export function salvarConfigIA(cfg) {
  localStorage.setItem(CHAVE_CONFIG, JSON.stringify(cfg));
}

export function removerConfigIA() {
  localStorage.removeItem(CHAVE_CONFIG);
}

export function modeloDe(cfg) {
  return (cfg.modelo && cfg.modelo.trim()) || PROVEDORES[cfg.provedor].modeloPadrao;
}

// ---------- chamada ----------

export class ErroIA extends Error {}

function mensagemDeErro(provedor, status, corpo) {
  const texto = JSON.stringify(corpo || {}).toLowerCase();
  if (texto.includes("api_key_invalid") || texto.includes("api key not valid") || status === 401 || texto.includes("authentication_error")) {
    return `Chave inválida. Confira a chave em ${PROVEDORES[provedor].ondePegar}.`;
  }
  if (status === 429 || texto.includes("resource_exhausted") || texto.includes("rate_limit")) {
    return "Limite de uso da IA atingido. Espere alguns minutos e tente de novo (o plano gratuito tem limite por minuto e por dia).";
  }
  if (texto.includes("credit balance") || texto.includes("billing")) {
    return "A conta da IA está sem créditos. Adicione créditos no site do provedor.";
  }
  if (status === 404 || texto.includes("not_found")) {
    return "Modelo de IA não encontrado. Deixe o campo Modelo vazio para usar o padrão.";
  }
  if (status === 529 || status >= 500 || texto.includes("overloaded")) {
    return "A IA está sobrecarregada agora. Tente de novo em instantes.";
  }
  if (status === 403) {
    return "A chave não tem permissão para usar esse modelo.";
  }
  const detalhe = corpo?.error?.message;
  return `A IA recusou o pedido (${status})${detalhe ? `: ${detalhe}` : ""}.`;
}

async function enviar(url, opcoes, provedor) {
  const controle = new AbortController();
  const relogio = setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);
  let resposta;
  try {
    resposta = await fetch(url, { ...opcoes, signal: controle.signal });
  } catch (erro) {
    throw new ErroIA(
      erro?.name === "AbortError"
        ? "A IA demorou demais para responder. Tente de novo."
        : "Sem conexão com a IA. Verifique a internet e tente de novo."
    );
  } finally {
    clearTimeout(relogio);
  }
  let corpo = null;
  try {
    corpo = await resposta.json();
  } catch {
    corpo = null;
  }
  if (!resposta.ok) throw new ErroIA(mensagemDeErro(provedor, resposta.status, corpo));
  return corpo;
}

// Envia um texto (e opcionalmente uma imagem) e devolve o texto da resposta.
export async function chamarIA(cfg, { texto, imagem }) {
  const modelo = modeloDe(cfg);

  if (cfg.provedor === "gemini") {
    const partes = [];
    if (imagem) partes.push({ inline_data: { mime_type: imagem.mime, data: imagem.base64 } });
    partes.push({ text: texto });
    const corpo = await enviar(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelo)}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": cfg.chave },
        body: JSON.stringify({
          contents: [{ role: "user", parts: partes }],
          generationConfig: { responseMimeType: "application/json" }
        })
      },
      "gemini"
    );
    const resposta = (corpo?.candidates?.[0]?.content?.parts || [])
      .filter((p) => !p.thought && typeof p.text === "string")
      .map((p) => p.text)
      .join("");
    if (!resposta) {
      const motivo = corpo?.promptFeedback?.blockReason || corpo?.candidates?.[0]?.finishReason;
      throw new ErroIA(`A IA não devolveu resposta${motivo ? ` (${motivo})` : ""}. Tente de novo.`);
    }
    return resposta;
  }

  if (cfg.provedor === "claude") {
    const conteudo = [];
    if (imagem) conteudo.push({ type: "image", source: { type: "base64", media_type: imagem.mime, data: imagem.base64 } });
    conteudo.push({ type: "text", text: texto });
    const pedido = { model: modelo, max_tokens: 4096, messages: [{ role: "user", content: conteudo }] };
    // resposta mais rápida e barata no modelo padrão
    if (modelo === PROVEDORES.claude.modeloPadrao) pedido.output_config = { effort: "low" };
    const corpo = await enviar(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": cfg.chave,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify(pedido)
      },
      "claude"
    );
    const resposta = (corpo?.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");
    if (corpo?.stop_reason === "max_tokens") throw new ErroIA("A resposta da IA veio cortada. Tente de novo.");
    if (!resposta) throw new ErroIA("A IA não devolveu resposta. Tente de novo.");
    return resposta;
  }

  throw new ErroIA("Escolha uma IA nas configurações.");
}

// Pega o primeiro objeto JSON da resposta (aceita ```json ... ```).
export function extrairJSON(texto) {
  const limpo = String(texto || "").replace(/```(?:json)?/gi, "");
  const inicio = limpo.indexOf("{");
  const fim = limpo.lastIndexOf("}");
  if (inicio < 0 || fim <= inicio) throw new ErroIA("A IA respondeu num formato inesperado. Tente de novo.");
  try {
    return JSON.parse(limpo.slice(inicio, fim + 1));
  } catch {
    throw new ErroIA("A IA respondeu num formato inesperado. Tente de novo.");
  }
}

export function blobParaBase64(blob) {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => resolve(String(leitor.result).split(",")[1] || "");
    leitor.onerror = () => reject(leitor.error);
    leitor.readAsDataURL(blob);
  });
}

// ---------- usos ----------

export async function testarIA(cfg) {
  const texto = await chamarIA(cfg, { texto: 'Responda apenas com este JSON: {"ok": true}' });
  const json = extrairJSON(texto);
  if (json.ok !== true) throw new ErroIA("A IA respondeu, mas não como esperado.");
  return true;
}

export async function analisarComIA(cfg, resumo) {
  const texto = [
    "Você é um consultor de finanças pessoais no Brasil.",
    "Analise os dados do mês abaixo (valores em reais) e escreva de 3 a 6 frases curtas, diretas e úteis, em português do Brasil.",
    'Siga o estilo: "Você gastou 32% a mais em alimentação esse mês." "Sua maior despesa foi o cartão Nubank." "Se reduzir R$ 300/mês, economiza R$ 3.600 no ano."',
    "Inclua pelo menos uma sugestão prática de economia com o valor por mês e por ano.",
    "Use apenas os números informados; não invente valores. Escreva os valores no formato R$ 1.234,56.",
    'Responda somente com JSON no formato {"frases": ["...", "..."]}.',
    "",
    "Dados:",
    JSON.stringify(resumo)
  ].join("\n");
  const json = extrairJSON(await chamarIA(cfg, { texto }));
  const frases = Array.isArray(json.frases) ? json.frases.filter((f) => typeof f === "string" && f.trim()) : [];
  if (!frases.length) throw new ErroIA("A IA não trouxe nenhuma análise. Tente de novo.");
  return frases.slice(0, 8);
}

// "2026-9-5", "05/09/2026" ou "2026-09-05" -> "2026-09-05" (ou null)
export function normalizarData(texto) {
  const t = String(texto ?? "").trim();
  let y;
  let m;
  let d;
  let partes = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (partes) [, y, m, d] = partes;
  else {
    partes = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (partes) [, d, m, y] = partes;
  }
  if (!partes) return null;
  const iso = montarData(Number(y), Number(m), Number(d));
  return dataValida(iso) ? iso : null;
}

export async function lerCupomComIA(cfg, blob) {
  const imagem = { mime: blob.type || "image/jpeg", base64: await blobParaBase64(blob) };
  const texto = [
    "Esta é a foto de um cupom fiscal, nota ou recibo de compra no Brasil.",
    "Extraia os dados e responda somente com JSON neste formato:",
    '{"estabelecimento": "nome da loja ou null", "data": "AAAA-MM-DD ou null", "valor_total": 123.45, "categoria": "uma das categorias"}',
    `Categorias possíveis: ${CATEGORIAS.join(", ")}.`,
    "valor_total é o total pago (com descontos), como número com ponto decimal. Se não conseguir ler um campo, use null."
  ].join("\n");
  const json = extrairJSON(await chamarIA(cfg, { texto, imagem }));

  const valor = parseValor(json.valor_total);
  const data = normalizarData(json.data);
  const categoria = CATEGORIAS.includes(json.categoria) ? json.categoria : null;
  const descricao = typeof json.estabelecimento === "string" && json.estabelecimento.trim() ? json.estabelecimento.trim() : null;

  if (!(valor > 0) && !descricao && !data) {
    throw new ErroIA("Não consegui ler esse cupom. Tente uma foto mais nítida, com o cupom inteiro.");
  }
  return { descricao, valor: valor > 0 ? valor : null, data, categoria };
}
