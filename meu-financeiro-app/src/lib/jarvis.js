// Lançamento pedido por voz ao Jarvis (assistente de voz do Android).
//
// O Jarvis abre o app por um link:   .../?jarvis=<frase>&t=<hora>&sig=<assinatura>
//
// Dois modos:
// - COM assinatura válida (a chave do Jarvis está cadastrada neste aparelho, em Perfil): o app grava o
//   lançamento sozinho e mostra o aviso "Jarvis lançou ...". O Jarvis lê esse aviso e volta ao app anterior.
// - SEM assinatura válida (ou sem chave): o link só PREENCHE o Novo lançamento; quem grava é a pessoa,
//   tocando em Salvar. Assim, um link malicioso nunca consegue registrar um gasto sozinho.
//
// A assinatura é HMAC-SHA256(chave, "<hora>|<frase>"): a chave nunca vai no link, o pedido vale por
// 2 minutos e cada assinatura só funciona uma vez (não dá para repetir um link antigo).

import { interpretarFrase } from "./interpretar.js";
import { montarLancamento, MAXIMO_DE_PARCELAS } from "./lancar.js";
import { arredondar, dataValida, money } from "./formato.js";
import { acharCarteira } from "./transferencias.js";

const CHAVE_PEDIDO = "meu_financeiro_jarvis";
const CHAVE_SEGREDO = "meu_financeiro_jarvis_chave";
const CHAVE_USADOS = "meu_financeiro_jarvis_usados";
const LIMITE_DA_FRASE = 300; // caracteres
const VALIDADE = 2 * 60 * 1000; // ms

// ---------- pedido que veio no link ----------

export function guardarFraseDoJarvis() {
  if (typeof window === "undefined") return;
  try {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("jarvis")) return;
    const bruto = String(url.searchParams.get("jarvis") || "");
    const frase = bruto.replace(/\s+/g, " ").trim().slice(0, LIMITE_DA_FRASE);
    if (frase) {
      sessionStorage.setItem(
        CHAVE_PEDIDO,
        JSON.stringify({
          bruto,
          frase,
          t: String(url.searchParams.get("t") || ""),
          sig: String(url.searchParams.get("sig") || "").toLowerCase()
        })
      );
    }
    for (const p of ["jarvis", "t", "sig"]) url.searchParams.delete(p);
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  } catch {
    // sem sessionStorage: a pessoa preenche na mão
  }
}

export function lerPedidoDoJarvis() {
  try {
    const bruto = sessionStorage.getItem(CHAVE_PEDIDO);
    const p = bruto ? JSON.parse(bruto) : null;
    return p && typeof p.frase === "string" && p.frase ? p : null;
  } catch {
    return null;
  }
}

export function lerFraseDoJarvis() {
  return lerPedidoDoJarvis()?.frase || "";
}

export function esquecerFraseDoJarvis() {
  try {
    sessionStorage.removeItem(CHAVE_PEDIDO);
  } catch {
    // nada a fazer
  }
}

// ---------- chave deste aparelho ----------

export function lerChaveDoJarvis() {
  try {
    return localStorage.getItem(CHAVE_SEGREDO) || "";
  } catch {
    return "";
  }
}

export function salvarChaveDoJarvis(chave) {
  try {
    const limpa = String(chave || "").trim();
    if (limpa) localStorage.setItem(CHAVE_SEGREDO, limpa);
    else localStorage.removeItem(CHAVE_SEGREDO);
    return true;
  } catch {
    return false;
  }
}

export function gerarChaveDoJarvis() {
  const letras = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return Array.from(bytes, (b) => letras[b % letras.length]).join("");
}

// ---------- assinatura ----------

async function assinar(chave, t, texto) {
  const enc = new TextEncoder();
  const k = await crypto.subtle.importKey("raw", enc.encode(chave), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", k, enc.encode(`${t}|${texto}`));
  return Array.from(new Uint8Array(mac), (b) => b.toString(16).padStart(2, "0")).join("");
}

function jaUsada(sig) {
  try {
    return (JSON.parse(localStorage.getItem(CHAVE_USADOS) || "[]") || []).includes(sig);
  } catch {
    return false;
  }
}

function marcarUsada(sig) {
  try {
    const lista = (JSON.parse(localStorage.getItem(CHAVE_USADOS) || "[]") || []).filter((x) => typeof x === "string");
    localStorage.setItem(CHAVE_USADOS, JSON.stringify([...lista, sig].slice(-30)));
  } catch {
    // sem localStorage: vale só a janela de 2 minutos
  }
}

// true se o pedido foi assinado com a chave deste aparelho, é recente e ainda não foi usado
export async function pedidoAssinadoValido(pedido, agora = Date.now()) {
  try {
    const chave = lerChaveDoJarvis();
    if (!chave || !pedido?.sig || !pedido?.t) return false;
    const t = Number(pedido.t);
    if (!Number.isFinite(t) || Math.abs(agora - t) > VALIDADE) return false;
    if (jaUsada(pedido.sig)) return false;
    const esperada = await assinar(chave, pedido.t, pedido.bruto);
    if (esperada.length !== pedido.sig.length) return false;
    let dif = 0;
    for (let i = 0; i < esperada.length; i++) dif |= esperada.charCodeAt(i) ^ pedido.sig.charCodeAt(i);
    if (dif !== 0) return false;
    marcarUsada(pedido.sig);
    return true;
  } catch {
    return false;
  }
}

// ---------- gravação direta ----------

// Frase → { lancamento, compras, resumo } pronto para salvar, ou { erro }.
// Usa as mesmas regras do Novo lançamento (banco padrão, carteira para dinheiro, cartão e parcelas).
// Transferências e frases confusas não são gravadas aqui: voltam para o preenchimento manual.
export function lancarDaFrase(frase, dados, hoje, bancos = [], bancoPadrao = "", agora = Date.now()) {
  const r = interpretarFrase(frase, dados, hoje);
  if (!r.entendido) return { erro: "não entendi o valor" };
  if (r.tipo === "transferencia") return { erro: "transferências são feitas no app" };
  const total = Number(r.valor);
  if (!(total > 0)) return { erro: "valor inválido" };

  const cartoes = dados.cartoes || [];
  const carteira = acharCarteira(dados);
  const bancoDoDinheiro = carteira ? String(carteira.id) : "";
  const bancoExiste = (id) => bancos.some((b) => String(b.banco.id) === String(id));

  let partes;
  if (r.tipo === "entrada") {
    const p = r.partes[0] || {};
    partes = [
      { forma: p.forma || "Pix", valor: total, bancoId: p.bancoId && bancoExiste(p.bancoId) ? String(p.bancoId) : bancoPadrao || null }
    ];
  } else {
    const lista = r.partes.length ? r.partes : [{ forma: "Pix", valor: null }];
    if (lista.filter((p) => !p.valor).length > 1) return { erro: "frase com mais de uma forma de pagamento sem valor" };
    const conhecidas = arredondar(lista.reduce((t, p) => t + (p.valor || 0), 0));
    partes = lista.map((p) => ({
      forma: p.forma,
      valor: p.valor ? p.valor : arredondar(total - conhecidas),
      bancoId:
        p.forma === "Cartão"
          ? null
          : p.bancoId && bancoExiste(p.bancoId)
            ? String(p.bancoId)
            : p.forma === "Dinheiro"
              ? bancoDoDinheiro || null
              : bancoPadrao || null,
      cartaoId: p.cartaoId && cartoes.some((c) => String(c.id) === String(p.cartaoId)) ? p.cartaoId : (cartoes[0]?.id ?? ""),
      parcelas: Math.min(MAXIMO_DE_PARCELAS, Math.max(1, p.parcelas || 1))
    }));
  }

  const descricao = String(r.descricao || "").trim() || "Lançamento do Jarvis";
  const form = {
    tipo: r.tipo,
    descricao,
    categoria: r.categoria,
    data: dataValida(r.data) ? r.data : hoje,
    valor: total,
    partes
  };
  const montado = montarLancamento(form, cartoes, agora);
  if (montado.erro) return { erro: montado.erro };
  return { ...montado, resumo: `${money(total)}: ${descricao}` };
}
