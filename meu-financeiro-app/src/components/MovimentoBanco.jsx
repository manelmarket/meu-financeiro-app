import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { arredondar, money, parseValor } from "../lib/formato.js";
import { CRIAR_CARTEIRA, NOME_DA_CARTEIRA, acharCarteira, montarTransferencia } from "../lib/transferencias.js";

const FORA = "";

const TEXTOS = {
  transferir: { titulo: (b) => `Transferir do ${b}`, outro: "Para qual banco", padrao: "Transferência", subtipo: "transferencia" },
  sacar: { titulo: (b) => `Sacar do ${b}`, outro: "O dinheiro vai para", padrao: "Saque", subtipo: "saque" },
  depositar: { titulo: (b) => `Depositar no ${b}`, outro: "De onde vem o dinheiro", padrao: "Depósito", subtipo: "deposito" }
};

// Janela de Transferir, Sacar ou Depositar a partir do card de um banco.
// banco: { banco, atual }; bancos: [{ banco, atual }] (todos, com o saldo de agora); data: os dados do app
export default function MovimentoBanco({ modo, banco, bancos, data, hoje, onConfirmar, onFechar }) {
  const t = TEXTOS[modo] || TEXTOS.transferir;
  const carteira = acharCarteira(data);
  const outros = bancos.filter((b) => String(b.banco.id) !== String(banco.banco.id));
  const semCarteira = !carteira;
  // opções do outro lado: Carteira primeiro (é o destino natural do saque), depois os outros bancos
  const opcoes = [
    ...outros.filter((b) => carteira && String(b.banco.id) === String(carteira.id)),
    ...outros.filter((b) => !carteira || String(b.banco.id) !== String(carteira.id))
  ];
  const padrao = () => {
    if (modo === "transferir") return opcoes[0] ? String(opcoes[0].banco.id) : semCarteira ? CRIAR_CARTEIRA : FORA;
    if (carteira && String(carteira.id) !== String(banco.banco.id)) return String(carteira.id);
    return semCarteira ? CRIAR_CARTEIRA : opcoes[0] ? String(opcoes[0].banco.id) : FORA;
  };
  const [valor, setValor] = useState("");
  const [outro, setOutro] = useState(padrao);
  const [dataMov, setDataMov] = useState(hoje);
  const [descricao, setDescricao] = useState("");
  const [erro, setErro] = useState("");
  const janela = useRef(null);

  useEffect(() => {
    janela.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    function tecla(e) {
      if (e.key === "Escape") onFechar();
    }
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [onFechar]);

  const v = parseValor(valor);
  const valido = v > 0;
  const outroItem = bancos.find((b) => String(b.banco.id) === outro) || null;
  const nomeDoOutro = outro === CRIAR_CARTEIRA ? NOME_DA_CARTEIRA : outroItem ? outroItem.banco.nome : "fora do app";
  const saldoDoOutro = outro === CRIAR_CARTEIRA ? 0 : outroItem ? outroItem.atual : null;
  const saiDaqui = modo !== "depositar";

  function confirmar() {
    const form = {
      subtipo: t.subtipo,
      valor: v,
      descricao,
      data: dataMov,
      de: saiDaqui ? String(banco.banco.id) : outro,
      para: saiDaqui ? outro : String(banco.banco.id)
    };
    const r = montarTransferencia(form, data);
    if (r.erro) return setErro(r.erro);
    onConfirmar(form, { nomeDoOutro });
  }

  return (
    <div className="modal-backdrop" onClick={onFechar}>
      <div
        className="modal pag-modal mov-modal"
        ref={janela}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mov-titulo"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pag-topo">
          <div>
            <h2 id="mov-titulo">{t.titulo(banco.banco.nome)}</h2>
            <small className="muted">Disponível: {money(banco.atual)}</small>
          </div>
          <button type="button" className="pag-fechar" onClick={onFechar} aria-label="Fechar">
            <X size={18} strokeWidth={2.4} />
          </button>
        </div>

        <label className="pag-campo">
          Valor
          <input
            inputMode="decimal"
            value={valor}
            onChange={(e) => {
              setValor(e.target.value);
              setErro("");
            }}
            placeholder="0,00"
            autoFocus
          />
        </label>

        <label className="pag-campo">
          {t.outro}
          <select
            value={outro}
            onChange={(e) => {
              setOutro(e.target.value);
              setErro("");
            }}
          >
            {opcoes.map((b) => (
              <option key={b.banco.id} value={String(b.banco.id)}>
                {b.banco.nome} — {money(b.atual)}
              </option>
            ))}
            {semCarteira && <option value={CRIAR_CARTEIRA}>Carteira (criar agora, para o dinheiro em espécie)</option>}
            {modo !== "transferir" && (
              <option value={FORA}>{modo === "sacar" ? "Não acompanhar (fora do app)" : "De fora do app (não estava em nenhum banco)"}</option>
            )}
          </select>
        </label>
        {modo === "transferir" && opcoes.length === 0 && !semCarteira && (
          <p className="hint">Cadastre outro banco para transferir entre eles.</p>
        )}

        <div className="grid2 tight mov-grid">
          <label className="pag-campo">
            Data
            <input type="date" value={dataMov} onChange={(e) => setDataMov(e.target.value)} />
          </label>
          <label className="pag-campo">
            Descrição (opcional)
            <input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder={t.padrao} maxLength={60} />
          </label>
        </div>

        {valido && (
          <p className="pag-libera">
            {banco.banco.nome}: {money(banco.atual)} → {money(arredondar(banco.atual + (saiDaqui ? -v : v)))}
            {saldoDoOutro !== null && (
              <>
                {" · "}
                {nomeDoOutro}: {money(saldoDoOutro)} → {money(arredondar(saldoDoOutro + (saiDaqui ? v : -v)))}
              </>
            )}
          </p>
        )}
        <p className="muted small no-margin">Não conta como gasto nem receita: só muda o saldo dos bancos.</p>
        {erro && <p className="form-error">{erro}</p>}

        <div className="actions">
          <button type="button" className="ghost" onClick={onFechar}>
            Cancelar
          </button>
          <button type="button" className="primary" onClick={confirmar}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
