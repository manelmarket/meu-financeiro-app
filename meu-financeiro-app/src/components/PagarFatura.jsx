import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { arredondar, diaMesBR, money, parseValor, rotuloMes, somarMeses } from "../lib/formato.js";
import { RESTANTE_EM_ABERTO, RESTANTE_NA_PROXIMA, novoPagamento } from "../lib/cartao.js";

// Janela "Pagar fatura": valor cheio ou parcial.
// No parcial, a pessoa escolhe o que fazer com o restante: deixar em aberto até o vencimento
// ou lançar na próxima fatura. O valor pago volta para o limite disponível do cartão.
export default function PagarFatura({ cartao, fatura, disponivel, hoje, onConfirmar, onFechar }) {
  const [modo, setModo] = useState("cheio"); // "cheio" | "parcial"
  const [valor, setValor] = useState("");
  const [restante, setRestante] = useState(RESTANTE_EM_ABERTO);
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

  const falta = fatura.aPagar;
  const valorParcial = parseValor(valor);
  const pagar = modo === "cheio" ? falta : valorParcial;
  const valido = pagar > 0 && pagar <= falta;
  const sobra = valido ? arredondar(falta - pagar) : 0;
  const proxima = somarMeses(fatura.mes, 1);

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
    onConfirmar(novoPagamento(fatura, pagar, restante, hoje));
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

        <div className="pag-resumo">
          <div>
            <span>Total da fatura</span>
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
          </>
        )}

        {valido && (
          <p className="pag-libera">
            Libera {money(pagar)} no limite · disponível passa a {money(arredondar(disponivel + pagar))}
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
