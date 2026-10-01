import React, { useEffect, useRef, useState } from "react";
import { SeletorCategoria } from "../components/Categoria.jsx";
import PagarConta, { nomeDoMes } from "../components/PagarConta.jsx";
import { SUGESTOES_CONTAS } from "../lib/categorias.js";
import { resumoDaConta, resumoDoMesDasContas } from "../lib/contasFixas.js";
import { dataBR, diaMesBR, money, nomeMes, parseValor } from "../lib/formato.js";
import { acharBanco, resumoDosBancos } from "../lib/saldos.js";

// nome do banco de um pagamento ("" quando não descontou de nenhum banco)
function nomeDoBanco(dados, id) {
  if (id == null || id === "") return "";
  return acharBanco(dados, id)?.nome || "banco excluído";
}

// "julho", "julho e agosto", "junho, julho e agosto"
function listaDeMeses(meses) {
  const nomes = meses.map((s) => nomeMes(s.mes));
  return nomes.length > 1 ? `${nomes.slice(0, -1).join(", ")} e ${nomes[nomes.length - 1]}` : nomes[0] || "";
}

// Linha com a situação da conta no mês atual: { texto, classe } (null quando a conta não vale no mês)
function situacaoDoMes(s, dados) {
  const mes = nomeDoMes(s.mes);
  if (s.situacao === "paga") {
    const ultimo = s.pagamentos[s.pagamentos.length - 1];
    const banco = nomeDoBanco(dados, ultimo?.bancoId);
    const valor = s.pago !== s.valor ? ` · ${money(s.pago)}` : "";
    return { texto: `✓ ${mes}: paga em ${diaMesBR(ultimo?.data)}${valor}${banco ? ` · ${banco}` : ""}`, classe: "ok" };
  }
  if (s.situacao === "atrasada") return { texto: `${mes}: atrasada, venceu ${diaMesBR(s.vence)}`, classe: "atraso" };
  if (s.situacao === "hoje") return { texto: `${mes}: vence hoje`, classe: "aviso" };
  if (s.situacao === "aberta") return { texto: `${mes}: vence ${diaMesBR(s.vence)}`, classe: "neutra" };
  return null;
}

function BillForm({ dados, inicial, onSave, onCancel, onCriarCategoria }) {
  const [nome, setNome] = useState(inicial?.nome || "");
  const [valor, setValor] = useState(inicial ? String(inicial.valor).replace(".", ",") : "");
  const [dia, setDia] = useState(inicial ? String(inicial.dia) : "");
  const [categoria, setCategoria] = useState(inicial?.categoria || "Casa");
  const [erro, setErro] = useState("");

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

      <SeletorCategoria dados={dados} valor={categoria} onChange={setCategoria} onCriar={onCriarCategoria} />

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

export default function Bills({ data, hoje, onBack, onSave, onDelete, onToggle, onPagar, onDesfazerPagamento, onCriarCategoria }) {
  const [editando, setEditando] = useState(null);
  const [pagando, setPagando] = useState(null);
  const [historico, setHistorico] = useState(null);
  const [aviso, setAviso] = useState("");
  const topoRef = useRef(null);
  const contas = [...(data.contasFixas || [])].sort(
    (a, b) => Number(b.ativa !== false) - Number(a.ativa !== false) || a.dia - b.dia || a.nome.localeCompare(b.nome)
  );
  const totalAtivas = contas.filter((c) => c.ativa !== false).reduce((t, c) => t + Number(c.valor || 0), 0);
  const doMes = resumoDoMesDasContas(data, hoje);
  const bancos = resumoDosBancos(data).bancos;

  // a janela de pagar usa os dados de agora: se a conta foi excluída (ex.: em outro aparelho), ela fecha
  const contaPagando = pagando != null ? contas.find((c) => String(c.id) === String(pagando)) || null : null;
  const mesesParaPagar = contaPagando ? resumoDaConta(contaPagando, hoje).paraPagar : [];
  useEffect(() => {
    if (pagando != null && (!contaPagando || mesesParaPagar.length === 0)) setPagando(null);
  }, [pagando, contaPagando, mesesParaPagar.length]);

  useEffect(() => {
    if (!aviso) return undefined;
    const tempo = setTimeout(() => setAviso(""), 5000);
    return () => clearTimeout(tempo);
  }, [aviso]);

  function excluir(conta) {
    const comBanco = (Array.isArray(conta.pagamentos) ? conta.pagamentos : []).some(
      (p) => p && p.bancoId != null && p.bancoId !== ""
    );
    const pergunta = `Excluir a conta fixa "${conta.nome}"? Ela sai de todos os meses.${
      comBanco ? " Os pagamentos já feitos continuam descontados dos bancos." : ""
    }`;
    if (!window.confirm(pergunta)) return;
    if (editando?.id === conta.id) setEditando(null);
    onDelete(conta.id);
  }

  function confirmarPagamento(conta, form) {
    const res = onPagar(conta.id, form);
    if (res?.erro) return res;
    const banco = nomeDoBanco(data, form.bancoId);
    setAviso(`${conta.nome}: ${nomeMes(form.mes)} pago${banco ? ` com ${banco}` : ""} (${money(parseValor(form.valor))}).`);
    setPagando(null);
    return { ok: true };
  }

  function desfazer(conta, p) {
    const banco = p.bancoId != null && p.bancoId !== "" ? acharBanco(data, p.bancoId) : null;
    const pergunta = `Desfazer o pagamento de ${nomeMes(p.mes)} de ${conta.nome} (${money(Number(p.valor))})?${
      banco ? ` O valor volta para o banco (${banco.nome}).` : ""
    }`;
    if (!window.confirm(pergunta)) return;
    const res = onDesfazerPagamento(conta.id, p.id);
    setAviso(res?.erro ? res.erro : `Pagamento de ${nomeMes(p.mes)} de ${conta.nome} desfeito.`);
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
        {doMes.quantidade > 0 && (
          <div className="contas-mes">
            <div className="contas-mes-valores">
              <div>
                <span>Pago em {nomeMes(doMes.mes)}</span>
                <b>{money(doMes.pago)}</b>
              </div>
              <div>
                <span>Falta pagar</span>
                <b>{money(doMes.falta)}</b>
              </div>
            </div>
            <div className="bar contas-bar" aria-hidden="true">
              <i style={{ width: `${doMes.total > 0 ? Math.round((doMes.pago / doMes.total) * 100) : 0}%` }} />
            </div>
            <small>
              {doMes.pagas} de {doMes.quantidade} {doMes.quantidade === 1 ? "conta paga" : "contas pagas"}
            </small>
          </div>
        )}
      </section>

      {aviso && (
        <p className="pag-feito conta-aviso" role="status">
          {aviso}
        </p>
      )}

      {editando && (
        <BillForm
          key={editando.id}
          dados={data}
          inicial={editando}
          onCriarCategoria={onCriarCategoria}
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
          const r = resumoDaConta(conta, hoje);
          const situacao = situacaoDoMes(r.atual, data);
          const historicoAberto = historico === conta.id && r.pagamentos.length > 0;
          return (
            <div className={`bill${ativa ? "" : " inactive"}`} key={conta.id}>
              <div className="bill-top">
                <div>
                  <b>{conta.nome}</b>
                  <small className="muted block">
                    {money(conta.valor)}/mês · Todo dia {conta.dia} · {conta.categoria}
                  </small>
                  {situacao && <small className={`conta-situacao ${situacao.classe}`}>{situacao.texto}</small>}
                  {r.atrasados.length > 0 && (
                    <small className="conta-situacao atraso">Em atraso: {listaDeMeses(r.atrasados)}</small>
                  )}
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
                {r.paraPagar.length > 0 && (
                  <button
                    className="chip-btn ok"
                    onClick={() => {
                      setAviso("");
                      setPagando(conta.id);
                    }}
                  >
                    {r.paraPagar.some((s) => !s.adiantado) ? "💵 Pagar" : "💵 Adiantar"}
                  </button>
                )}
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
                {r.pagamentos.length > 0 && (
                  <button
                    className="chip-btn neutral"
                    onClick={() => setHistorico((h) => (h === conta.id ? null : conta.id))}
                    aria-expanded={historicoAberto}
                  >
                    {historicoAberto ? "Fechar histórico" : `Histórico (${r.pagamentos.length})`}
                  </button>
                )}
              </div>
              {historicoAberto && (
                <div className="conta-historico">
                  {r.pagamentos.slice(0, 12).map((p) => {
                    const banco = nomeDoBanco(data, p.bancoId);
                    return (
                      <div className="conta-pag" key={p.id}>
                        <span>
                          <b>{money(Number(p.valor))}</b>
                          <small>
                            {nomeDoMes(p.mes)} · pago em {dataBR(p.data)}
                            {banco ? ` · ${banco}` : ""}
                          </small>
                        </span>
                        <button className="chip-btn neutral" onClick={() => desfazer(conta, p)}>
                          Desfazer
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </section>

      {!editando && <BillForm dados={data} onSave={onSave} onCriarCategoria={onCriarCategoria} />}

      {contaPagando && mesesParaPagar.length > 0 && (
        <PagarConta
          key={pagando}
          conta={contaPagando}
          meses={mesesParaPagar}
          bancos={bancos}
          hoje={hoje}
          onConfirmar={(form) => confirmarPagamento(contaPagando, form)}
          onFechar={() => setPagando(null)}
        />
      )}
    </div>
  );
}
