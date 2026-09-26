import React, { useMemo, useState } from "react";
import MonthPicker from "../components/MonthPicker.jsx";
import { ICONE_FRASE } from "./Assistant.jsx";
import { lerData, mesDaData, money, nomeMes, MESES } from "../lib/formato.js";
import { resumoDoMes } from "../lib/mes.js";
import { alertas, analiseDoMes } from "../lib/analise.js";

const ICONE_ALERTA = { aviso: "⚠️", ok: "✅", info: "📅" };

export default function Home({ data, hoje, onNew, onOpenBills, onOpenCard, onOpenPage }) {
  const mesHoje = mesDaData(hoje);
  const [mes, setMes] = useState(mesHoje);
  const r = useMemo(() => resumoDoMes(data, mes, hoje), [data, mes, hoje]);
  const avisos = useMemo(() => alertas(data, hoje), [data, hoje]);
  const frases = useMemo(() => analiseDoMes(data, mes, hoje), [data, mes, hoje]);

  const maior = Math.max(1, ...r.categorias.map(([, v]) => v));

  function abrirAlerta(a) {
    if (a.cartaoId != null) onOpenCard(a.cartaoId);
    else if (a.pagina) onOpenPage(a.pagina);
  }

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <div className="eyebrow">Meu mês</div>
          <h1>Olá, {data.usuario?.nome || "você"} 👋</h1>
        </div>
      </header>

      {avisos.length > 0 && (
        <section className="alerts" aria-label="Alertas">
          {avisos.map((a) => (
            <button
              type="button"
              key={a.id}
              className={`alert ${a.tipo}`}
              onClick={() => abrirAlerta(a)}
              disabled={a.cartaoId == null && !a.pagina}
            >
              <span aria-hidden="true">{ICONE_ALERTA[a.tipo]}</span>
              <p>{a.texto}</p>
            </button>
          ))}
        </section>
      )}

      <MonthPicker mes={mes} mesHoje={mesHoje} onChange={setMes} />

      <section className="balance-card">
        <span>Saldo do mês</span>
        <strong className={r.saldo < 0 ? "neg" : ""}>{money(r.saldo)}</strong>
        <small>Receitas menos despesas de {nomeMes(mes)}</small>
      </section>

      <div className="grid2">
        <section className="mini-card positive">
          <span>Receita</span>
          <strong>{money(r.receitas)}</strong>
        </section>
        <section className="mini-card negative">
          <span>Despesas</span>
          <strong>{money(r.despesas)}</strong>
        </section>
      </div>

      <p className="origin-line">
        Despesas = lançamentos {money(r.origem.lancamentos)} + faturas {money(r.origem.cartoes)} + contas fixas{" "}
        {money(r.origem.fixas)}
      </p>

      <nav className="shortcuts" aria-label="Atalhos">
        <button type="button" onClick={onOpenBills}>
          <span aria-hidden="true">🔁</span>Contas fixas
        </button>
        <button type="button" onClick={() => onOpenPage("investments")}>
          <span aria-hidden="true">📈</span>Investimentos
        </button>
        <button type="button" onClick={() => onOpenPage("patrimony")}>
          <span aria-hidden="true">🏦</span>Patrimônio
        </button>
        <button type="button" onClick={() => onOpenPage("assistant")}>
          <span aria-hidden="true">✨</span>Assistente
        </button>
      </nav>

      <section className="section-card">
        <div className="section-title">
          <h2 className="no-margin">Análise do mês</h2>
          <button className="link" onClick={() => onOpenPage("assistant")}>
            ver mais
          </button>
        </div>
        <ul className="insights">
          {frases.slice(0, 3).map((f, i) => (
            <li key={i} className={`insight ${f.tipo}`}>
              <span aria-hidden="true">{ICONE_FRASE[f.tipo]}</span>
              <p>{f.texto}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="section-card">
        <div className="section-title">
          <h2 className="no-margin">Despesas por categoria</h2>
        </div>
        {r.categorias.length === 0 ? (
          <p className="muted">Nenhuma despesa neste mês.</p>
        ) : (
          r.categorias.map(([nome, valor]) => (
            <div className="cat-row" key={nome}>
              <div className="cat-head">
                <span>{nome}</span>
                <b>
                  {money(valor)} · {Math.round((valor / (r.despesas || 1)) * 100)}%
                </b>
              </div>
              <div className="bar">
                <i style={{ width: `${Math.max(4, (valor / maior) * 100)}%` }} />
              </div>
            </div>
          ))
        )}
      </section>

      <section className="section-card">
        <div className="section-title">
          <h2 className="no-margin">Vencimentos do mês</h2>
        </div>
        {r.vencimentos.length === 0 ? (
          <p className="muted">Nada vencendo neste mês.</p>
        ) : (
          r.vencimentos.map((v) => {
            const { m, d } = lerData(v.data);
            const clicavel = v.tipo === "fatura";
            return (
              <div
                className={`due-row${clicavel ? " clickable" : ""}`}
                key={v.id}
                onClick={clicavel ? () => onOpenCard(v.cartaoId) : undefined}
              >
                <div className="due-day">
                  <b>{String(d).padStart(2, "0")}</b>
                  <span>{MESES[m - 1].slice(0, 3)}</span>
                </div>
                <div className="due-info">
                  <b>{v.descricao}</b>
                  <span>{v.tipo === "fatura" ? "Fatura do cartão" : "Conta fixa"}</span>
                </div>
                <strong>{money(v.valor)}</strong>
              </div>
            );
          })
        )}
        <button className="ghost wide" onClick={onOpenBills}>
          🔁 Contas fixas
        </button>
      </section>

      <section className="section-card">
        <div className="section-title">
          <h2 className="no-margin">Lançamentos do mês</h2>
        </div>
        {r.lancamentos.length === 0 ? (
          <p className="muted">Nenhum lançamento neste mês.</p>
        ) : (
          r.lancamentos.slice(0, 5).map((item) => (
            <div className="transaction" key={item.id}>
              <div>
                <b>{item.descricao}</b>
                <span>
                  {item.categoria} · {item.pagamento}
                </span>
              </div>
              <strong className={item.tipo === "entrada" ? "in" : "out"}>
                {item.tipo === "entrada" ? "+" : "-"}
                {money(item.valor)}
              </strong>
            </div>
          ))
        )}
      </section>

      <button className="primary wide" onClick={onNew}>
        + Adicionar lançamento
      </button>
    </div>
  );
}
