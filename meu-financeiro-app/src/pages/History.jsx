import React from "react";
import { useMemo, useState } from "react";
import { acharBanco } from "../lib/saldos.js";
import { mapaDeCategorias, infoDaCategoria } from "../lib/categorias.js";
import { caminhoDaTransferencia, ehTransferencia, rotuloDoSubtipo } from "../lib/transferencias.js";
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

const FILTROS = [
  ["todos", "Todos"],
  ["entrada", "Receitas"],
  ["saida", "Gastos"],
  ["transferencia", "Transferências"]
];

export default function History({ data, onDelete }) {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const mapa = useMemo(() => mapaDeCategorias(data), [data]);
  const lista = useMemo(
    () =>
      [...data.lancamentos]
        .filter((x) => x && (filtro === "todos" || x.tipo === filtro))
        .filter((x) => String(x.descricao || "").toLowerCase().includes(busca.toLowerCase()))
        .sort((a, b) => b.id - a.id),
    [data, busca, filtro]
  );

  function excluir(item) {
    if (ehTransferencia(item)) {
      const pergunta = `Excluir ${rotuloDoSubtipo(item.subtipo).toLowerCase()} de ${money(item.valor)} (${caminhoDaTransferencia(data, item)})?\n\nO saldo dos bancos volta ao que era.`;
      if (!window.confirm(pergunta)) return;
    }
    onDelete(item.id);
  }

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <div className="eyebrow">Movimentações</div>
          <h1>Histórico</h1>
        </div>
      </header>
      <section className="section-card">
        <input className="search" placeholder="Buscar lançamento..." value={busca} onChange={(e) => setBusca(e.target.value)} />
        <div className="chips">
          {FILTROS.map(([id, rotulo]) => (
            <button key={id} className={filtro === id ? "active-chip" : ""} onClick={() => setFiltro(id)}>
              {rotulo}
            </button>
          ))}
        </div>
        {lista.length === 0 && <p className="muted">Nenhum lançamento por aqui.</p>}
        {lista.map((item) => {
          if (ehTransferencia(item)) {
            return (
              <div className="transaction" key={item.id}>
                <div>
                  <b>{item.descricao || rotuloDoSubtipo(item.subtipo)}</b>
                  <span>
                    <span aria-hidden="true">⇄</span> {caminhoDaTransferencia(data, item)}
                  </span>
                </div>
                <div className="tx-right">
                  <strong className="neutro">{money(item.valor)}</strong>
                  <button className="delete" onClick={() => excluir(item)}>
                    Excluir
                  </button>
                </div>
              </div>
            );
          }
          const c = infoDaCategoria(data, item.categoria, mapa);
          return (
            <div className="transaction" key={item.id}>
              <div>
                <b>{item.descricao}</b>
                <span>
                  <span aria-hidden="true">{c.icone}</span> {c.nome} · {comoFoiPago(item, data)}
                </span>
              </div>
              <div className="tx-right">
                <strong className={item.tipo === "entrada" ? "in" : "out"}>
                  {item.tipo === "entrada" ? "+" : "-"}
                  {money(item.valor)}
                </strong>
                <button className="delete" onClick={() => excluir(item)}>
                  Excluir
                </button>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
