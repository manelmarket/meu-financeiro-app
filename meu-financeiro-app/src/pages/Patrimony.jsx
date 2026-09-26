import React, { useState } from "react";
import { TIPOS_BEM } from "../lib/categorias.js";
import { money, parseValor } from "../lib/formato.js";
import { patrimonio } from "../lib/patrimonio.js";

function BemForm({ inicial, onSave, onCancel }) {
  const [nome, setNome] = useState(inicial?.nome || "");
  const [tipo, setTipo] = useState(inicial?.tipo || "Imóvel");
  const [valor, setValor] = useState(inicial ? String(inicial.valor).replace(".", ",") : "");
  const [erro, setErro] = useState("");

  function salvar() {
    const v = parseValor(valor);
    if (!nome.trim()) return setErro("Informe o nome (ex.: Carro, Casa, Financiamento).");
    if (!(v > 0)) return setErro("Informe o valor.");
    onSave({ ...(inicial ? { id: inicial.id } : {}), nome: nome.trim(), tipo, valor: v });
    if (!inicial) {
      setNome("");
      setValor("");
    }
    setErro("");
  }

  return (
    <section className="section-card form">
      <h2>{inicial ? "Editar item" : "Adicionar bem ou dívida"}</h2>
      <label>
        Nome
        <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Carro" />
      </label>
      <div className="grid2 tight">
        <label>
          Tipo
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            {TIPOS_BEM.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label>
          {tipo === "Dívida" ? "Quanto falta pagar" : "Valor"}
          <input inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="50.000" />
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

export default function Patrimony({ data, onBack, onSave, onDelete, onOpenInvestments }) {
  const [editando, setEditando] = useState(null);
  const p = patrimonio(data);

  function excluir(item) {
    if (!window.confirm(`Excluir "${item.nome}"?`)) return;
    if (editando?.id === item.id) setEditando(null);
    onDelete(item.id);
  }

  function linha(item, negativo) {
    return (
      <div className="asset-row" key={item.id}>
        <div>
          <b>{item.nome}</b>
          <small className="muted">{item.tipo}</small>
        </div>
        <strong className={negativo ? "out" : ""}>
          {negativo ? "−" : ""}
          {money(item.valor)}
        </strong>
        <div className="row-actions">
          <button className="chip-btn edit" onClick={() => setEditando(item)}>
            ✏️ Editar
          </button>
          <button className="chip-btn danger" onClick={() => excluir(item)}>
            🗑 Excluir
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="topbar with-back">
        <button className="back" onClick={onBack} aria-label="Voltar">
          ←
        </button>
        <div>
          <div className="eyebrow">Planejamento</div>
          <h1>🏦 Meu patrimônio</h1>
        </div>
      </header>

      <section className="balance-card">
        <span>Patrimônio líquido</span>
        <strong className={p.liquido < 0 ? "neg" : ""}>{money(p.liquido)}</strong>
        <small>
          Bens {money(p.totalBens)} + investimentos {money(p.investimentos)}
          {p.totalDividas > 0 ? ` − dívidas ${money(p.totalDividas)}` : ""}
        </small>
      </section>

      {editando && (
        <BemForm
          key={editando.id}
          inicial={editando}
          onSave={(b) => {
            onSave(b);
            setEditando(null);
          }}
          onCancel={() => setEditando(null)}
        />
      )}

      <section className="section-card">
        <div className="section-title">
          <h2 className="no-margin">Bens</h2>
          <b>{money(p.totalBens)}</b>
        </div>
        {p.bens.length === 0 && <p className="muted">Nenhum bem cadastrado.</p>}
        {p.bens.map((b) => (
          linha(b, false)
        ))}
        <button type="button" className="asset-row asset-link" onClick={onOpenInvestments}>
          <div>
            <b>Investimentos</b>
            <small className="muted">vem da tela Investimentos · toque para abrir</small>
          </div>
          <strong>{money(p.investimentos)}</strong>
        </button>
      </section>

      {p.dividas.length > 0 && (
        <section className="section-card">
          <div className="section-title">
            <h2 className="no-margin">Dívidas</h2>
            <b className="out">−{money(p.totalDividas)}</b>
          </div>
          {p.dividas.map((b) => (
            linha(b, true)
          ))}
        </section>
      )}

      {!editando && <BemForm onSave={onSave} />}
    </div>
  );
}
