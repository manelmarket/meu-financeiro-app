// O que este aparelho guarda sobre a sincronização com a nuvem:
// - quem está conectado e em qual versão da nuvem estes dados estão (localStorage);
// - a "base": como os dados estavam na última sincronização (IndexedDB), usada para
//   juntar as mudanças feitas aqui com as feitas em outro aparelho.

import { lerJSON } from "../lib/json.js";

const CHAVE = "meu_financeiro_nuvem";
const CHAVE_BASE_RESERVA = "meu_financeiro_nuvem_base";
const BANCO = "meu_financeiro_nuvem";
const TABELA = "base";

export function lerEstadoNuvem() {
  try {
    const e = lerJSON(localStorage.getItem(CHAVE) || "null");
    return e && typeof e.uid === "string" && e.uid ? e : null;
  } catch {
    return null;
  }
}

export function salvarEstadoNuvem(estado) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(estado));
  } catch {
    // sem espaço: na próxima abertura a sincronização recomeça pela nuvem
  }
}

export function apagarEstadoNuvem() {
  try {
    localStorage.removeItem(CHAVE);
    localStorage.removeItem(CHAVE_BASE_RESERVA);
  } catch {
    // nada a fazer
  }
}

// Última conta que saiu deste aparelho: os dados que ficaram aqui são dela
// (outra conta que entrar começa sem eles). tudoEnviado = nada ficou só neste aparelho.
const CHAVE_ULTIMA_CONTA = "meu_financeiro_ultima_conta";

export function lerUltimaConta() {
  try {
    const c = lerJSON(localStorage.getItem(CHAVE_ULTIMA_CONTA) || "null");
    return c && typeof c.uid === "string" ? c : null;
  } catch {
    return null;
  }
}

export function salvarUltimaConta(conta) {
  try {
    localStorage.setItem(
      CHAVE_ULTIMA_CONTA,
      JSON.stringify({
        uid: conta.uid,
        email: conta.email || "",
        tudoEnviado: Boolean(conta.tudoEnviado),
        // a conta estava usando os dados de uma família (modo família): ao entrar de novo, volta para ela
        ...(conta.espaco && conta.espaco.tipo === "familia" && typeof conta.espaco.id === "string"
          ? { espaco: { tipo: "familia", id: conta.espaco.id } }
          : {})
      })
    );
  } catch {
    // nada a fazer
  }
}

function abrir() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("sem IndexedDB"));
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

export async function lerBase(uid) {
  try {
    const guardada = await usar("readonly", (t) => t.get(uid));
    if (guardada !== undefined) return guardada;
  } catch {
    // sem IndexedDB: tenta a reserva no localStorage
  }
  try {
    const reserva = lerJSON(localStorage.getItem(CHAVE_BASE_RESERVA) || "null");
    return reserva && reserva.uid === uid ? reserva.dados : null;
  } catch {
    return null;
  }
}

export async function salvarBase(uid, dados) {
  try {
    await usar("readwrite", (t) => t.put(dados, uid));
    localStorage.removeItem(CHAVE_BASE_RESERVA);
    return true;
  } catch {
    try {
      localStorage.setItem(CHAVE_BASE_RESERVA, JSON.stringify({ uid, dados }));
      return true;
    } catch {
      return false;
    }
  }
}

export async function apagarBase() {
  try {
    await usar("readwrite", (t) => t.clear());
  } catch {
    // nada a fazer
  }
  try {
    localStorage.removeItem(CHAVE_BASE_RESERVA);
  } catch {
    // nada a fazer
  }
}
