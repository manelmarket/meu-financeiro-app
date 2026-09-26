import React from "react";
import { money, rotuloMes } from "../lib/formato.js";
import { lancamentosFuturos } from "../lib/cartao.js";

export default function FutureEntries({ cartao, hoje, onBack }) {
  const meses = lancamentosFuturos(cartao, hoje);
  const total = meses.reduce((t, m) => t + m.valor, 0);

  return (
    <div className="page">
      <header className="topbar with-back">
        <button className="back" onClick={onBack} aria-label="Voltar">
          ←
        </button>
        <div>
          <div className="eyebrow">{cartao.nome}</div>
          <h1>📅 Lançamentos futuros</h1>
        </div>
      </header>

      <p className="muted intro">
        Parcelas que vão cair nas próximas faturas, depois da fatura atual.
      </p>

      {meses.length === 0 ? (
        <section className="section-card">
          <p className="muted">Nenhum lançamento futuro neste cartão.</p>
        </section>
      ) : (
        <>
          {meses.map((mes) => (
            <section className="section-card" key={mes.mes}>
              <div className="section-title">
                <h2 className="no-margin">{rotuloMes(mes.mes)}</h2>
                <strong>{money(mes.valor)}</strong>
              </div>
              {mes.itens.map((p) => (
                <div className="transaction" key={`${p.compraId}-${p.numero}`}>
                  <div>
                    <b>Compra: {p.descricao}</b>
                    <span>
                      {p.total > 1 ? `Parcela ${p.numero}/${p.total}` : "À vista"} · {p.categoria}
                    </span>
                  </div>
                  <strong className="out">{money(p.valor)}</strong>
                </div>
              ))}
            </section>
          ))}

          <section className="mini-card total-card">
            <span>Total já comprometido nas próximas faturas</span>
            <strong>{money(total)}</strong>
          </section>
        </>
      )}
    </div>
  );
}
