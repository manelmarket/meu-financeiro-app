import React from "react";
import { diaMesBR, hojeISO, money, rotuloMes } from "../lib/formato.js";
import { faturasParaPagar, melhorDiaDeCompra } from "../lib/cartao.js";
import { bancoDoCartao, estiloDoBanco } from "../lib/bancos.js";

// Linha de cada fatura fechada: valor, vencimento e como está o pagamento
function FaturaFechada({ fatura }) {
  let texto;
  if (fatura.status === "paga") {
    texto = (
      <>
        ✓ Fatura de {rotuloMes(fatura.mes)} paga
        {fatura.paraProxima > 0 ? (
          <>
            {" "}· <b>{money(fatura.paraProxima)}</b> foi para a próxima fatura
          </>
        ) : (
          <> ({money(fatura.valor)})</>
        )}
      </>
    );
  } else if (fatura.status === "parcial") {
    texto = (
      <>
        Fatura de {rotuloMes(fatura.mes)}: falta <b>{money(fatura.aPagar)}</b> de {money(fatura.valor)}
        {" "}· vence {diaMesBR(fatura.vencimento)}
      </>
    );
  } else {
    texto = (
      <>
        Fatura fechada de {rotuloMes(fatura.mes)}: <b>{money(fatura.valor)}</b>
        {" "}· vence {diaMesBR(fatura.vencimento)}
      </>
    );
  }

  return (
    <div className={`cc-closed ${fatura.status}`}>
      <span>{texto}</span>
    </div>
  );
}

// Painel do cartão: nome, bandeira, limite total, usado, disponível, barra de uso, fatura atual,
// faturas fechadas, fechamento, vencimento e o melhor dia de compra.
// O botão Pagar fica sempre no mesmo lugar (paga a fatura fechada ou adianta a fatura atual).
// As cores seguem o banco quando o app reconhece o nome do cartão (ex.: Nubank roxo).
export default function CardSummary({ cartao, resumo, hoje = hojeISO(), onClick, onPagar, children }) {
  const banco = bancoDoCartao(cartao.nome);
  const atual = resumo.faturaAtual;
  const paraPagar = faturasParaPagar(resumo);
  const melhor = melhorDiaDeCompra(cartao, hoje);

  return (
    <section
      className={`credit-card${banco ? ` banco-${banco.id}` : ""}${onClick ? " clickable" : ""}`}
      style={estiloDoBanco(banco)}
      onClick={onClick}
    >
      <div className="cc-head">
        <div className="cc-title">
          <b>{cartao.nome}</b>
          {cartao.bandeira && <span className="cc-brand">{cartao.bandeira}</span>}
        </div>
        {(onPagar || children) && (
          <div className="cc-actions">
            {onPagar && (
              <button
                type="button"
                className="cc-btn cc-pagar"
                disabled={paraPagar.length === 0}
                title={paraPagar.length ? "Pagar a fatura (valor cheio ou parcial)" : "Nada em aberto para pagar agora"}
                onClick={(e) => {
                  e.stopPropagation();
                  onPagar(paraPagar[0]);
                }}
              >
                Pagar
              </button>
            )}
            {children}
          </div>
        )}
      </div>

      <div className="cc-limits">
        <div>
          <small>Limite</small>
          <b>{money(resumo.limite)}</b>
        </div>
        <div>
          <small>Usado</small>
          <b>{money(resumo.usado)}</b>
        </div>
        <div>
          <small>Disponível</small>
          <b className={resumo.disponivel < 0 ? "neg" : ""}>{money(resumo.disponivel)}</b>
        </div>
      </div>

      <div className="bar dark">
        <i style={{ width: `${resumo.percentual}%` }} />
      </div>
      <small className="cc-pct">{Math.round(resumo.percentual)}% do limite em uso</small>

      <div className="cc-invoice">
        <div>
          <small>Fatura atual · {rotuloMes(atual.mes)}</small>
          <strong>{money(atual.valor)}</strong>
        </div>
        {atual.saldoAnterior > 0 && (
          <small className="cc-saldo">Inclui {money(atual.saldoAnterior)} da fatura anterior</small>
        )}
        {atual.pago > 0 && (
          <small className="cc-saldo">
            {atual.aPagar > 0 ? `Já pago ${money(atual.pago)} · falta ${money(atual.aPagar)}` : `✓ Paga antes de fechar (${money(atual.pago)})`}
          </small>
        )}
      </div>

      {resumo.faturasFechadas.map((fatura) => (
        <FaturaFechada key={fatura.mes} fatura={fatura} />
      ))}

      <div className="cc-dates">
        <span>Fecha dia {cartao.fechamento}</span>
        <span>Vence dia {cartao.vencimento}</span>
      </div>
      <small className="cc-melhor">
        🛒 Melhor dia de compra: dia {melhor.dia} · comprando em {diaMesBR(melhor.data)}, paga só em {diaMesBR(melhor.vence)}
      </small>
    </section>
  );
}
