import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { arredondar, diaMesBR, money, nomeMes, parseValor } from "../lib/formato.js";

// Janela "Pagar conta fixa": o mês, o valor, a data e de qual banco sai o dinheiro.
// meses: os meses que dá para pagar (ver mesesParaPagar em lib/contasFixas.js), o primeiro já vem escolhido;
// bancos: [{ banco, atual }] (ver resumoDosBancos em lib/saldos.js).
// onConfirmar({ mes, valor, data, bancoId }) devolve { erro } ou { ok }.

const CHAVE_BANCO = "meu_financeiro_banco_da_conta";

function bancoGuardado() {
  try {
    return localStorage.getItem(CHAVE_BANCO) || "";
  } catch {
    return "";
  }
}

function guardarBanco(id) {
  try {
    localStorage.setItem(CHAVE_BANCO, String(id ?? ""));
  } catch {
    // sem espaço: só não lembra da próxima vez
  }
}

// 1200 -> "1.200,00"
function textoDoValor(v) {
  return v > 0 ? v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "";
}

// "Outubro"
export function nomeDoMes(mes) {
  const nome = nomeMes(mes);
  return `${nome.charAt(0).toUpperCase()}${nome.slice(1)}`;
}

// "vence 10/10", "vence hoje", "atrasada", "adiantado"
export function legendaDoMes(s) {
  if (s.adiantado) return "adiantado";
  if (s.situacao === "atrasada") return "atrasada";
  if (s.situacao === "hoje") return "vence hoje";
  return `vence ${diaMesBR(s.vence)}`;
}

export default function PagarConta({ conta, meses, bancos = [], hoje, onConfirmar, onFechar }) {
  const [mes, setMes] = useState(() => meses[0]?.mes);
  const [valor, setValor] = useState(() => textoDoValor(Number(conta.valor) || 0));
  const [dataPag, setDataPag] = useState(hoje);
  const [bancoId, setBancoId] = useState(() => {
    const guardado = bancoGuardado();
    if (guardado === "nenhum") return "";
    const existe = bancos.find((b) => String(b.banco.id) === guardado);
    return existe ? String(existe.banco.id) : bancos[0] ? String(bancos[0].banco.id) : "";
  });
  const [erro, setErro] = useState("");
  const janela = useRef(null);

  // leitor de tela e teclado começam dentro da janela
  useEffect(() => {
    janela.current?.focus({ preventScroll: true });
  }, []);

  // tecla Esc fecha (computador)
  useEffect(() => {
    function tecla(e) {
      if (e.key === "Escape") onFechar();
    }
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [onFechar]);

  const escolhido = meses.find((s) => s.mes === mes) || null;

  // o mês escolhido foi pago (ex.: em outro aparelho) enquanto a janela estava aberta: fecha
  const sumiu = !escolhido;
  useEffect(() => {
    if (sumiu) onFechar();
  }, [sumiu]);

  if (!escolhido) return null;

  const v = parseValor(valor);
  const banco = bancos.find((b) => String(b.banco.id) === bancoId) || null;

  function confirmar() {
    const r = onConfirmar({ mes, valor, data: dataPag, bancoId: banco ? banco.banco.id : "" });
    if (r?.erro) {
      setErro(r.erro);
      return;
    }
    if (bancos.length) guardarBanco(banco ? banco.banco.id : "nenhum");
  }

  return (
    <div className="modal-backdrop" onClick={onFechar}>
      <div
        className="modal pag-modal conta-modal"
        ref={janela}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="conta-pag-titulo"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pag-topo">
          <div>
            <h2 id="conta-pag-titulo">Pagar {conta.nome}</h2>
            <small className="muted">
              {meses.length > 1
                ? `Conta de ${money(conta.valor)} · vence todo dia ${conta.dia}`
                : `${nomeDoMes(escolhido.mes)} · ${legendaDoMes(escolhido)} · conta de ${money(conta.valor)}`}
            </small>
          </div>
          <button type="button" className="pag-fechar" onClick={onFechar} aria-label="Fechar">
            <X size={18} strokeWidth={2.4} />
          </button>
        </div>

        {meses.length > 1 && (
          <div className="pag-campo" role="radiogroup" aria-label="Qual mês">
            <span>Qual mês?</span>
            <div className="pag-faturas">
              {meses.map((s) => (
                <button
                  type="button"
                  key={s.mes}
                  role="radio"
                  aria-checked={s.mes === mes}
                  className={`pag-fatura${s.mes === mes ? " ativo" : ""}${s.situacao === "atrasada" ? " atrasada" : ""}`}
                  onClick={() => {
                    setMes(s.mes);
                    setErro("");
                  }}
                >
                  <b>{nomeDoMes(s.mes)}</b>
                  <small>{legendaDoMes(s)}</small>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid2 tight">
          <label className="pag-campo">
            Valor pago
            <input
              inputMode="decimal"
              value={valor}
              onChange={(e) => {
                setValor(e.target.value);
                setErro("");
              }}
              placeholder="0,00"
            />
          </label>
          <label className="pag-campo">
            Data
            <input
              type="date"
              value={dataPag}
              onChange={(e) => {
                setDataPag(e.target.value);
                setErro("");
              }}
            />
          </label>
        </div>

        {bancos.length > 0 ? (
          <div className="pag-campo" role="radiogroup" aria-label="De qual banco sai o dinheiro">
            <span>De qual banco sai o dinheiro?</span>
            <div className="conta-bancos">
              {bancos.map((b) => {
                const ativo = String(b.banco.id) === bancoId;
                return (
                  <button
                    type="button"
                    key={b.banco.id}
                    role="radio"
                    aria-checked={ativo}
                    className={`conta-banco${ativo ? " ativo" : ""}`}
                    onClick={() => {
                      setBancoId(String(b.banco.id));
                      setErro("");
                    }}
                  >
                    <b>{b.banco.nome}</b>
                    <small className={b.atual < 0 ? "neg" : ""}>{money(b.atual)}</small>
                  </button>
                );
              })}
              <button
                type="button"
                role="radio"
                aria-checked={bancoId === ""}
                className={`conta-banco${bancoId === "" ? " ativo" : ""}`}
                onClick={() => {
                  setBancoId("");
                  setErro("");
                }}
              >
                <b>Não descontar de nenhum banco</b>
              </button>
            </div>
          </div>
        ) : (
          <p className="hint">
            Você ainda não tem bancos cadastrados (aba Bancos). A conta fica marcada como paga, sem descontar de nenhum banco.
          </p>
        )}

        {v > 0 && banco && (
          <p className="pag-libera">
            {banco.banco.nome}: {money(banco.atual)} → {money(arredondar(banco.atual - v))}
          </p>
        )}
        {v > 0 && !banco && bancos.length > 0 && (
          <p className="muted small no-margin">A conta fica marcada como paga, sem mexer no saldo dos bancos.</p>
        )}
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
