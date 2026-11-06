import React from "react";
import { diaMesBR, money } from "../lib/formato.js";
import { acharAssinaturas } from "../lib/assinaturas.js";

// Assinaturas achadas nos gastos (ver lib/assinaturas.js): quanto custam por mês e por ano
export default function Assinaturas({ data, hoje, onBack, onVirarConta, onIgnorar }) {
  const lista = acharAssinaturas(data, hoje);
  const ativas = lista.filter((a) => a.ativa);
  const paradas = lista.filter((a) => !a.ativa);
  const mensal = ativas.reduce((t, a) => t + a.mensal, 0);

  const linha = (a) => (
    <div className="assinatura" key={a.chave}>
      <div className="assinatura-info">
        <b>{a.nome}</b>
        <span>
          {money(a.mensal)}/mês · {money(a.anual)}/ano
        </span>
        <small>
          {a.categoria}
          {a.onde ? ` · ${a.onde}` : ""} · cobrada em {a.meses} meses · última em {diaMesBR(a.ultima)}
        </small>
      </div>
      <div className="assinatura-acoes">
        <button type="button" className="secondary" onClick={() => onVirarConta(a)}>
          Virar conta fixa
        </button>
        <button type="button" className="link" onClick={() => onIgnorar(a.chave)}>
          não é assinatura
        </button>
      </div>
    </div>
  );

  return (
    <div className="page">
      <header className="topbar with-back">
        <button className="back" onClick={onBack} aria-label="Voltar">
          ←
        </button>
        <div>
          <div className="eyebrow">Gastos que se repetem</div>
          <h1>Assinaturas</h1>
        </div>
      </header>

      <section className="balance-card">
        <span>Suas assinaturas custam</span>
        <strong>{money(mensal * 12)} por ano</strong>
        <small>
          {ativas.length} {ativas.length === 1 ? "assinatura ativa" : "assinaturas ativas"} · {money(mensal)} por mês
        </small>
      </section>

      <section className="section-card">
        <h2>Ativas</h2>
        {ativas.length === 0 ? (
          <p className="muted">
            Nenhuma assinatura achada. O app procura gastos com o mesmo nome e valor parecido em pelo menos 3 meses (streaming, apps, academia…).
          </p>
        ) : (
          <>
            <p className="hint">Você ainda usa todas? Cancelar uma de {money(ativas[ativas.length - 1].mensal)} economiza {money(ativas[ativas.length - 1].anual)} por ano.</p>
            {ativas.map(linha)}
          </>
        )}
      </section>

      {paradas.length > 0 && (
        <section className="section-card">
          <h2>Pararam de cobrar</h2>
          <p className="hint">Sem cobrança há mais de 45 dias. Se você cancelou, ótimo! Se não, confira a fatura.</p>
          {paradas.map(linha)}
        </section>
      )}
    </div>
  );
}
