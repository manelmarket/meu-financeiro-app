import React, { useState } from "react";
import { BANDEIRAS } from "../lib/categorias.js";
import { parseValor } from "../lib/formato.js";

function dia(texto) {
  const n = parseInt(texto, 10);
  return n >= 1 && n <= 31 ? n : null;
}

// Formulário de cartão (novo ou edição)
export default function CardForm({ inicial, titulo, textoBotao, onSave, onCancel }) {
  const [nome, setNome] = useState(inicial?.nome || "");
  const [bandeira, setBandeira] = useState(inicial?.bandeira || "");
  const [limite, setLimite] = useState(inicial ? String(inicial.limite).replace(".", ",") : "");
  const [fechamento, setFechamento] = useState(inicial ? String(inicial.fechamento) : "");
  const [vencimento, setVencimento] = useState(inicial ? String(inicial.vencimento) : "");
  const [erro, setErro] = useState("");

  function salvar() {
    const valorLimite = parseValor(limite);
    const diaFechamento = dia(fechamento);
    const diaVencimento = dia(vencimento);

    if (!nome.trim()) return setErro("Informe o nome do cartão.");
    if (!(valorLimite > 0)) return setErro("Informe o limite (ex.: 5.000).");
    if (!diaFechamento) return setErro("Informe o dia de fechamento (1 a 31).");
    if (!diaVencimento) return setErro("Informe o dia de vencimento (1 a 31).");

    // só os campos do formulário (as compras ficam como estão no app)
    onSave({
      id: inicial?.id ?? Date.now(),
      nome: nome.trim(),
      bandeira,
      limite: valorLimite,
      fechamento: diaFechamento,
      vencimento: diaVencimento
    });

    if (!inicial) {
      setNome("");
      setLimite("");
      setFechamento("");
      setVencimento("");
    }
    setErro("");
  }

  return (
    <section className="section-card form">
      <h2>{titulo}</h2>

      <label>
        Nome
        <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Nubank" />
      </label>

      <label>
        Bandeira
        <select value={bandeira} onChange={(e) => setBandeira(e.target.value)}>
          <option value="">Não informada</option>
          {BANDEIRAS.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>
      </label>

      <label>
        Limite total
        <input inputMode="decimal" value={limite} onChange={(e) => setLimite(e.target.value)} placeholder="5.000,00" />
      </label>

      <div className="grid2 tight">
        <label>
          Dia de fechamento
          <input inputMode="numeric" value={fechamento} onChange={(e) => setFechamento(e.target.value)} placeholder="3" />
        </label>
        <label>
          Dia de vencimento
          <input inputMode="numeric" value={vencimento} onChange={(e) => setVencimento(e.target.value)} placeholder="10" />
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
          {textoBotao}
        </button>
      </div>
    </section>
  );
}
