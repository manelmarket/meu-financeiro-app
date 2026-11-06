import React from "react";
import { Paperclip } from "lucide-react";
import EditarLancamento from "../components/EditarLancamento.jsx";
import { useMemo, useState } from "react";
import { acharBanco } from "../lib/saldos.js";
import { mapaDeCategorias, infoDaCategoria } from "../lib/categorias.js";
import { caminhoDaTransferencia, ehTransferencia, rotuloDoSubtipo } from "../lib/transferencias.js";
import { usarAparencia } from "../lib/aparencia.js";
import { resumoDoMes } from "../lib/mes.js";
import { MESES, hojeISO, mesDaData, somarDias } from "../lib/formato.js";
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

// "Hoje · 6 de novembro", "Ontem · 5 de novembro", "3 de novembro", "28 de outubro de 2025"
function tituloDoDia(iso, hoje) {
  const [y, m, d] = String(iso || "").split("-").map(Number);
  if (!y) return "Sem data";
  const base = `${d} de ${MESES[m - 1].toLowerCase()}${String(y) !== hoje.slice(0, 4) ? ` de ${y}` : ""}`;
  if (iso === hoje) return `Hoje · ${base}`;
  if (iso === somarDias(hoje, -1)) return `Ontem · ${base}`;
  return base;
}

export default function History({ data, onDelete, onEditar, onCriarCategoria }) {
  const [editando, setEditando] = useState(null);
  const { estilo } = usarAparencia();
  const moderno = estilo === "banco" || estilo === "vidro";
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

  const lancEditando = editando != null ? data.lancamentos.find((l) => l && l.id === editando) : null;
  const janela = lancEditando && onEditar && (
    <EditarLancamento
      key={lancEditando.id}
      dados={data}
      lancamento={lancEditando}
      onCriarCategoria={onCriarCategoria}
      onFechar={() => setEditando(null)}
      onSalvar={(mudancas) => {
        const r = onEditar(lancEditando.id, mudancas);
        if (!r?.erro) setEditando(null);
        return r;
      }}
      onExcluir={() => {
        if (!window.confirm(`Excluir "${lancEditando.descricao || "lançamento"}"?`)) return;
        onDelete(lancEditando.id);
        setEditando(null);
      }}
    />
  );
  const abrir = (item) => ({
    role: "button",
    tabIndex: 0,
    onClick: () => setEditando(item.id),
    onKeyDown: (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setEditando(item.id);
      }
    }
  });
  const extras = (item) => (
    <>
      {item.cupomId && <Paperclip size={12} className="lanc-clipe" aria-label="tem comprovante" />}
      {item.obs && <em className="lanc-obs">{item.obs}</em>}
    </>
  );

  function excluir(item) {
    if (ehTransferencia(item)) {
      const pergunta = `Excluir ${rotuloDoSubtipo(item.subtipo).toLowerCase()} de ${money(item.valor)} (${caminhoDaTransferencia(data, item)})?\n\nO saldo dos bancos volta ao que era.`;
      if (!window.confirm(pergunta)) return;
    }
    onDelete(item.id);
  }

  if (moderno) {
    const hoje = hojeISO();
    const r = resumoDoMes(data, mesDaData(hoje), hoje);
    const porDia = [];
    for (const item of [...lista].sort((a, b) => String(b.data).localeCompare(String(a.data)) || b.id - a.id)) {
      const titulo = tituloDoDia(item.data, hoje);
      let grupo = porDia[porDia.length - 1];
      if (!grupo || grupo.titulo !== titulo) porDia.push((grupo = { titulo, itens: [] }));
      grupo.itens.push(item);
    }
    return (
      <div className="page extrato">
        <header className="topbar">
          <div>
            <h1>Extrato</h1>
          </div>
        </header>
        <input className="search extrato-busca" placeholder="Buscar lançamento" aria-label="Buscar no extrato" value={busca} onChange={(e) => setBusca(e.target.value)} />
        <div className="chips extrato-filtros" role="radiogroup" aria-label="Filtro">
          {FILTROS.map(([id, rotulo]) => (
            <button key={id} role="radio" aria-checked={filtro === id} className={filtro === id ? "active-chip" : ""} onClick={() => setFiltro(id)}>
              {id === "todos" ? "Tudo" : rotulo}
            </button>
          ))}
        </div>
        <div className="grid2 extrato-resumo">
          <section className="mini-card positive">
            <span>Entradas em {MESES[Number(hoje.slice(5, 7)) - 1].toLowerCase()}</span>
            <strong>{money(r.receitas)}</strong>
          </section>
          <section className="mini-card negative">
            <span>Saídas em {MESES[Number(hoje.slice(5, 7)) - 1].toLowerCase()}</span>
            <strong>{money(r.despesas)}</strong>
          </section>
        </div>
        {porDia.length === 0 && <p className="muted extrato-vazio">Nada por aqui neste filtro.</p>}
        {porDia.map((grupo) => (
          <section className="extrato-dia" key={grupo.titulo}>
            <h2>{grupo.titulo}</h2>
            <div className="section-card extrato-lista">
              {grupo.itens.map((item) => {
                const transf = ehTransferencia(item);
                const c = transf ? null : infoDaCategoria(data, item.categoria, mapa);
                const cor = transf ? "var(--primaria)" : item.tipo === "entrada" ? "var(--ok)" : c.cor;
                return (
                  <div className="transaction extrato-item clicavel" key={item.id} {...abrir(item)}>
                    <span className="extrato-icone" style={{ color: cor, background: `color-mix(in srgb, ${cor} 14%, transparent)` }} aria-hidden="true">
                      {transf ? "⇄" : c.icone}
                    </span>
                    <div className="extrato-texto">
                      <b>{transf ? item.descricao || rotuloDoSubtipo(item.subtipo) : item.descricao}</b>
                      <span>{transf ? caminhoDaTransferencia(data, item) : `${c.nome} · ${comoFoiPago(item, data)}`}</span>
                      {extras(item)}
                    </div>
                    <div className="tx-right">
                      <strong className={transf ? "neutro" : item.tipo === "entrada" ? "in" : ""}>
                        {transf ? "" : item.tipo === "entrada" ? "+" : "−"}
                        {money(item.valor)}
                      </strong>
                      <button className="delete" onClick={(e) => { e.stopPropagation(); excluir(item); }} aria-label={`Excluir ${item.descricao || "lançamento"}`}>
                        Excluir
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
        {janela}
      </div>
    );
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
        <p className="hint extrato-dica">Toque num lançamento para editar.</p>
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
              <div className="transaction clicavel" key={item.id} {...abrir(item)}>
                <div>
                  <b>{item.descricao || rotuloDoSubtipo(item.subtipo)}</b>
                  <span>
                    <span aria-hidden="true">⇄</span> {caminhoDaTransferencia(data, item)}
                  </span>
                  {extras(item)}
                </div>
                <div className="tx-right">
                  <strong className="neutro">{money(item.valor)}</strong>
                  <button className="delete" onClick={(e) => { e.stopPropagation(); excluir(item); }}>
                    Excluir
                  </button>
                </div>
              </div>
            );
          }
          const c = infoDaCategoria(data, item.categoria, mapa);
          return (
            <div className="transaction clicavel" key={item.id} {...abrir(item)}>
              <div>
                <b>{item.descricao}</b>
                <span>
                  <span aria-hidden="true">{c.icone}</span> {c.nome} · {comoFoiPago(item, data)}
                </span>
                {extras(item)}
              </div>
              <div className="tx-right">
                <strong className={item.tipo === "entrada" ? "in" : "out"}>
                  {item.tipo === "entrada" ? "+" : "-"}
                  {money(item.valor)}
                </strong>
                <button className="delete" onClick={(e) => { e.stopPropagation(); excluir(item); }}>
                  Excluir
                </button>
              </div>
            </div>
          );
        })}
      </section>
      {janela}
    </div>
  );
}
