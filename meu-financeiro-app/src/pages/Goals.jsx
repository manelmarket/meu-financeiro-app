import React from "react";
import { useState } from "react";
const money = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function Goals({ data, onAdd }) {
  const [nome,setNome]=useState("");
  const [objetivo,setObjetivo]=useState("");
  return <div className="page">
    <header className="topbar"><div><div className="eyebrow">Planejamento</div><h1>Minhas metas</h1></div></header>
    {data.metas.map(m=>{
      const pct=Math.min(100,Math.round(m.atual/m.objetivo*100));
      return <section className="section-card" key={m.id}>
        <div className="goal-head"><div><b>{m.nome}</b><span>{money(m.atual)} de {money(m.objetivo)}</span></div><strong>{pct}%</strong></div>
        <div className="bar"><i style={{width:`${pct}%`}} /></div>
      </section>
    })}
    <section className="section-card form">
      <h2>Nova meta</h2>
      <label>Nome<input value={nome} onChange={e=>setNome(e.target.value)} placeholder="Ex.: Viagem" /></label>
      <label>Valor objetivo<input inputMode="decimal" value={objetivo} onChange={e=>setObjetivo(e.target.value)} placeholder="5000" /></label>
      <button className="primary" onClick={()=>{const v=Number(String(objetivo).replace(",",".")); if(nome.trim()&&v>0){onAdd({id:Date.now(),nome:nome.trim(),objetivo:v,atual:0}); setNome(""); setObjetivo("");}}}>Criar meta</button>
    </section>
  </div>
}
