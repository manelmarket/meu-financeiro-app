// Aparência do app neste aparelho: tema de cores e modo escuro.
// Fica guardada só neste aparelho. É aplicada no <html> como data-tema e data-modo;
// as cores de cada tema estão no começo do index.css.
// (O index.html aplica a aparência guardada antes da primeira pintura, para não piscar.)

import { useSyncExternalStore } from "react";
import { lerJSON } from "./json.js";

export const CHAVE_APARENCIA = "meu_financeiro_aparencia";

// cores: só para as prévias da tela Temas (o app em si usa o index.css)
export const TEMAS = [
  {
    id: "azul",
    nome: "Azul Oceano",
    descricao: "O clássico do app: azul e marinho.",
    cores: { principal: "#2563eb", destaque: ["#0f172a", "#1e293b"], suave: "#dbeafe", grafico: ["#184f95", "#2a78d6", "#6da7ec"] }
  },
  {
    id: "verde",
    nome: "Verde Esmeralda",
    descricao: "Verde dinheiro, calmo e confiante.",
    cores: { principal: "#047857", destaque: ["#022c22", "#064e3b"], suave: "#d1fae5", grafico: ["#065f46", "#10b981", "#6ee7b7"] }
  },
  {
    id: "roxo",
    nome: "Roxo Ametista",
    descricao: "Moderno, com toque de fintech.",
    cores: { principal: "#7c3aed", destaque: ["#2e1065", "#4c1d95"], suave: "#ede9fe", grafico: ["#5b21b6", "#8b5cf6", "#c4b5fd"] }
  },
  {
    id: "dourado",
    nome: "Grafite & Dourado",
    descricao: "Visual premium, grafite com dourado.",
    cores: { principal: "#b45309", destaque: ["#1c1917", "#44403c"], suave: "#fef3c7", grafico: ["#92400e", "#d97706", "#fbbf24"] }
  }
];

const PADRAO = { tema: "azul", escuro: false };

// cor da barra do celular (status bar) em cada combinação
const COR_DA_BARRA = { azul: "#0f172a", verde: "#022c22", roxo: "#2e1065", dourado: "#1c1917" };
const COR_DA_BARRA_ESCURO = "#0b1220";

function ler() {
  try {
    const a = lerJSON(localStorage.getItem(CHAVE_APARENCIA) || "null");
    return {
      tema: TEMAS.some((t) => t.id === a?.tema) ? a.tema : PADRAO.tema,
      escuro: a?.escuro === true
    };
  } catch {
    return { ...PADRAO };
  }
}

let atual = ler();
const ouvintes = new Set();

function avisar() {
  ouvintes.forEach((f) => f());
}

export function aplicarAparencia(a = atual) {
  if (typeof document === "undefined") return;
  const raiz = document.documentElement;
  raiz.dataset.tema = a.tema;
  raiz.dataset.modo = a.escuro ? "escuro" : "claro";
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", a.escuro ? COR_DA_BARRA_ESCURO : COR_DA_BARRA[a.tema] || COR_DA_BARRA.azul);
}

export function lerAparencia() {
  return atual;
}

export function mudarAparencia(parcial) {
  atual = { ...atual, ...parcial };
  try {
    localStorage.setItem(CHAVE_APARENCIA, JSON.stringify(atual));
  } catch {
    // sem espaço: vale só até fechar o app
  }
  aplicarAparencia(atual);
  avisar();
}

// outra aba/janela do app mudou a aparência
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key !== CHAVE_APARENCIA) return;
    atual = ler();
    aplicarAparencia(atual);
    avisar();
  });
}

export function usarAparencia() {
  return useSyncExternalStore(
    (f) => {
      ouvintes.add(f);
      return () => ouvintes.delete(f);
    },
    () => atual
  );
}
