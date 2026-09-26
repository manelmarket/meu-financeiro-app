import React from "react";
import { diaMesBR, lerMes, money, nomeMes } from "../lib/formato.js";
import { ROTULO_STATUS, calendarioDeFaturas } from "../lib/cartao.js";

export default function InvoiceCalendar({ cartoes, titulo, hoje, onBack, onOpenCard }) {
  const meses = calendarioDeFaturas(cartoes, hoje);
  const varios = cartoes.length > 1;

  return (
    <div className="page">
      <header className="topbar with-back">
        <button className="back" onClick={onBack} aria-label="Voltar">
          ←
        </button>
        <div>
          <div className="eyebrow">{titulo}</div>
          <h1>🗓️ Calendário de faturas</h1>
        </div>
      </header>

      {meses.length === 0 && (
        <section className="section-card">
          <p className="muted">Nenhuma fatura prevista.</p>
        </section>
      )}

      {meses.map((linha) => {
        const unico = !varios ? linha.cartoes[0] : null;
        return (
          <section className="section-card calendar-month" key={linha.mes}>
            <div className="section-title">
              <div>
                <div className="month-name">
                  {nomeMes(linha.mes).toUpperCase()} {lerMes(linha.mes).y}
                </div>
                <small className="muted">
                  {unico ? `${ROTULO_STATUS[unico.status]} · vence ${diaMesBR(unico.vencimento)}` : "Previsto no mês"}
                </small>
              </div>
              <strong className="big-value">{money(linha.total)}</strong>
            </div>

            {varios &&
              linha.cartoes.map((c) => (
                <button className="calendar-card-row" key={c.cartaoId} onClick={() => onOpenCard(c.cartaoId)}>
                  <span>
                    <b>{c.nome}</b>
                    <small>
                      {ROTULO_STATUS[c.status]} · vence {diaMesBR(c.vencimento)}
                    </small>
                  </span>
                  <strong>{money(c.valor)}</strong>
                </button>
              ))}
          </section>
        );
      })}
    </div>
  );
}
