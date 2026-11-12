// Janelas e avisos com o visual do app (no lugar das caixas cinzas do navegador).
//
//   if (!(await confirmar("Excluir o cartão Nubank?"))) return;
//   avisar("Lançamento salvo");
//   avisar("Lançamento excluído", { desfazer: () => ... });
//
// Quem desenha é o componente DialogosDoApp (um só, no App). Sem ele na tela (testes),
// confirmar() cai na caixa do navegador.

import { useSyncExternalStore } from "react";

let estado = { pergunta: null, avisos: [] };
const ouvintes = new Set();
let montado = false;
let proximo = 1;

function mudar(novo) {
  estado = { ...estado, ...novo };
  ouvintes.forEach((f) => f());
}

export function usarDialogos() {
  return useSyncExternalStore(
    (f) => {
      ouvintes.add(f);
      montado = true;
      return () => {
        ouvintes.delete(f);
        montado = ouvintes.size > 0;
      };
    },
    () => estado,
    () => estado
  );
}

// vibração curtinha (Android), quando o aparelho deixa
export function vibrar(ms = 12) {
  try {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") navigator.vibrate(ms);
  } catch {
    // sem vibração
  }
}

const PERIGO = /^(excluir|apagar|remover|tirar|restaurar|encerrar|sair|desfazer|cancelar a)/i;

// Pergunta com Sim/Não. texto: o primeiro parágrafo vira o título; o resto, a explicação.
// opcoes = { botao: "Excluir", perigo: true }
export function confirmar(texto, opcoes = {}) {
  const partes = String(texto || "").split(/\n\s*\n/);
  const titulo = partes[0].trim();
  const detalhe = partes.slice(1).join("\n\n").trim();
  const perigo = opcoes.perigo ?? PERIGO.test(titulo);
  const botao = opcoes.botao || (perigo ? (titulo.match(PERIGO)?.[1] || "Confirmar").replace(/^./, (x) => x.toUpperCase()) : "Confirmar");
  if (!montado && typeof window !== "undefined" && typeof window.confirm === "function") {
    return Promise.resolve(window.confirm(texto));
  }
  return new Promise((resolver) => {
    // pergunta nova antes de responder a anterior: a anterior conta como "não"
    estado.pergunta?.resolver(false);
    mudar({
      pergunta: {
        id: proximo++,
        titulo,
        detalhe,
        perigo,
        botao,
        resolver: (sim) => {
          mudar({ pergunta: null });
          if (sim) vibrar(perigo ? 20 : 12);
          resolver(Boolean(sim));
        }
      }
    });
  });
}

// Aviso que aparece embaixo e some sozinho. opcoes = { tipo: "ok" | "erro" | "info", desfazer: fn, tempo: ms }
export function avisar(texto, opcoes = {}) {
  const id = proximo++;
  const aviso = { id, texto: String(texto || ""), tipo: opcoes.tipo || "ok", desfazer: opcoes.desfazer || null };
  mudar({ avisos: [...estado.avisos.slice(-2), aviso] });
  if (aviso.tipo === "ok") vibrar(10);
  setTimeout(() => fecharAviso(id), opcoes.tempo || (aviso.desfazer ? 6000 : 3200));
  return id;
}

export function fecharAviso(id) {
  if (!estado.avisos.some((a) => a.id === id)) return;
  mudar({ avisos: estado.avisos.filter((a) => a.id !== id) });
}
