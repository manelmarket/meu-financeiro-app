import React, { useMemo, useState } from "react";
import MonthPicker from "../components/MonthPicker.jsx";
import { mesDaData, money, nomeMes, parseValor } from "../lib/formato.js";
import { orcamentoDoMes, porcentagem } from "../lib/orcamento.js";
import { infoDaCategoria, mapaDeCategorias } from "../lib/categorias.js";

function FormLimite({ categoria, limite, onSalvar, onRemover, onCancelar }) {
  const [valor, setValor] = useState(limite ? String(limite).replace(".", ",") : "");
  const [erro, setErro] = useState("");

  function salvar() {
    const n = parseValor(valor);
    if (!(n > 0)) return setErro("Informe o limite por mês (ex.: 800,00).");
    onSalvar(n);
  }

  return (
    <div className="form orc-form">
      <label>
        Limite por mês para {categoria}
        <input
          inputMode="decimal"
          autoFocus
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") salvar();
          }}
          placeholder="800,00"
        />
      </label>
      {erro && <p className="form-error">{erro}</p>}
      <div className="actions">
        <button type="button" className="ghost" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="button" className="primary" onClick={salvar}>
          Salvar
        </button>
      </div>
      {limite ? (
        <button type="button" className="link orc-remover" onClick={onRemover}>
          Remover o limite de {categoria}
        </button>
      ) : null}
    </div>
  );
}

function textoDaLinha(l) {
  if (!l.limite) return l.gasto > 0 ? "Sem limite" : "Sem gastos e sem limite";
  if (l.gasto > l.limite) return `${money(l.gasto - l.limite)} acima do limite · ${l.porcentagem}%`;
  if (l.gasto === l.limite) return "Chegou ao limite · 100%";
  if (l.nivel === "perto") return `Perto do limite: faltam ${money(l.restante)} · ${l.porcentagem}%`;
  return `Faltam ${money(l.restante)} · ${l.porcentagem}%`;
}

export default function Orcamentos({ data, hoje, onBack, onSave }) {
  const mesHoje = mesDaData(hoje);
  const [mes, setMes] = useState(mesHoje);
  const [editando, setEditando] = useState(null);
  const r = useMemo(() => orcamentoDoMes(data, mes, hoje), [data, mes, hoje]);
  const mapa = useMemo(() => mapaDeCategorias(data), [data]);

  function salvar(categoria, limite) {
    onSave(categoria, limite);
    setEditando(null);
  }

  function remover(categoria) {
    if (!window.confirm(`Remover o limite de ${categoria}? Os gastos continuam como estão.`)) return;
    onSave(categoria, null);
    setEditando(null);
  }

  const temLimite = r.totalLimite > 0;

  return (
    <div className="page">
      <header className="topbar with-back">
        <button className="back" onClick={onBack} aria-label="Voltar">
          ←
        </button>
        <div>
          <div className="eyebrow">Planejamento</div>
          <h1>🧮 Orçamentos</h1>
        </div>
      </header>

      <MonthPicker mes={mes} mesHoje={mesHoje} onChange={setMes} />

      <section className="balance-card">
        <span>Orçamento de {nomeMes(mes)}</span>
        <strong className={temLimite && r.totalGasto > r.totalLimite ? "neg" : ""}>
          {temLimite ? money(r.totalLimite) : "Sem limites ainda"}
        </strong>
        <small>
          {temLimite
            ? `Gasto nessas categorias: ${money(r.totalGasto)} (${porcentagem(r.totalGasto, r.totalLimite)}%) · ${
                r.totalRestante >= 0 ? `restam ${money(r.totalRestante)}` : `${money(-r.totalRestante)} acima`
              }`
            : "Defina quanto quer gastar por mês em cada categoria."}
        </small>
      </section>

      <section className="section-card">
        <div className="section-title">
          <h2 className="no-margin">Limites por categoria</h2>
        </div>
        {r.linhas.map((l) => (
          <div className={`orc-linha${l.nivel ? ` ${l.nivel}` : ""}`} key={l.categoria}>
            <div className="orc-topo">
              <b>
                <span aria-hidden="true">{infoDaCategoria(data, l.categoria, mapa).icone}</span> {l.categoria}
              </b>
              <span>{l.limite ? `${money(l.gasto)} de ${money(l.limite)}` : money(l.gasto)}</span>
            </div>
            {l.limite ? (
              <div
                className="bar orc-barra"
                role="progressbar"
                aria-label={`Orçamento de ${l.categoria}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.min(100, l.porcentagem)}
              >
                <i style={{ width: `${Math.min(100, Math.max(3, l.uso * 100))}%` }} />
              </div>
            ) : null}
            <div className="orc-rodape">
              <small>{textoDaLinha(l)}</small>
              {editando !== l.categoria && (
                <button type="button" className="link" onClick={() => setEditando(l.categoria)}>
                  {l.limite ? "Editar" : "Definir limite"}
                </button>
              )}
            </div>
            {editando === l.categoria && (
              <FormLimite
                key={l.categoria}
                categoria={l.categoria}
                limite={l.limite}
                onSalvar={(v) => salvar(l.categoria, v)}
                onRemover={() => remover(l.categoria)}
                onCancelar={() => setEditando(null)}
              />
            )}
          </div>
        ))}
      </section>

      <p className="muted small orc-nota">
        O gasto de cada categoria é o mesmo do Meu mês: lançamentos, faturas de cartão que vencem no mês e contas
        fixas. O Início avisa quando uma categoria chega a 80% do limite e quando passa de 100%. Os limites valem
        para todos os meses e vão para a nuvem junto com os seus dados.
      </p>
    </div>
  );
}
