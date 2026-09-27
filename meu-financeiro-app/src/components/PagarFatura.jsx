import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { arredondar, diaMesBR, money, parseValor, rotuloMes, somarMeses } from "../lib/formato.js";
import { RESTANTE_EM_ABERTO, RESTANTE_NA_PROXIMA, novoPagamento } from "../lib/cartao.js";

const CHAVE_BANCO = "meu_financeiro_banco_da_fatura";

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

// Janela "Pagar fatura": valor cheio ou parcial, da fatura fechada ou da fatura atual (antes de fechar).
// No parcial da fatura fechada, a pessoa escolhe o que fazer com o restante: deixar em aberto até o
// vencimento ou lançar na próxima fatura. O valor pago volta para o limite disponível do cartão e, se a
// pessoa escolher um banco, sai do saldo dele.
// faturas: as faturas que dá para pagar (fechadas primeiro); bancos: [{ banco, atual }]
export default function PagarFatura({ cartao, faturas, inicial, disponivel, bancos = [], hoje, onConfirmar, onFechar }) {
  const [mes, setMes] = useState(inicial || faturas[0]?.mes);
  const [modo, setModo] = useState("cheio"); // "cheio" | "parcial"
  const [valor, setValor] = useState("");
  const [restante, setRestante] = useState(RESTANTE_EM_ABERTO);
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

  const fatura = faturas.find((f) => f.mes === mes) || null;

  // a fatura escolhida foi paga (ex.: em outro aparelho) enquanto a janela estava aberta: fecha
  // (em vez de trocar sozinha para outra fatura)
  const sumiu = !fatura;
  useEffect(() => {
    if (sumiu) onFechar();
  }, [sumiu]);

  if (!fatura) return null;
  const fechada = fatura.fase === "fechada";
  const falta = fatura.aPagar;
  const valorParcial = parseValor(valor);
  const pagar = modo === "cheio" ? falta : valorParcial;
  const valido = pagar > 0 && pagar <= falta;
  const sobra = valido ? arredondar(falta - pagar) : 0;
  const proxima = somarMeses(fatura.mes, 1);
  const banco = bancos.find((b) => String(b.banco.id) === bancoId) || null;

  function escolherModo(novo) {
    setModo(novo);
    setErro("");
  }

  function confirmar() {
    if (modo === "parcial") {
      if (!(valorParcial > 0)) return setErro("Informe quanto você pagou (ex.: 500,00).");
      if (valorParcial > falta) {
        return setErro(`Esse valor passa do que falta pagar (${money(falta)}). Para pagar tudo, escolha Valor cheio.`);
      }
    }
    if (bancos.length) guardarBanco(banco ? banco.banco.id : "nenhum");
    onConfirmar(novoPagamento(fatura, pagar, fechada ? restante : RESTANTE_EM_ABERTO, hoje, Date.now(), banco ? banco.banco.id : null));
  }

  return (
    <div className="modal-backdrop" onClick={onFechar}>
      <div
        className="modal pag-modal"
        ref={janela}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pag-titulo"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pag-topo">
          <div>
            <h2 id="pag-titulo">Pagar fatura</h2>
            <small className="muted">
              {cartao.nome} · {rotuloMes(fatura.mes)} · vence {diaMesBR(fatura.vencimento)}
            </small>
          </div>
          <button type="button" className="pag-fechar" onClick={onFechar} aria-label="Fechar">
            <X size={18} strokeWidth={2.4} />
          </button>
        </div>

        {faturas.length > 1 && (
          <div className="pag-campo" role="radiogroup" aria-label="Qual fatura">
            <span>Qual fatura?</span>
            <div className="pag-faturas">
              {faturas.map((f) => (
                <button
                  type="button"
                  key={f.mes}
                  role="radio"
                  aria-checked={f.mes === fatura.mes}
                  className={`pag-fatura${f.mes === fatura.mes ? " ativo" : ""}`}
                  onClick={() => {
                    setMes(f.mes);
                    setErro("");
                  }}
                >
                  <b>{f.fase === "fechada" ? "Fechada" : "Atual"} · {rotuloMes(f.mes)}</b>
                  <small>falta {money(f.aPagar)}</small>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="pag-resumo">
          <div>
            <span>{fechada ? "Total da fatura" : "Fatura atual até agora"}</span>
            <b>{money(fatura.valor)}</b>
          </div>
          {fatura.pago > 0 && (
            <div>
              <span>Já pago</span>
              <b>{money(fatura.pago)}</b>
            </div>
          )}
          <div className="pag-falta">
            <span>Falta pagar</span>
            <b>{money(falta)}</b>
          </div>
        </div>

        {!fechada && (
          <p className="hint">
            Esta fatura ainda não fechou: o que você pagar agora já libera o limite. Compras novas continuam entrando nela.
          </p>
        )}

        <div className="segmented" role="radiogroup" aria-label="Quanto você vai pagar">
          <button
            type="button"
            role="radio"
            aria-checked={modo === "cheio"}
            className={modo === "cheio" ? "selected info" : ""}
            onClick={() => escolherModo("cheio")}
          >
            Valor cheio
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={modo === "parcial"}
            className={modo === "parcial" ? "selected info" : ""}
            onClick={() => escolherModo("parcial")}
          >
            Valor parcial
          </button>
        </div>

        {modo === "cheio" ? (
          <p className="hint">Você paga {money(falta)} e a fatura fica paga.</p>
        ) : (
          <>
            <label className="pag-campo">
              Quanto você pagou?
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

            {fechada ? (
              <div className="pag-campo" role="radiogroup" aria-label="O que fazer com o restante">
                <span>E o restante{valido && sobra > 0 ? ` (${money(sobra)})` : ""}?</span>
                <button
                  type="button"
                  role="radio"
                  aria-checked={restante === RESTANTE_EM_ABERTO}
                  className={`pag-opcao${restante === RESTANTE_EM_ABERTO ? " ativo" : ""}`}
                  onClick={() => setRestante(RESTANTE_EM_ABERTO)}
                >
                  <b>Deixar em aberto até o vencimento</b>
                  <small>Fica nesta fatura. Você paga o resto até {diaMesBR(fatura.vencimento)}.</small>
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={restante === RESTANTE_NA_PROXIMA}
                  className={`pag-opcao${restante === RESTANTE_NA_PROXIMA ? " ativo" : ""}`}
                  onClick={() => setRestante(RESTANTE_NA_PROXIMA)}
                >
                  <b>Lançar na próxima fatura</b>
                  <small>O resto vai para a fatura de {rotuloMes(proxima)}.</small>
                </button>
                {restante === RESTANTE_NA_PROXIMA && (
                  <p className="pag-aviso">O banco costuma cobrar juros sobre o valor que passa para a próxima fatura.</p>
                )}
              </div>
            ) : (
              valido &&
              sobra > 0 && <p className="muted small no-margin">O restante ({money(sobra)}) continua na fatura atual.</p>
            )}
          </>
        )}

        {bancos.length > 0 && (
          <label className="pag-campo">
            Pagar com
            <select value={bancoId} onChange={(e) => setBancoId(e.target.value)}>
              {bancos.map((b) => (
                <option key={b.banco.id} value={String(b.banco.id)}>
                  {b.banco.nome} — {money(b.atual)}
                </option>
              ))}
              <option value="">Não descontar de nenhum banco</option>
            </select>
          </label>
        )}

        {valido && (
          <p className="pag-libera">
            Libera {money(pagar)} no limite · disponível passa a {money(arredondar(disponivel + pagar))}
            {banco ? ` · ${banco.banco.nome} fica com ${money(arredondar(banco.atual - pagar))}` : ""}
          </p>
        )}
        {erro && <p className="form-error">{erro}</p>}

        <div className="actions">
          <button type="button" className="ghost" onClick={onFechar}>
            Cancelar
          </button>
          <button type="button" className="primary" onClick={confirmar}>
            Confirmar pagamento
          </button>
        </div>
      </div>
    </div>
  );
}
