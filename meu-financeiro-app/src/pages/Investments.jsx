import React, { useState } from "react";
import { TIPOS_INVESTIMENTO } from "../lib/categorias.js";
import { arredondar, money, parseValor } from "../lib/formato.js";
import { totaisDeInvestimentos } from "../lib/patrimonio.js";

function pctRendimento(investido, rendimento) {
  if (!(investido > 0)) return "";
  const p = (rendimento / investido) * 100;
  return `${p >= 0 ? "+" : ""}${p.toFixed(2).replace(".", ",")}%`;
}

function InvestmentForm({ inicial, onSave, onCancel }) {
  const [nome, setNome] = useState(inicial?.nome || "");
  const [tipo, setTipo] = useState(inicial?.tipo || "CDB");
  const [investido, setInvestido] = useState(inicial ? String(inicial.investido).replace(".", ",") : "");
  const [atual, setAtual] = useState(inicial ? String(inicial.atual).replace(".", ",") : "");
  const [erro, setErro] = useState("");

  function salvar() {
    const valorInvestido = parseValor(investido);
    const valorAtual = atual.trim() ? parseValor(atual) : valorInvestido;
    if (!nome.trim()) return setErro("Informe o nome (ex.: CDB Banco X).");
    if (!(valorInvestido > 0)) return setErro("Informe quanto foi investido.");
    if (!(valorAtual >= 0)) return setErro("Informe o valor atual (ou deixe em branco).");
    onSave({ ...(inicial ? { id: inicial.id } : {}), nome: nome.trim(), tipo, investido: valorInvestido, atual: valorAtual });
    if (!inicial) {
      setNome("");
      setInvestido("");
      setAtual("");
    }
    setErro("");
  }

  return (
    <section className="section-card form">
      <h2>{inicial ? "Editar investimento" : "Novo investimento"}</h2>
      <label>
        Nome
        <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: CDB Banco Inter" />
      </label>
      <label>
        Tipo
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          {TIPOS_INVESTIMENTO.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <div className="grid2 tight">
        <label>
          Valor investido
          <input inputMode="decimal" value={investido} onChange={(e) => setInvestido(e.target.value)} placeholder="10.000" />
        </label>
        <label>
          Valor atual
          <input inputMode="decimal" value={atual} onChange={(e) => setAtual(e.target.value)} placeholder="igual ao investido" />
        </label>
      </div>
      {erro && <p className="form-error">{erro}</p>}
      <div className="actions">
        {onCancel && (
          <button type="button" className="ghost" onClick={onCancel}>
            Cancelar
          </button>
        )}
        <button type="button" className="primary" onClick={salvar}>
          {inicial ? "Salvar" : "Adicionar"}
        </button>
      </div>
    </section>
  );
}

function AtualizarValor({ investimento, onSave, onCancel }) {
  const [valor, setValor] = useState(String(investimento.atual).replace(".", ","));
  const [erro, setErro] = useState("");
  return (
    <div className="inline-form">
      <label>
        Valor atual (veja no app do banco/corretora)
        <input autoFocus inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value)} />
      </label>
      {erro && <p className="form-error">{erro}</p>}
      <div className="actions">
        <button type="button" className="ghost" onClick={onCancel}>
          Cancelar
        </button>
        <button
          type="button"
          className="primary"
          onClick={() => {
            const v = parseValor(valor);
            if (!(v >= 0)) return setErro("Informe um valor válido.");
            onSave({ ...investimento, atual: v });
          }}
        >
          Salvar
        </button>
      </div>
    </div>
  );
}

export default function Investments({ data, onBack, onSave, onDelete }) {
  const [editando, setEditando] = useState(null);
  const [atualizando, setAtualizando] = useState(null);
  const lista = data.investimentos || [];
  const totais = totaisDeInvestimentos(lista);

  const porTipo = TIPOS_INVESTIMENTO.map((tipo) => ({
    tipo,
    valor: arredondar(lista.filter((i) => i.tipo === tipo).reduce((t, i) => t + Number(i.atual || 0), 0))
  })).filter((t) => t.valor > 0);
  const maior = Math.max(1, ...porTipo.map((t) => t.valor));

  function excluir(inv) {
    if (!window.confirm(`Excluir o investimento "${inv.nome}"?`)) return;
    if (editando?.id === inv.id) setEditando(null);
    if (atualizando === inv.id) setAtualizando(null);
    onDelete(inv.id);
  }

  return (
    <div className="page">
      <header className="topbar with-back">
        <button className="back" onClick={onBack} aria-label="Voltar">
          ←
        </button>
        <div>
          <div className="eyebrow">Carteira</div>
          <h1>📈 Investimentos</h1>
        </div>
      </header>

      <section className="balance-card">
        <span>Total</span>
        <strong>{money(totais.total)}</strong>
        <small>Valor atual de todos os investimentos</small>
      </section>

      <div className="grid2">
        <section className="mini-card">
          <span>Investido</span>
          <strong>{money(totais.investido)}</strong>
        </section>
        <section className={`mini-card ${totais.rendimento >= 0 ? "positive" : "negative"}`}>
          <span>Rendimento</span>
          <strong>
            {totais.rendimento >= 0 ? "+" : ""}
            {money(totais.rendimento)}
          </strong>
          <small className="muted">{pctRendimento(totais.investido, totais.rendimento)}</small>
        </section>
      </div>

      {porTipo.length > 0 && (
        <section className="section-card">
          <div className="section-title">
            <h2 className="no-margin">Por tipo</h2>
          </div>
          {porTipo.map((t) => (
            <div className="cat-row" key={t.tipo}>
              <div className="cat-head">
                <span>{t.tipo}</span>
                <b>
                  {money(t.valor)} · {Math.round((t.valor / totais.total) * 100)}%
                </b>
              </div>
              <div className="bar viz">
                <i style={{ width: `${Math.max(4, (t.valor / maior) * 100)}%` }} />
              </div>
            </div>
          ))}
        </section>
      )}

      {editando && (
        <InvestmentForm
          key={editando.id}
          inicial={editando}
          onSave={(i) => {
            onSave(i);
            setEditando(null);
          }}
          onCancel={() => setEditando(null)}
        />
      )}

      <section className="section-card">
        <div className="section-title">
          <h2 className="no-margin">Meus investimentos</h2>
        </div>
        {lista.length === 0 && <p className="muted">Nenhum investimento cadastrado.</p>}
        {lista.map((inv) => {
          const rendimento = arredondar(Number(inv.atual || 0) - Number(inv.investido || 0));
          return (
            <div className="purchase" key={inv.id}>
              <div className="purchase-top">
                <b>{inv.nome}</b>
                <b>{money(inv.atual)}</b>
              </div>
              <small className="muted">
                {inv.tipo} · investido {money(inv.investido)} ·{" "}
                <span className={rendimento >= 0 ? "in" : "out"}>
                  {rendimento >= 0 ? "+" : ""}
                  {money(rendimento)} ({pctRendimento(inv.investido, rendimento)})
                </span>
              </small>
              {atualizando === inv.id ? (
                <AtualizarValor
                  investimento={inv}
                  onSave={(i) => {
                    onSave(i);
                    setAtualizando(null);
                  }}
                  onCancel={() => setAtualizando(null)}
                />
              ) : (
                <div className="row-actions">
                  <button
                    className="chip-btn ok"
                    onClick={() => {
                      setEditando(null);
                      setAtualizando(inv.id);
                    }}
                  >
                    Atualizar valor
                  </button>
                  <button
                    className="chip-btn edit"
                    onClick={() => {
                      setAtualizando(null);
                      setEditando(inv);
                    }}
                  >
                    ✏️ Editar
                  </button>
                  <button className="chip-btn danger" onClick={() => excluir(inv)}>
                    🗑 Excluir
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </section>

      {!editando && <InvestmentForm onSave={onSave} />}
    </div>
  );
}
