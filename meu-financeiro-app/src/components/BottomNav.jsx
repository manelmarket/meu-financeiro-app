import React from "react";
import { Home, PlusCircle, History, CreditCard, Target } from "lucide-react";

export default function BottomNav({ page, onChange }) {
  const items = [
    ["home", Home, "Início"],
    ["history", History, "Histórico"],
    ["new", PlusCircle, "Novo"],
    ["cards", CreditCard, "Cartões"],
    ["goals", Target, "Metas"],
  ];

  return (
    <nav className="bottom-nav">
      {items.map(([id, Icon, label]) => (
        <button key={id} className={page === id ? "active" : ""} onClick={() => onChange(id)}>
          <Icon size={22} strokeWidth={2.2} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
