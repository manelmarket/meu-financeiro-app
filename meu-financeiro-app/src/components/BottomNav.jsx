import React from "react";
import { Home, PlusCircle, Plus, History, CreditCard, Target, Wallet, List, Mic } from "lucide-react";
import { usarAparencia } from "../lib/aparencia.js";

// Relatórios fica no menu ⋮ (no lugar dele na barra entrou Bancos)
const CLASSICO = [
  ["home", Home, "Início"],
  ["bancos", Wallet, "Bancos"],
  ["new", PlusCircle, "Novo"],
  ["history", History, "Extrato"],
  ["cards", CreditCard, "Cartões"],
  ["goals", Target, "Metas"]
];

// Banco digital e Vidro: 5 abas com o + grande no meio (Bancos fica no saldo do Início; Metas no menu ⋮)
const MODERNO = [
  ["home", Home, "Início"],
  ["history", List, "Extrato"],
  ["new", Plus, "Novo lançamento", true],
  ["cards", CreditCard, "Cartões"],
  ["jarvis", Mic, "Jarvis"]
];

export default function BottomNav({ page, onChange }) {
  const { estilo } = usarAparencia();
  const moderno = estilo === "banco" || estilo === "vidro";
  const items = moderno ? MODERNO : CLASSICO;

  return (
    <nav className={`bottom-nav${moderno ? " moderna" : ""}`} aria-label="Menu principal">
      {items.map(([id, Icon, label, central]) =>
        central ? (
          <button key={id} className="nav-central" onClick={() => onChange(id)} aria-label={label}>
            <span>
              <Icon size={26} strokeWidth={2.6} />
            </span>
          </button>
        ) : (
          <button
            key={id}
            className={page === id ? "active" : ""}
            aria-current={page === id ? "page" : undefined}
            onClick={() => onChange(id)}
          >
            <Icon size={22} strokeWidth={2.2} />
            <span>{label}</span>
          </button>
        )
      )}
    </nav>
  );
}
