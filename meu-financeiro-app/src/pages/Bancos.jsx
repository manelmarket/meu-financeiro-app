import React, { useState } from "react";
import { diaMesBR, money, parseValor } from "../lib/formato.js";
import { bancoDoCartao, estiloDoBanco } from "../lib/bancos.js";
import { resumoDosBancos } from "../lib/saldos.js";

function dataDoMomento(ms) {
  const d = new Date(Number(ms) || 0);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// Formulário de banco (novo ou edição)
function BancoForm({ inicial, titulo, textoBotao, onSalvar, onCancelar }) {
  const [nome, setNome] = useState(inicial?.nome || "");
  const [saldo, setSaldo] = useState(inicial ? String(inicial.saldo.toFixed(2)).replace(".", ",") : "");
  // o saldo que o formulário mostrou ao abrir (se não mudar, só o nome é salvo)
  const [mostrado] = useState(inicial ? inicial.saldo : null);
  const [erro, setErro] = useState("");
  const banco = bancoDoCartao(nome);

  function salvar() {
    const valor = parseValor(saldo);
    if (!nome.trim()) return setErro("Informe o nome do banco.");
    if (!Number.isFinite(valor)) return setErro("Informe quanto tem disponível (ex.: 1.250,00).");
    setErro("");
    onSalvar({ nome: nome.trim(), saldo: valor, ...(inicial ? { mostrado } : {}) });
    if (!inicial) {
      setNome("");
      setSaldo("");
    }
  }

  return (
    <section className="section-card form banco-form">
      <h2>{titulo}</h2>
      <label>
        Nome do banco
        <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Nubank" />
      </label>
      {banco && (
        <p className="cc-tema-previa" aria-live="polite">
          <i style={{ background: `linear-gradient(145deg,${banco.cores[0]},${banco.cores[1]})` }} aria-hidden="true" />
          Cores: {banco.nome}
        </p>
      )}
      <label>
        {inicial ? "Quanto tem disponível agora" : "Valor disponível"}
        <input inputMode="decimal" value={saldo} onChange={(e) => setSaldo(e.target.value)} placeholder="0,00" />
      </label>
      {inicial && (
        <p className="hint">
          Se mudar o valor, ele passa a ser o saldo de agora: os lançamentos feitos daqui para frente mexem nele.
        </p>
      )}
      {erro && <p className="form-error">{erro}</p>}
      <div className="actions">
        {onCancelar && (
          <button type="button" className="ghost" onClick={onCancelar}>
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

// Painel de um banco (com as cores do banco, igual aos cartões)
function PainelDoBanco({ item, onEditar, onExcluir }) {
  const [aberto, setAberto] = useState(false);
  const { banco, atual, informado, entradas, saidas, movimentos } = item;
  const tema = bancoDoCartao(banco.nome);

  return (
    <section className={`credit-card banco-card${tema ? ` banco-${tema.id}` : ""}`} style={estiloDoBanco(tema)}>
      <div className="cc-head">
        <div className="cc-title">
          <b>{banco.nome}</b>
        </div>
        <div className="cc-actions">
          <button type="button" className="cc-btn" onClick={onEditar}>
            ✏️ Editar
          </button>
          <button type="button" className="cc-btn" title="Excluir banco" aria-label={`Excluir ${banco.nome}`} onClick={onExcluir}>
            🗑
          </button>
        </div>
      </div>

      <div className="banco-saldo">
        <small>Disponível</small>
        <strong className={atual < 0 ? "neg" : ""}>{money(atual)}</strong>
      </div>

      <small className="banco-conta">
        Informado em {dataDoMomento(banco.ajustadoEm)}: {money(informado)}
        {entradas > 0 ? ` · entradas + ${money(entradas)}` : ""}
        {saidas > 0 ? ` · saídas − ${money(saidas)}` : ""}
      </small>

      {movimentos.length > 0 && (
        <button type="button" className="cc-btn banco-ver" onClick={() => setAberto((v) => !v)} aria-expanded={aberto}>
          {aberto ? "Esconder movimentações" : `Ver movimentações (${movimentos.length})`}
        </button>
      )}
      {aberto && (
        <div className="cc-invoice banco-movimentos">
          {movimentos.slice(0, 30).map((m) => (
            <div className="banco-mov" key={m.id}>
              <span>
                <b>{m.descricao}</b>
                <small>
                  {diaMesBR(m.data)} · {m.forma}
                </small>
              </span>
              <b>
                {m.tipo === "entrada" ? "+" : "−"} {money(m.valor)}
              </b>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function Bancos({ data, onSalvar, onExcluir }) {
  const [editando, setEditando] = useState(null);
  const { bancos, total } = resumoDosBancos(data);

  function excluir(banco) {
    const pergunta = `Excluir o banco ${banco.nome}?\n\nOs lançamentos continuam; só deixam de mexer nesse saldo.`;
    if (window.confirm(pergunta)) onExcluir(banco.id);
  }

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <div className="eyebrow">Contas</div>
          <h1>🏦 Meus bancos</h1>
        </div>
      </header>

      <section className="balance-card">
        <span>Total nos bancos</span>
        <strong className={total < 0 ? "neg" : ""}>{money(total)}</strong>
        <small>
          {bancos.length === 0
            ? "Cadastre seus bancos para acompanhar o saldo de cada um"
            : `Somando ${bancos.length} ${bancos.length === 1 ? "banco" : "bancos"} · atualizado com os lançamentos`}
        </small>
      </section>

      <p className="muted small banco-dica">
        Ao lançar um gasto ou receita no Novo e escolher o banco, o saldo muda sozinho. Pagamentos de fatura também.
      </p>

      {bancos.map((item) =>
        editando === item.banco.id ? (
          <BancoForm
            key={item.banco.id}
            inicial={{ ...item.banco, saldo: item.atual }}
            titulo={`Editar ${item.banco.nome}`}
            textoBotao="Salvar"
            onSalvar={(b) => {
              onSalvar({ ...b, id: item.banco.id });
              setEditando(null);
            }}
            onCancelar={() => setEditando(null)}
          />
        ) : (
          <PainelDoBanco
            key={item.banco.id}
            item={item}
            onEditar={() => setEditando(item.banco.id)}
            onExcluir={() => excluir(item.banco)}
          />
        )
      )}

      <BancoForm titulo="Adicionar banco" textoBotao="Adicionar" onSalvar={(b) => onSalvar(b)} />
    </div>
  );
}
