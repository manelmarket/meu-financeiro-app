import React from "react";
import { diaMesBR, money, rotuloMes } from "../lib/formato.js";
import { podePagar } from "../lib/cartao.js";
import { bancoDoCartao, estiloDoBanco } from "../lib/bancos.js";

// Linha de cada fatura fechada: valor, vencimento e como está o pagamento
function FaturaFechada({ fatura, onPagar }) {
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
      {onPagar && podePagar(fatura) && (
        <button
          type="button"
          className="cc-btn cc-pagar"
          onClick={(e) => {
            e.stopPropagation();
            onPagar(fatura);
          }}
        >
          Pagar
        </button>
      )}
    </div>
  );
}

// Painel do cartão: nome, bandeira, limite total, usado, disponível,
// barra de uso, fatura atual, faturas fechadas (com o botão Pagar), fechamento e vencimento.
// As cores seguem o banco quando o app reconhece o nome do cartão (ex.: Nubank roxo).
export default function CardSummary({ cartao, resumo, onClick, onPagar, children }) {
  const banco = bancoDoCartao(cartao.nome);
  const atual = resumo.faturaAtual;
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
        {children}
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
      </div>

      {resumo.faturasFechadas.map((fatura) => (
        <FaturaFechada key={fatura.mes} fatura={fatura} onPagar={onPagar} />
      ))}

      <div className="cc-dates">
        <span>Fecha dia {cartao.fechamento}</span>
        <span>Vence dia {cartao.vencimento}</span>
      </div>
    </section>
  );
}
