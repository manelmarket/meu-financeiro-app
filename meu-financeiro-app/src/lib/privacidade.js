// "Esconder valores": os valores em dinheiro aparecem como "R$ ••••" em todas as telas.
// Vale só neste aparelho. As contas, os arquivos exportados e o que vai para a IA usam o valor de verdade
// (ver moneyReal em lib/formato.js).

import { useSyncExternalStore } from "react";

const CHAVE = "meu_financeiro_esconder_valores";
const ouvintes = new Set();

function ler() {
  try {
    return typeof localStorage !== "undefined" && localStorage.getItem(CHAVE) === "1";
  } catch {
    return false;
  }
}

let escondido = ler();

export function valoresEscondidos() {
  return escondido;
}

export function esconderValores(sim) {
  escondido = Boolean(sim);
  try {
    if (escondido) localStorage.setItem(CHAVE, "1");
    else localStorage.removeItem(CHAVE);
  } catch {
    // vale até fechar o app
  }
  ouvintes.forEach((f) => f());
}

export function usarValoresEscondidos() {
  return useSyncExternalStore(
    (f) => {
      ouvintes.add(f);
      return () => ouvintes.delete(f);
    },
    () => escondido,
    () => false
  );
}
