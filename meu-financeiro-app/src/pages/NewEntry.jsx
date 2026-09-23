import { useState } from "react";

export default function NewEntry({ onSave, onCancel }) {
  const [tipo, setTipo] = useState("saida");
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("Alimentação");
  const [pagamento, setPagamento] = useState("Pix");

  function submit(e){
    e.preventDefault();
    const v = Number(String(valor).replace(",", "."));
    if(!v || v <= 0 || !descricao.trim()) return;
    onSave({
      id: Date.now(),
      tipo,
      descricao: descricao.trim(),
      categoria: tipo === "entrada" ? "Receita" : categoria,
      valor: v,
      pagamento,
      data: new Date().toISOString().slice(0,10)
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
        <label>Valor<input inputMode="decimal" placeholder="0,00" value={valor} onChange={e=>setValor(e.target.value)} /></label>
        <label>Descrição<input placeholder="Ex.: Mercado" value={descricao} onChange={e=>setDescricao(e.target.value)} /></label>
        {tipo==="saida" && <label>Categoria<select value={categoria} onChange={e=>setCategoria(e.target.value)}>
          {["Alimentação","Transporte","Casa","Saúde","Lazer","Compras","Outros"].map(x=><option key={x}>{x}</option>)}
        </select></label>}
        <label>Pagamento<select value={pagamento} onChange={e=>setPagamento(e.target.value)}>
          {["Pix","Cartão","Dinheiro","Débito","Transferência"].map(x=><option key={x}>{x}</option>)}
        </select></label>
        <div className="actions"><button type="button" className="ghost" onClick={onCancel}>Cancelar</button><button className="primary">Salvar</button></div>
      </form>
    </div>
  );
}
