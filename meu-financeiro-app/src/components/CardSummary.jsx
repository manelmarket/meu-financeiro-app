import React from "react";
import { diaMesBR, money, rotuloMes } from "../lib/formato.js";

// Painel do cartão: nome, bandeira, limite total, usado, disponível,
// barra de uso, fatura atual, fechamento e vencimento.
export default function CardSummary({ cartao, resumo, onClick, children }) {
  return (
    <section
      className={`credit-card${onClick ? " clickable" : ""}`}
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
          <small>Fatura atual · {rotuloMes(resumo.faturaAtual.mes)}</small>
          <strong>{money(resumo.faturaAtual.valor)}</strong>
        </div>
      </div>

      {resumo.faturasFechadas.map((fatura) => (
        <div className="cc-closed" key={fatura.mes}>
          Fatura fechada de {rotuloMes(fatura.mes)}: <b>{money(fatura.valor)}</b>
          {" "}· vence {diaMesBR(fatura.vencimento)}
        </div>
      ))}

      <div className="cc-dates">
        <span>Fecha dia {cartao.fechamento}</span>
        <span>Vence dia {cartao.vencimento}</span>
      </div>
    </section>
  );
}
