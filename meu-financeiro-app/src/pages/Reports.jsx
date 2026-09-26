import React, { useMemo, useState } from "react";
import MonthPicker from "../components/MonthPicker.jsx";
import Donut from "../components/Donut.jsx";
import ColumnsChart from "../components/ColumnsChart.jsx";
import { MESES, lerMes, mesDaData, money, nomeMes, rotuloMes } from "../lib/formato.js";
import { resumoDoMes } from "../lib/mes.js";
import { fatiasDaPizza, serieMensal } from "../lib/relatorio.js";

// "set/26"
function mesCurto(chave) {
  const { y, m } = lerMes(chave);
  return `${MESES[m - 1].slice(0, 3)}/${String(y).slice(2)}`;
}

// valor sem o "R$" (o cabeçalho da tabela já diz que é em reais)
function numero(v) {
  return money(v).replace(/R\$\s?/u, "");
}

export default function Reports({ data, hoje }) {
  const mesHoje = mesDaData(hoje);
  const [mes, setMes] = useState(mesHoje);

  const r = useMemo(() => resumoDoMes(data, mes, hoje), [data, mes, hoje]);
  const pizza = useMemo(() => fatiasDaPizza(r.categorias, 3), [r]);
  const serie = useMemo(() => serieMensal(data, mes, 6, hoje), [data, mes, hoje]);

  const economia = r.receitas > 0 ? Math.round((r.saldo / r.receitas) * 100) : null;

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <div className="eyebrow">Análise financeira</div>
          <h1>📊 Relatórios</h1>
        </div>
      </header>

      <MonthPicker mes={mes} mesHoje={mesHoje} onChange={setMes} />

      <div className="kpi-grid">
        <section className="mini-card positive">
          <span>Receitas</span>
          <strong>{money(r.receitas)}</strong>
        </section>
        <section className="mini-card negative">
          <span>Despesas</span>
          <strong>{money(r.despesas)}</strong>
        </section>
        <section className="mini-card">
          <span>Saldo</span>
          <strong className={r.saldo < 0 ? "neg" : ""}>{money(r.saldo)}</strong>
        </section>
        <section className="mini-card">
          <span>Economia</span>
          <strong>{economia === null ? "—" : `${economia}%`}</strong>
        </section>
      </div>
      <p className="origin-line">
        Despesas de {nomeMes(mes)} = lançamentos {money(r.origem.lancamentos)} + faturas {money(r.origem.cartoes)} + contas
        fixas {money(r.origem.fixas)}
      </p>

      <section className="section-card">
        <div className="section-title">
          <h2 className="no-margin">Gastos por categoria</h2>
        </div>
        {pizza.fatias.length === 0 ? (
          <p className="muted">Nenhuma despesa em {nomeMes(mes)}.</p>
        ) : (
          <Donut key={mes} fatias={pizza.fatias} total={pizza.total} titulo={`Gastos por categoria em ${rotuloMes(mes)}`} />
        )}
      </section>

      <section className="section-card">
        <div className="section-title">
          <h2 className="no-margin">Evolução mensal</h2>
          <span className="muted small">últimos 6 meses</span>
        </div>
        <ColumnsChart key={mes} meses={serie} mesSelecionado={mes} />

        <table className="data-table">
          <caption>Valores em R$</caption>
          <thead>
            <tr>
              <th>Mês</th>
              <th>Receitas</th>
              <th>Despesas</th>
              <th>Saldo</th>
            </tr>
          </thead>
          <tbody>
            {serie.map((m) => (
              <tr key={m.mes} className={m.mes === mes ? "selected" : ""}>
                <td>{mesCurto(m.mes)}</td>
                <td>{numero(m.receitas)}</td>
                <td>{numero(m.despesas)}</td>
                <td className={m.saldo < 0 ? "neg" : ""}>{numero(m.saldo)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
