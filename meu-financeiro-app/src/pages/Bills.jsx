import React, { useRef, useState } from "react";
import { CATEGORIAS, SUGESTOES_CONTAS } from "../lib/categorias.js";
import { money, parseValor } from "../lib/formato.js";

function BillForm({ inicial, onSave, onCancel }) {
  const [nome, setNome] = useState(inicial?.nome || "");
  const [valor, setValor] = useState(inicial ? String(inicial.valor).replace(".", ",") : "");
  const [dia, setDia] = useState(inicial ? String(inicial.dia) : "");
  const [categoria, setCategoria] = useState(inicial?.categoria || "Casa");
  const [erro, setErro] = useState("");

  const categorias = CATEGORIAS.includes(categoria) ? CATEGORIAS : [...CATEGORIAS, categoria];

  function salvar() {
    const valorNumero = parseValor(valor);
    const diaNumero = parseInt(dia, 10);
    if (!nome.trim()) return setErro("Informe o nome da conta.");
    if (!(valorNumero > 0)) return setErro("Informe o valor por mês (ex.: 126,90).");
    if (!(diaNumero >= 1 && diaNumero <= 31)) return setErro("Informe o dia do vencimento (1 a 31).");
    // só os campos do formulário: "ativa" e os períodos ficam como estão no app
    onSave({ ...(inicial ? { id: inicial.id } : {}), nome: nome.trim(), valor: valorNumero, dia: diaNumero, categoria });
    if (!inicial) {
      setNome("");
      setValor("");
      setDia("");
    }
    setErro("");
  }

  return (
    <section className="section-card form">
      <h2>{inicial ? "Editar conta fixa" : "Nova conta fixa"}</h2>

      {!inicial && (
        <div className="chips no-margin">
          {SUGESTOES_CONTAS.map((s) => (
            <button
              type="button"
              key={s.nome}
              className={nome === s.nome ? "active-chip" : ""}
              onClick={() => {
                setNome(s.nome);
                setCategoria(s.categoria);
              }}
            >
              {s.nome}
            </button>
          ))}
        </div>
      )}

      <label>
        Nome
        <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Internet" />
      </label>

      <div className="grid2 tight">
        <label>
          Valor por mês
          <input inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="126,00" />
        </label>
        <label>
          Todo dia
          <input inputMode="numeric" value={dia} onChange={(e) => setDia(e.target.value)} placeholder="10" />
        </label>
      </div>

      <label>
        Categoria
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          {categorias.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>

      {erro && <p className="form-error">{erro}</p>}

      <div className="actions">
        {onCancel && (
          <button type="button" className="ghost" onClick={onCancel}>
            Cancelar
          </button>
        )}
        <button type="button" className="primary" onClick={salvar}>
          {inicial ? "Salvar" : "Adicionar conta"}
        </button>
      </div>
    </section>
  );
}

export default function Bills({ data, onBack, onSave, onDelete, onToggle }) {
  const [editando, setEditando] = useState(null);
  const topoRef = useRef(null);
  const contas = [...(data.contasFixas || [])].sort(
    (a, b) => Number(b.ativa !== false) - Number(a.ativa !== false) || a.dia - b.dia || a.nome.localeCompare(b.nome)
  );
  const totalAtivas = contas.filter((c) => c.ativa !== false).reduce((t, c) => t + Number(c.valor || 0), 0);

  function excluir(conta) {
    if (window.confirm(`Excluir a conta fixa "${conta.nome}"? Ela sai de todos os meses.`)) onDelete(conta.id);
  }

  return (
    <div className="page" ref={topoRef}>
      <header className="topbar with-back">
        <button className="back" onClick={onBack} aria-label="Voltar">
          ←
        </button>
        <div>
          <div className="eyebrow">Planejamento</div>
          <h1>🔁 Contas fixas</h1>
        </div>
      </header>

      <section className="balance-card">
        <span>Total por mês (contas ativas)</span>
        <strong>{money(totalAtivas)}</strong>
        <small>
          {contas.filter((c) => c.ativa !== false).length} ativa(s) · entram nas despesas do Meu mês
        </small>
      </section>

      {editando && (
        <BillForm
          key={editando.id}
          inicial={editando}
          onSave={(conta) => {
            onSave(conta);
            setEditando(null);
          }}
          onCancel={() => setEditando(null)}
        />
      )}

      <section className="section-card">
        <div className="section-title">
          <h2 className="no-margin">Contas recorrentes</h2>
        </div>
        {contas.length === 0 && <p className="muted">Nenhuma conta fixa cadastrada.</p>}
        {contas.map((conta) => {
          const ativa = conta.ativa !== false;
          return (
            <div className={`bill${ativa ? "" : " inactive"}`} key={conta.id}>
              <div className="bill-top">
                <div>
                  <b>{conta.nome}</b>
                  <small className="muted block">
                    {money(conta.valor)}/mês · Todo dia {conta.dia} · {conta.categoria}
                  </small>
                </div>
                <button
                  className={`switch${ativa ? " on" : ""}`}
                  onClick={() => onToggle(conta.id)}
                  aria-pressed={ativa}
                >
                  {ativa ? "Ativa" : "Inativa"}
                </button>
              </div>
              <div className="row-actions">
                <button
                  className="chip-btn edit"
                  onClick={() => {
                    setEditando(conta);
                    topoRef.current?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  ✏️ Editar
                </button>
                <button className="chip-btn danger" onClick={() => excluir(conta)}>
                  🗑 Excluir
                </button>
              </div>
            </div>
          );
        })}
      </section>

      {!editando && <BillForm onSave={onSave} />}
    </div>
  );
}
