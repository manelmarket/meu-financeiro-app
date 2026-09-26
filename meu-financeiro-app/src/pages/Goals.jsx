import React, { useState } from "react";
import RingMeter from "../components/RingMeter.jsx";
import { dataBR, money, parseValor } from "../lib/formato.js";

function GoalForm({ inicial, onSave, onCancel }) {
  const [nome, setNome] = useState(inicial?.nome || "");
  const [objetivo, setObjetivo] = useState(inicial ? String(inicial.objetivo).replace(".", ",") : "");
  const [guardado, setGuardado] = useState(inicial ? String(inicial.atual).replace(".", ",") : "");
  const [erro, setErro] = useState("");

  function salvar() {
    const valorObjetivo = parseValor(objetivo);
    const valorGuardado = guardado.trim() ? parseValor(guardado) : 0;
    if (!nome.trim()) return setErro("Informe o nome da meta.");
    if (!(valorObjetivo > 0)) return setErro("Informe o valor da meta (ex.: 50.000).");
    if (!(valorGuardado >= 0)) return setErro("Informe quanto já está guardado (ou deixe em branco).");
    onSave({ ...(inicial ? { id: inicial.id } : {}), nome: nome.trim(), objetivo: valorObjetivo, atual: valorGuardado });
    if (!inicial) {
      setNome("");
      setObjetivo("");
      setGuardado("");
    }
    setErro("");
  }

  return (
    <section className="section-card form">
      <h2>{inicial ? "Editar meta" : "Nova meta"}</h2>
      <label>
        Nome
        <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Comprar carro" />
      </label>
      <div className="grid2 tight">
        <label>
          Valor da meta
          <input inputMode="decimal" value={objetivo} onChange={(e) => setObjetivo(e.target.value)} placeholder="50.000" />
        </label>
        <label>
          Já guardado
          <input inputMode="decimal" value={guardado} onChange={(e) => setGuardado(e.target.value)} placeholder="0,00" />
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
          {inicial ? "Salvar" : "Criar meta"}
        </button>
      </div>
    </section>
  );
}

function Movimento({ meta, tipo, onConfirm, onCancel }) {
  const [valor, setValor] = useState("");
  const [erro, setErro] = useState("");
  const deposito = tipo === "depositar";

  function confirmar() {
    const v = parseValor(valor);
    if (!(v > 0)) return setErro("Informe um valor maior que zero.");
    if (!deposito && v > Number(meta.atual || 0)) return setErro(`Só há ${money(meta.atual)} guardados nesta meta.`);
    onConfirm(deposito ? v : -v);
  }

  return (
    <div className="inline-form">
      <label>
        {deposito ? "Quanto vai guardar?" : "Quanto vai retirar?"}
        <input autoFocus inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0,00" />
      </label>
      {erro && <p className="form-error">{erro}</p>}
      <div className="actions">
        <button type="button" className="ghost" onClick={onCancel}>
          Cancelar
        </button>
        <button type="button" className="primary" onClick={confirmar}>
          {deposito ? "Guardar" : "Retirar"}
        </button>
      </div>
    </div>
  );
}

export default function Goals({ data, onSave, onDelete, onMove }) {
  const [editando, setEditando] = useState(null);
  const [movendo, setMovendo] = useState(null); // { id, tipo }

  const metas = data.metas || [];
  const totalGuardado = metas.reduce((t, m) => t + Number(m.atual || 0), 0);
  const totalObjetivo = metas.reduce((t, m) => t + Number(m.objetivo || 0), 0);

  function excluir(meta) {
    if (window.confirm(`Excluir a meta "${meta.nome}"?`)) onDelete(meta.id);
  }

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <div className="eyebrow">Planejamento</div>
          <h1>🎯 Minhas metas</h1>
        </div>
      </header>

      {metas.length > 0 && (
        <section className="balance-card">
          <span>Guardado nas metas</span>
          <strong>{money(totalGuardado)}</strong>
          <small>
            de {money(totalObjetivo)} ({totalObjetivo > 0 ? Math.min(100, Math.floor((totalGuardado / totalObjetivo) * 100)) : 0}%)
          </small>
        </section>
      )}

      {metas.map((meta) => {
        const objetivo = Number(meta.objetivo) || 0;
        const atual = Number(meta.atual) || 0;
        const pct = objetivo > 0 ? (atual / objetivo) * 100 : 0;
        const atingida = objetivo > 0 && atual >= objetivo;
        const ultimos = [...(meta.historico || [])].slice(-3).reverse();

        if (editando === meta.id) {
          return (
            <GoalForm
              key={meta.id}
              inicial={meta}
              onSave={(m) => {
                onSave(m);
                setEditando(null);
              }}
              onCancel={() => setEditando(null)}
            />
          );
        }

        return (
          <section className="section-card goal-card" key={meta.id}>
            <div className="goal-main">
              <RingMeter percentual={pct} />
              <div className="goal-info">
                <b>{meta.nome}</b>
                <span>
                  Meta: <strong>{money(objetivo)}</strong>
                </span>
                <span>
                  Guardado: <strong>{money(atual)}</strong>
                </span>
                {atingida ? (
                  <span className="goal-ok">✅ Meta atingida</span>
                ) : (
                  <span className="muted small">Faltam {money(objetivo - atual)}</span>
                )}
              </div>
            </div>

            {movendo?.id === meta.id ? (
              <Movimento
                meta={meta}
                tipo={movendo.tipo}
                onConfirm={(valor) => {
                  onMove(meta.id, valor);
                  setMovendo(null);
                }}
                onCancel={() => setMovendo(null)}
              />
            ) : (
              <div className="row-actions">
                <button className="chip-btn ok" onClick={() => setMovendo({ id: meta.id, tipo: "depositar" })}>
                  + Guardar
                </button>
                <button className="chip-btn neutral" onClick={() => setMovendo({ id: meta.id, tipo: "retirar" })}>
                  − Retirar
                </button>
                <button className="chip-btn edit" onClick={() => setEditando(meta.id)}>
                  ✏️ Editar
                </button>
                <button className="chip-btn danger" onClick={() => excluir(meta)}>
                  🗑 Excluir
                </button>
              </div>
            )}

            {ultimos.length > 0 && (
              <div className="goal-history">
                {ultimos.map((h) => (
                  <span key={h.id}>
                    {dataBR(h.data)} · {h.valor >= 0 ? "+" : "−"}
                    {money(Math.abs(h.valor))}
                  </span>
                ))}
              </div>
            )}
          </section>
        );
      })}

      {metas.length === 0 && <p className="muted empty">Nenhuma meta criada ainda.</p>}

      <GoalForm onSave={onSave} />
    </div>
  );
}
