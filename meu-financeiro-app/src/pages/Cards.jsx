import React from "react";
import { useState } from "react";
const money = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function Cards({ data, onAdd }) {
  const [nome,setNome]=useState("");
  const [limite,setLimite]=useState("");
  return <div className="page">
    <header className="topbar"><div><div className="eyebrow">Crédito</div><h1>Meus cartões</h1></div></header>
    {data.cartoes.map(c=><section className="credit-card" key={c.id}>
      <span>{c.nome}</span><strong>{money(c.limite)}</strong>
      <small>Usado {money(c.usado)} · Livre {money(c.limite-c.usado)}</small>
      <div className="bar dark"><i style={{width:`${Math.min(100,c.usado/c.limite*100)}%`}} /></div>
      <small>Vencimento dia {c.vencimento}</small>
    </section>)}
    <section className="section-card form">
      <h2>Adicionar cartão</h2>
      <label>Nome<input value={nome} onChange={e=>setNome(e.target.value)} placeholder="Ex.: Inter" /></label>
      <label>Limite<input inputMode="decimal" value={limite} onChange={e=>setLimite(e.target.value)} placeholder="5000" /></label>
      <button className="primary" onClick={()=>{const v=Number(String(limite).replace(",",".")); if(nome.trim()&&v>0){onAdd({id:Date.now(),nome:nome.trim(),limite:v,usado:0,vencimento:10}); setNome(""); setLimite("");}}}>Adicionar</button>
    </section>
  </div>
}
