import React, { useMemo, useState } from "react";
import MonthPicker from "../components/MonthPicker.jsx";
import { diaMesBR, mesDaData, money, nomeMes, somarMeses } from "../lib/formato.js";
import { resumoDoMes } from "../lib/mes.js";
import { infoDaCategoria, mapaDeCategorias } from "../lib/categorias.js";

const ABAS = [
  ["saldo", "Saldo"],
  ["receitas", "Receitas"],
  ["despesas", "Despesas"]
];

// diferença em relação ao mês anterior: "R$ 120,00 a mais que outubro"
function comparacao(atual, anterior, mesAnterior) {
  const dif = Math.round((atual - anterior) * 100) / 100;
  if (Math.abs(dif) < 0.01) return `igual a ${nomeMes(mesAnterior)}`;
  return `${money(Math.abs(dif))} a ${dif > 0 ? "mais" : "menos"} que ${nomeMes(mesAnterior)}`;
}

// O mês em detalhe (aberto pelos cards Saldo do mês, Receita e Despesas do Início).
// Usa a mesma conta do Início (lib/mes.js → resumoDoMes), então os totais batem com os cards.
export default function MesDetalhe({ data, hoje, mesInicial, abaInicial = "saldo", onBack, onOpenCard, onOpenBills }) {
  const mesHoje = mesDaData(hoje);
  const [mes, setMes] = useState(mesInicial || mesHoje);
  const [aba, setAba] = useState(ABAS.some(([id]) => id === abaInicial) ? abaInicial : "saldo");
  const r = useMemo(() => resumoDoMes(data, mes, hoje), [data, mes, hoje]);
  const mesAnterior = somarMeses(mes, -1);
  const ant = useMemo(() => resumoDoMes(data, mesAnterior, hoje), [data, mesAnterior, hoje]);
  const mapa = useMemo(() => mapaDeCategorias(data), [data]);

  const receitas = r.lancamentos.filter((l) => l.tipo === "entrada");
  const gastos = r.lancamentos.filter((l) => l.tipo !== "entrada");
  const faturas = r.vencimentos.filter((v) => v.tipo === "fatura" && v.despesa > 0);
  const contas = r.vencimentos.filter((v) => v.tipo === "conta");
  const maior = Math.max(1, ...r.categorias.map(([, v]) => v));

  const linhaLancamento = (l) => {
    const c = infoDaCategoria(data, l.categoria, mapa);
    const entrada = l.tipo === "entrada";
    return (
      <div className="transaction" key={l.id}>
        <div>
          <b>{l.descricao}</b>
          <span>
            <span aria-hidden="true">{entrada ? "💰" : c.icone}</span> {entrada ? "Receita" : c.nome}
            {l.pagamento ? ` · ${l.pagamento}` : ""} · {diaMesBR(l.data)}
          </span>
        </div>
        <strong className={entrada ? "in" : "out"}>
          {entrada ? "+" : "-"}
          {money(Number(l.valor) || 0)}
        </strong>
      </div>
    );
  };

  return (
    <div className="page mes-detalhe">
      <header className="topbar with-back">
        <button className="back" onClick={onBack} aria-label="Voltar">
          ←
        </button>
        <div>
          <div className="eyebrow">Meu mês</div>
          <h1>{nomeMes(mes).replace(/^./, (x) => x.toUpperCase())} em detalhe</h1>
        </div>
      </header>

      <MonthPicker mes={mes} mesHoje={mesHoje} onChange={setMes} />

      <div className="segmented tres mes-abas" role="tablist" aria-label="O que ver">
        {ABAS.map(([id, rotulo]) => (
          <button
            type="button"
            key={id}
            role="tab"
            aria-selected={aba === id}
            aria-checked={aba === id}
            className={aba === id ? `selected ${id === "receitas" ? "success" : id === "despesas" ? "danger" : "info"}` : ""}
            onClick={() => setAba(id)}
          >
            {rotulo}
          </button>
        ))}
      </div>

      {aba === "saldo" && (
        <>
          <section className="section-card mes-total">
            <span>Saldo de {nomeMes(mes)}</span>
            <strong className={r.saldo < 0 ? "neg" : "in"}>{money(r.saldo)}</strong>
            <small>{comparacao(r.saldo, ant.saldo, mesAnterior)}</small>
          </section>
          <section className="section-card">
            <h2>Como chegou nesse valor</h2>
            <button type="button" className="mes-conta" onClick={() => setAba("receitas")}>
              <span>Receitas</span>
              <b className="in">+{money(r.receitas)}</b>
            </button>
            <button type="button" className="mes-conta" onClick={() => setAba("despesas")}>
              <span>Despesas</span>
              <b className="out">-{money(r.despesas)}</b>
            </button>
            <div className="mes-conta total">
              <span>Saldo</span>
              <b className={r.saldo < 0 ? "out" : "in"}>{money(r.saldo)}</b>
            </div>
          </section>
          <section className="section-card">
            <h2>Comparado a {nomeMes(mesAnterior)}</h2>
            <div className="mes-conta">
              <span>Receitas</span>
              <small>{comparacao(r.receitas, ant.receitas, mesAnterior)}</small>
            </div>
            <div className="mes-conta">
              <span>Despesas</span>
              <small>{comparacao(r.despesas, ant.despesas, mesAnterior)}</small>
            </div>
          </section>
        </>
      )}

      {aba === "receitas" && (
        <>
          <section className="section-card mes-total">
            <span>Receitas de {nomeMes(mes)}</span>
            <strong className="in">{money(r.receitas)}</strong>
            <small>
              {receitas.length} {receitas.length === 1 ? "receita" : "receitas"} · {comparacao(r.receitas, ant.receitas, mesAnterior)}
            </small>
          </section>
          <section className="section-card">
            <h2>Todas as receitas</h2>
            {receitas.length === 0 ? <p className="muted">Nenhuma receita neste mês.</p> : receitas.map(linhaLancamento)}
          </section>
        </>
      )}

      {aba === "despesas" && (
        <>
          <section className="section-card mes-total">
            <span>Despesas de {nomeMes(mes)}</span>
            <strong className="out">{money(r.despesas)}</strong>
            <small>{comparacao(r.despesas, ant.despesas, mesAnterior)}</small>
          </section>

          <section className="section-card">
            <h2>De onde vieram</h2>
            <div className="mes-conta">
              <span>Lançamentos</span>
              <b>{money(r.origem.lancamentos)}</b>
            </div>
            <div className="mes-conta">
              <span>Faturas de cartão</span>
              <b>{money(r.origem.cartoes)}</b>
            </div>
            <div className="mes-conta">
              <span>Contas fixas</span>
              <b>{money(r.origem.fixas)}</b>
            </div>
          </section>

          {r.categorias.length > 0 && (
            <section className="section-card">
              <h2>Por categoria</h2>
              {r.categorias.map(([nome, valor]) => {
                const c = infoDaCategoria(data, nome, mapa);
                return (
                  <div className="cat-row" key={nome}>
                    <div className="cat-head">
                      <span>
                        <span aria-hidden="true">{c.icone}</span> {c.nome}
                      </span>
                      <b>
                        {money(valor)} · {Math.round((valor / (r.despesas || 1)) * 100)}%
                      </b>
                    </div>
                    <div className="bar">
                      <i style={{ width: `${Math.max(4, (valor / maior) * 100)}%`, background: c.cor }} />
                    </div>
                  </div>
                );
              })}
            </section>
          )}

          <section className="section-card">
            <h2>Lançamentos · {money(r.origem.lancamentos)}</h2>
            {gastos.length === 0 ? <p className="muted">Nenhum gasto lançado neste mês.</p> : gastos.map(linhaLancamento)}
          </section>

          <section className="section-card">
            <h2>Faturas de cartão · {money(r.origem.cartoes)}</h2>
            {faturas.length === 0 ? (
              <p className="muted">Nenhuma compra no cartão para este mês.</p>
            ) : (
              faturas.map((v) => (
                <button type="button" className="transaction mes-item" key={v.id} onClick={() => onOpenCard(v.cartaoId)}>
                  <div>
                    <b>{v.descricao}</b>
                    <span>
                      Compras desta fatura · vence {diaMesBR(v.data)}
                      {v.status === "paga" ? " · paga" : ""}
                    </span>
                  </div>
                  <strong className="out">-{money(v.despesa)}</strong>
                </button>
              ))
            )}
          </section>

          <section className="section-card">
            <h2>Contas fixas · {money(r.origem.fixas)}</h2>
            {contas.length === 0 ? (
              <p className="muted">Nenhuma conta fixa neste mês.</p>
            ) : (
              contas.map((v) => (
                <button type="button" className="transaction mes-item" key={v.id} onClick={onOpenBills}>
                  <div>
                    <b>{v.descricao}</b>
                    <span>
                      Vence {diaMesBR(v.data)} · {v.status === "paga" ? "paga" : "em aberto"}
                    </span>
                  </div>
                  <strong className="out">-{money(v.valor)}</strong>
                </button>
              ))
            )}
          </section>
        </>
      )}
    </div>
  );
}
