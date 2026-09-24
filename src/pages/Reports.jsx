import React from "react";
import { totals, byCategory } from "../utils/finance";

export default function Reports({data={lancamentos:[]}}){
  const t = totals(data.lancamentos || []);
  const cats = byCategory(data.lancamentos || []);

  return (
    <div className="page">
      <h1>Relatórios</h1>
      <div className="section-card">
        <p>Entradas: R$ {t.entradas}</p>
        <p>Gastos: R$ {t.gastos}</p>
        <p>Saldo: R$ {t.saldo}</p>
      </div>
      <div className="section-card">
        <h2>Gastos por categoria</h2>
        {Object.entries(cats).map(([k,v])=>
          <p key={k}>{k}: R$ {v}</p>
        )}
      </div>
    </div>
  );
}
