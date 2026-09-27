// Conversa com o app Android (APK, a partir da versão 2) para os lembretes de vencimento.
//
// Dois caminhos:
// 1. Canal de mensagens (PostMessage da Trusted Web Activity, Chrome 115 ou mais novo):
//    quando o app abre, o celular entrega a esta página uma "porta" de mensagens. Por ela o app
//    manda a agenda de lembretes sempre que algo muda, sem a pessoa fazer nada, e o celular
//    responde como estão os lembretes e as notificações.
// 2. Link para o app (intent://...): usado quando a pessoa toca em "Ativar lembretes" (o celular
//    mostra o pedido de permissão das notificações) e quando não existe o canal (por exemplo,
//    celular que abre o app por outro navegador que não o Chrome).
//
// Nada disso existe no navegador comum: lá esta parte fica parada.

import { useSyncExternalStore } from "react";
import { ehAppAndroid, versaoDoApk } from "./modoApp.js";
import { lerJSON } from "./json.js";

export const PACOTE_ANDROID = "com.meufinanceiro.app";
export const ENDERECO_DO_APK = "/apk/meu-financeiro.apk";
export const VERSAO_COM_LEMBRETES = 2;
const ESPERA_PELO_APP = 6000; // ms para o app Android se apresentar pelo canal
const ESPERA_POR_RESPOSTA = 8000;
const MARCA_SEM_APP = "#app-desatualizado";

// situacao:
//   "navegador"  -> aberto no navegador comum (não é o app Android)
//   "app-antigo" -> app Android da versão 1 (sem lembretes): precisa atualizar o APK
//   "aguardando" -> app Android novo, esperando o canal de mensagens
//   "conectado"  -> canal de mensagens funcionando
//   "sem-canal"  -> app Android novo, mas sem canal (usa o link para o app)
// app: o que o celular informou { ativos, notificacoes, agendados, proximo }
let estado = { situacao: "navegador", app: null, versaoDoApp: 0, conexao: 0, naoAbriu: false };
const ouvintes = new Set();
let porta = null;
let iniciado = false;
let proximoId = 1;
const pendentes = new Map();

function mudar(parcial) {
  estado = { ...estado, ...parcial };
  ouvintes.forEach((f) => f());
}

export function usarPonteAndroid() {
  return useSyncExternalStore(
    (f) => {
      ouvintes.add(f);
      return () => ouvintes.delete(f);
    },
    () => estado
  );
}

export function lerPonteAndroid() {
  return estado;
}

function lerMensagem(bruto) {
  if (typeof bruto !== "string" || !bruto) return null;
  try {
    const msg = lerJSON(bruto);
    return msg && typeof msg === "object" ? msg : null;
  } catch {
    return null;
  }
}

function estadoDoApp(e) {
  if (!e || typeof e !== "object") return null;
  return {
    ativos: e.ativos === true,
    notificacoes: e.notificacoes === true,
    agendados: Math.max(0, parseInt(e.agendados, 10) || 0),
    proximo: Number(e.proximo) || 0
  };
}

function aoReceberDoApp(p, bruto) {
  const msg = lerMensagem(bruto);
  if (!msg) return;

  // o app se apresenta: esta porta passa a ser a do app
  if (msg.tipo === "ola" && msg.app === "meu-financeiro") {
    if (porta && porta !== p) {
      try {
        porta.close();
      } catch {
        // já estava fechada
      }
    }
    porta = p;
    mudar({
      situacao: "conectado",
      app: estadoDoApp(msg.estado),
      versaoDoApp: parseInt(msg.versao, 10) || VERSAO_COM_LEMBRETES,
      conexao: estado.conexao + 1
    });
    return;
  }

  if (p !== porta || msg.tipo !== "resposta") return;
  const pedido = pendentes.get(msg.id);
  if (msg.estado) mudar({ app: estadoDoApp(msg.estado) });
  if (!pedido) return;
  pendentes.delete(msg.id);
  clearTimeout(pedido.tempo);
  pedido.resolver({ ok: msg.ok === true, estado: estadoDoApp(msg.estado), erro: msg.erro || "" });
}

function aoReceberDaJanela(e) {
  const p = e.ports && e.ports[0];
  if (!p) return;
  // A porta vem do próprio Chrome (sem janela de origem), com a origem "android-app://...".
  // Mensagens com porta vindas de outras janelas (iframes) são ignoradas.
  const doNavegador = !e.source;
  const doApp = String(e.origin || "").startsWith("android-app://");
  if (!doNavegador && !doApp) return;
  p.onmessage = (m) => aoReceberDoApp(p, m.data);
  // a primeira mensagem do app pode vir junto com a porta
  if (e.data) aoReceberDoApp(p, e.data);
}

// Chamado uma vez, antes de desenhar o app (main.jsx)
export function iniciarPonteAndroid() {
  if (iniciado || typeof window === "undefined") return;
  iniciado = true;
  if (!ehAppAndroid()) return;

  const versao = versaoDoApk();
  mudar({ situacao: versao >= VERSAO_COM_LEMBRETES ? "aguardando" : "app-antigo", versaoDoApp: versao });
  window.addEventListener("message", aoReceberDaJanela);

  if (versao >= VERSAO_COM_LEMBRETES) {
    setTimeout(() => {
      if (estado.situacao === "aguardando") mudar({ situacao: "sem-canal" });
    }, ESPERA_PELO_APP);
  }

  // o celular não conseguiu abrir o app (APK antigo ou sem o app): o Chrome volta com esta marca
  const conferirMarca = () => {
    if (window.location.hash !== MARCA_SEM_APP) return;
    window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
    mudar({ naoAbriu: true });
  };
  window.addEventListener("hashchange", conferirMarca);
  conferirMarca();

  // voltou para o app (ex.: depois de permitir as notificações): pergunta como ficou
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && porta) pedirAoApp("estado").catch(() => {});
  });
}

// Pede algo ao app pelo canal. Resolve com { ok, estado, erro }.
export function pedirAoApp(tipo, extra = {}) {
  if (!porta) return Promise.reject(new Error("sem-canal"));
  const id = proximoId;
  proximoId += 1;
  return new Promise((resolver, rejeitar) => {
    const tempo = setTimeout(() => {
      pendentes.delete(id);
      rejeitar(new Error("sem-resposta"));
    }, ESPERA_POR_RESPOSTA);
    pendentes.set(id, { resolver, tempo });
    try {
      porta.postMessage(JSON.stringify({ ...extra, id, tipo }));
    } catch (erro) {
      clearTimeout(tempo);
      pendentes.delete(id);
      rejeitar(erro);
    }
  });
}

// Endereço que abre o app Android direto na tela de lembretes (sem aparecer nada na tela,
// a não ser o pedido de permissão das notificações, quando precisa).
// acao: "ativar" (guarda a agenda e liga) | "desligar" | "teste"
export function linkParaOApp(acao, lembretes) {
  const partes = ["scheme=meufinanceiro", `package=${PACOTE_ANDROID}`];
  if (lembretes) partes.push(`S.agenda=${encodeURIComponent(JSON.stringify(lembretes))}`);
  partes.push(`S.browser_fallback_url=${encodeURIComponent(`${window.location.origin}/${MARCA_SEM_APP}`)}`);
  return `intent://lembretes/${acao}#Intent;${partes.join(";")};end`;
}

export function abrirNoApp(acao, lembretes) {
  mudar({ naoAbriu: false });
  window.location.href = linkParaOApp(acao, lembretes);
}

export function esquecerAvisoDeFalha() {
  if (estado.naoAbriu) mudar({ naoAbriu: false });
}
