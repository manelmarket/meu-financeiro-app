import React from "react";
import { useState } from "react";
import ScanButton from "../components/ScanButton.jsx";
import { CATEGORIAS, FORMAS_PAGAMENTO } from "../lib/categorias.js";
import { dataBR, dataValida, hojeISO, money, parseValor, rotuloMes } from "../lib/formato.js";
import { datasDaFatura, mesDaFatura, valoresDasParcelas } from "../lib/cartao.js";
import { salvarCupom } from "../storage/cupons.js";

const OPCOES_PARCELAS = Array.from({ length: 12 }, (_, i) => i + 1);

export default function NewEntry({ cartoes = [], onSave, onSavePurchase, onCancel, onConfigurarIA }) {
  const [tipo, setTipo] = useState("saida");
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("Alimentação");
  const [pagamento, setPagamento] = useState("Pix");
  const [data, setData] = useState(hojeISO());
  const [cartaoId, setCartaoId] = useState(cartoes[0]?.id ?? null);
  const [parcelas, setParcelas] = useState(1);
  const [foto, setFoto] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  // "Cartão" num gasto vira compra no cartão escolhido (entra na fatura, sem contar em dobro)
  const noCartao = tipo === "saida" && pagamento === "Cartão" && cartoes.length > 0;
  const cartao = cartoes.find((c) => c.id === cartaoId) || cartoes[0];
  const valorNumero = parseValor(valor);

  let destino = null;
  if (noCartao && cartao && valorNumero > 0 && dataValida(data)) {
    const mes = mesDaFatura(cartao, data);
    const valores = valoresDasParcelas(valorNumero, parcelas);
    destino = `${parcelas > 1 ? `${parcelas}x de ${money(valores[valores.length - 1])} · ` : ""}1ª parcela na fatura de ${rotuloMes(mes)} do ${cartao.nome} (vence ${dataBR(datasDaFatura(cartao, mes).vencimento)})`;
  }

  function preencherPeloCupom(lido, blob) {
    if (lido.valor) setValor(lido.valor.toFixed(2).replace(".", ","));
    if (lido.descricao) setDescricao(lido.descricao);
    if (lido.data) setData(lido.data);
    if (lido.categoria) setCategoria(lido.categoria);
    setTipo("saida");
    setFoto(blob);
    setErro("");
  }

  async function submit(e){
    e.preventDefault();
    if(!(valorNumero > 0)) return setErro("Informe um valor maior que zero (ex.: 1.250,50).");
    if(!descricao.trim()) return setErro("Informe a descrição.");
    if(!dataValida(data)) return setErro("Informe a data.");

    if(noCartao && cartao){
      setSalvando(true);
      const id = Date.now();
      let cupomId = null;
      if(foto){
        try{
          cupomId = `cupom-${id}`;
          await salvarCupom(cupomId, foto);
        }catch{
          cupomId = null;
        }
      }
      onSavePurchase(cartao.id, {
        id,
        descricao: descricao.trim(),
        categoria,
        data,
        valorTotal: valorNumero,
        parcelas: Number(parcelas),
        ...(cupomId ? { cupomId } : {})
      });
      return;
    }

    onSave({
      id: Date.now(),
      tipo,
      descricao: descricao.trim(),
      categoria: tipo === "entrada" ? "Receita" : categoria,
      valor: valorNumero,
      pagamento,
      data
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

        {tipo==="saida" && <ScanButton onResult={preencherPeloCupom} onConfigurar={onConfigurarIA} />}
        {foto && <p className="hint">📷 Foto do cupom lida{noCartao ? " e guardada junto com a compra" : ""}. Confira os campos antes de salvar.</p>}

        <label>Valor<input inputMode="decimal" placeholder="0,00" value={valor} onChange={e=>{setValor(e.target.value); setErro("");}} /></label>
        <label>Descrição<input placeholder="Ex.: Mercado" value={descricao} onChange={e=>{setDescricao(e.target.value); setErro("");}} /></label>
        {tipo==="saida" && <label>Categoria<select value={categoria} onChange={e=>setCategoria(e.target.value)}>
          {CATEGORIAS.map(x=><option key={x}>{x}</option>)}
        </select></label>}
        <label>Pagamento<select value={pagamento} onChange={e=>setPagamento(e.target.value)}>
          {FORMAS_PAGAMENTO.map(x=><option key={x}>{x}</option>)}
        </select></label>

        {noCartao && (
          <div className="grid2 tight">
            <label>Cartão<select value={cartao?.id ?? ""} onChange={e=>setCartaoId(Number(e.target.value))}>
              {cartoes.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}
            </select></label>
            <label>Parcelas<select value={parcelas} onChange={e=>setParcelas(Number(e.target.value))}>
              {OPCOES_PARCELAS.map(n=><option key={n} value={n}>{n===1?"1x (à vista)":`${n}x`}</option>)}
            </select></label>
          </div>
        )}
        {tipo==="saida" && pagamento==="Cartão" && cartoes.length===0 && (
          <p className="hint">Você ainda não tem cartão cadastrado: este gasto será salvo como lançamento comum.</p>
        )}

        <label>Data<input type="date" value={data} onChange={e=>{setData(e.target.value); setErro("");}} /></label>

        {destino && <p className="hint">{destino}</p>}
        {erro && <p className="form-error">{erro}</p>}
        <div className="actions"><button type="button" className="ghost" onClick={onCancel}>Cancelar</button><button className="primary" disabled={salvando}>Salvar</button></div>
      </form>
    </div>
  );
}
