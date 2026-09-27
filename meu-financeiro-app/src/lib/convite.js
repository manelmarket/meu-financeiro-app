// Link de convite para a família: .../?convite=ABCD2345
// Ao abrir o app pelo link, o código fica guardado (nesta aba) até a pessoa entrar na conta e
// abrir a tela Família, que já vem com o código preenchido.

import { limparCodigo } from "./familia.js";

const CHAVE = "meu_financeiro_convite";

export function guardarConviteDaUrl() {
  if (typeof window === "undefined") return;
  try {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("convite")) return;
    const codigo = limparCodigo(url.searchParams.get("convite"));
    if (codigo) sessionStorage.setItem(CHAVE, codigo);
    url.searchParams.delete("convite");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  } catch {
    // sem sessionStorage: a pessoa digita o código
  }
}

export function lerConvitePendente() {
  try {
    return sessionStorage.getItem(CHAVE) || "";
  } catch {
    return "";
  }
}

export function esquecerConvite() {
  try {
    sessionStorage.removeItem(CHAVE);
  } catch {
    // nada a fazer
  }
}
