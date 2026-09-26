import React from "react";
import { Home, PlusCircle, History, CreditCard, Target, BarChart3 } from "lucide-react";

export default function BottomNav({ page, onChange }) {
  const items=[
["home",Home,"Início"],
["reports",BarChart3,"Relatórios"],
["new",PlusCircle,"Novo"],
["history",History,"Histórico"],
["cards",CreditCard,"Cartões"],
["goals",Target,"Metas"]
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
