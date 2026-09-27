import React from "react";
import { useMemo, useState } from "react";
import { acharBanco } from "../lib/saldos.js";
const money = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// "Pix (Nubank) + Dinheiro" — e, se parte do gasto foi no cartão, "+ cartão Itaú"
function comoFoiPago(item, data) {
  let texto = String(item.pagamento || "");
  if (Array.isArray(item.formas) && item.formas.length) {
    texto = item.formas
      .map((f) => {
        const banco = acharBanco(data, f?.bancoId);
        const valor = item.formas.length > 1 ? ` ${money(Number(f?.valor) || 0)}` : "";
        return `${f?.forma || ""}${valor}${banco ? ` (${banco.nome})` : ""}`;
      })
      .join(" + ");
  }
  if (item.grupo != null) {
    const cartoes = (data.cartoes || []).filter((c) => (c.compras || []).some((x) => x.grupo === item.grupo)).map((c) => c.nome);
    if (cartoes.length) texto += ` + cartão ${cartoes.join(", ")}`;
  }
  return texto;
}

export default function History({ data, onDelete }) {
  const [busca,setBusca]=useState("");
  const [filtro,setFiltro]=useState("todos");
  const lista = useMemo(()=>[...data.lancamentos]
    .filter(x=>filtro==="todos" || x.tipo===filtro)
    .filter(x=>x.descricao.toLowerCase().includes(busca.toLowerCase()))
    .sort((a,b)=>b.id-a.id),[data,busca,filtro]);

  return <div className="page">
    <header className="topbar"><div><div className="eyebrow">Movimentações</div><h1>Histórico</h1></div></header>
    <section className="section-card">
      <input className="search" placeholder="Buscar lançamento..." value={busca} onChange={e=>setBusca(e.target.value)} />
      <div className="chips">
        <button className={filtro==="todos"?"active-chip":""} onClick={()=>setFiltro("todos")}>Todos</button>
        <button className={filtro==="entrada"?"active-chip":""} onClick={()=>setFiltro("entrada")}>Receitas</button>
        <button className={filtro==="saida"?"active-chip":""} onClick={()=>setFiltro("saida")}>Gastos</button>
      </div>
      {lista.map(item=><div className="transaction" key={item.id}>
        <div><b>{item.descricao}</b><span>{item.categoria} · {comoFoiPago(item, data)}</span></div>
        <div className="tx-right"><strong className={item.tipo==="entrada"?"in":"out"}>{item.tipo==="entrada"?"+":"-"}{money(item.valor)}</strong><button className="delete" onClick={()=>onDelete(item.id)}>Excluir</button></div>
      </div>)}
    </section>
  </div>
}
