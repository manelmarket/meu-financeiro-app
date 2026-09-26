import React from "react";
import { useState } from "react";
import { CATEGORIAS, FORMAS_PAGAMENTO } from "../lib/categorias.js";
import { hojeISO, parseValor } from "../lib/formato.js";

export default function NewEntry({ onSave, onCancel }) {
  const [tipo, setTipo] = useState("saida");
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("Alimentação");
  const [pagamento, setPagamento] = useState("Pix");
  const [erro, setErro] = useState("");

  function submit(e){
    e.preventDefault();
    const v = parseValor(valor);
    if(!(v > 0)) return setErro("Informe um valor maior que zero (ex.: 1.250,50).");
    if(!descricao.trim()) return setErro("Informe a descrição.");
    onSave({
      id: Date.now(),
      tipo,
      descricao: descricao.trim(),
      categoria: tipo === "entrada" ? "Receita" : categoria,
      valor: v,
      pagamento,
      data: hojeISO()
    });
  }

  return (
    <div className="page">
      <header className="topbar"><div><div className="eyebrow">Novo lançamento</div><h1>Registrar movimentação</h1></div></header>
      <form className="section-card form" onSubmit={submit}>
        <div className="segmented">
          <button type="button" className={tipo==="saida"?"selected danger":""} onClick={()=>setTipo("saida")}>Gasto</button>
          <button type="button" className={tipo==="entrada"?"selected success":""} onClick={()=>setTipo("entrada")}>Receita</button>
        </div>
        <label>Valor<input inputMode="decimal" placeholder="0,00" value={valor} onChange={e=>{setValor(e.target.value); setErro("");}} /></label>
        <label>Descrição<input placeholder="Ex.: Mercado" value={descricao} onChange={e=>{setDescricao(e.target.value); setErro("");}} /></label>
        {tipo==="saida" && <label>Categoria<select value={categoria} onChange={e=>setCategoria(e.target.value)}>
          {CATEGORIAS.map(x=><option key={x}>{x}</option>)}
        </select></label>}
        <label>Pagamento<select value={pagamento} onChange={e=>setPagamento(e.target.value)}>
          {FORMAS_PAGAMENTO.map(x=><option key={x}>{x}</option>)}
        </select></label>
        {erro && <p className="form-error">{erro}</p>}
        <div className="actions"><button type="button" className="ghost" onClick={onCancel}>Cancelar</button><button className="primary">Salvar</button></div>
      </form>
    </div>
  );
}
