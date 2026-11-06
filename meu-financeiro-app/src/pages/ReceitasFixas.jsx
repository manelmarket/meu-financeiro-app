import React, { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { diaMesBR, mesDaData, money, nomeMes, parseValor } from "../lib/formato.js";
import { FORMAS_DE_RECEITA_FIXA, diaNoMes, lerReceitasFixas, situacaoNoMes } from "../lib/receitasFixas.js";
import { lerBancos } from "../lib/saldos.js";

const TEXTO_DA_SITUACAO = {
  recebida: "recebida",
  pulada: "não veio",
  "a-receber": "a receber",
  pendente: "esperando confirmar",
  fora: "começa no mês que vem"
};

function Formulario({ dados, inicial, onSalvar, onCancelar }) {
  const bancos = lerBancos(dados);
  const [nome, setNome] = useState(inicial?.nome || "");
  const [valor, setValor] = useState(inicial ? String(inicial.valor).replace(".", ",") : "");
  const [dia, setDia] = useState(inicial?.dia ? String(inicial.dia) : "5");
  const [forma, setForma] = useState(inicial?.forma || "Transferência");
  const [bancoId, setBancoId] = useState(inicial ? String(inicial.bancoId ?? "") : bancos[0] ? String(bancos[0].id) : "");
  const [automatica, setAutomatica] = useState(inicial ? inicial.automatica !== false : true);
  const [erro, setErro] = useState("");

  function salvar(e) {
    e.preventDefault();
    const r = onSalvar({ ...(inicial ? { id: inicial.id } : {}), nome, valor: parseValor(valor), dia, forma, bancoId, automatica });
    if (r?.erro) setErro(r.erro);
  }

  return (
    <form className="section-card form" onSubmit={salvar}>
      <h2>{inicial ? "Editar receita fixa" : "Nova receita fixa"}</h2>
      <label>
        Nome
        <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Salário, Aluguel recebido" maxLength={40} />
      </label>
      <div className="grid2 tight">
        <label>
          Valor por mês
          <input inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="3.500,00" />
        </label>
        <label>
          Cai todo dia
          <input inputMode="numeric" value={dia} onChange={(e) => setDia(e.target.value.replace(/\D/g, "").slice(0, 2))} placeholder="5" />
        </label>
      </div>
      <div className={bancos.length ? "grid2 tight" : ""}>
        <label>
          Recebe por
          <select value={forma} onChange={(e) => setForma(e.target.value)}>
            {FORMAS_DE_RECEITA_FIXA.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </label>
        {bancos.length > 0 && (
          <label>
            Entra no banco
            <select value={bancoId} onChange={(e) => setBancoId(e.target.value)}>
              {bancos.map((b) => (
                <option key={b.id} value={String(b.id)}>
                  {b.nome}
                </option>
              ))}
              <option value="">Sem banco</option>
            </select>
          </label>
        )}
      </div>
      <label className="importar-opcao">
        <input type="checkbox" checked={automatica} onChange={(e) => setAutomatica(e.target.checked)} />
        <span>Lançar sozinho no dia (desmarcado: o app pergunta no Início se você recebeu)</span>
      </label>
      {erro && <p className="form-error">{erro}</p>}
      <div className="actions">
        <button type="button" className="ghost" onClick={onCancelar}>
          Cancelar
        </button>
        <button className="primary">Salvar</button>
      </div>
    </form>
  );
}

// Receitas fixas: o que entra todo mês (ver lib/receitasFixas.js)
export default function ReceitasFixas({ data, hoje, onBack, onSalvar, onExcluir, onLigar }) {
  const [editando, setEditando] = useState(null); // null | "nova" | receita
  const mes = mesDaData(hoje);
  const receitas = lerReceitasFixas(data);
  const total = receitas.filter((r) => r.ativa !== false).reduce((t, r) => t + Number(r.valor || 0), 0);
  const bancos = lerBancos(data);

  return (
    <div className="page">
      <header className="topbar with-back">
        <button className="back" onClick={onBack} aria-label="Voltar">
          ←
        </button>
        <div>
          <div className="eyebrow">Todo mês</div>
          <h1>Receitas fixas</h1>
        </div>
      </header>

      <section className="balance-card">
        <span>Entra por mês</span>
        <strong>{money(total)}</strong>
        <small>
          {receitas.length} {receitas.length === 1 ? "receita fixa" : "receitas fixas"} · entram na previsão do mês
        </small>
      </section>

      {editando ? (
        <Formulario
          key={editando === "nova" ? "nova" : editando.id}
          dados={data}
          inicial={editando === "nova" ? null : editando}
          onCancelar={() => setEditando(null)}
          onSalvar={(form) => {
            const r = onSalvar(form);
            if (!r?.erro) setEditando(null);
            return r;
          }}
        />
      ) : (
        <button type="button" className="primary wide" onClick={() => setEditando("nova")}>
          + Nova receita fixa
        </button>
      )}

      <section className="section-card">
        <h2>Suas receitas fixas</h2>
        {receitas.length === 0 && <p className="muted">Cadastre o seu salário e o que mais entra todo mês: o app lança no dia e mostra quanto vai sobrar.</p>}
        {receitas.map((r) => {
          const s = situacaoNoMes(data, r, mes, hoje);
          const banco = bancos.find((b) => String(b.id) === String(r.bancoId));
          return (
            <div className={`receita-fixa${r.ativa === false ? " desligada" : ""}`} key={r.id}>
              <div className="receita-fixa-info">
                <b>{r.nome}</b>
                <span>
                  {money(Number(r.valor))} · todo dia {r.dia} · {r.forma}
                  {banco ? ` · ${banco.nome}` : ""}
                </span>
                <small className={`receita-fixa-situacao ${s}`}>
                  {r.ativa === false
                    ? "desligada"
                    : `${nomeMes(mes)}: ${TEXTO_DA_SITUACAO[s]}${s === "a-receber" ? ` em ${diaMesBR(diaNoMes(r, mes))}` : ""}`}
                  {r.automatica === false ? " · confirmar no Início" : " · lança sozinho"}
                </small>
              </div>
              <div className="receita-fixa-acoes">
                <button type="button" className="link" onClick={() => onLigar(r.id, r.ativa === false)}>
                  {r.ativa === false ? "ligar" : "pausar"}
                </button>
                <button type="button" className="icone-btn" onClick={() => setEditando(r)} aria-label={`Editar ${r.nome}`}>
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  className="icone-btn perigo"
                  aria-label={`Excluir ${r.nome}`}
                  onClick={() => window.confirm(`Excluir a receita fixa ${r.nome}? (o que já foi lançado continua)`) && onExcluir(r.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
