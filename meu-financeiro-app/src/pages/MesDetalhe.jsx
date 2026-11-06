import React, { useMemo, useState } from "react";
import MonthPicker from "../components/MonthPicker.jsx";
import { diaMesBR, mesDaData, money, nomeMes, somarMeses } from "../lib/formato.js";
import { resumoDoMes } from "../lib/mes.js";
import { previsaoDoMes } from "../lib/previsao.js";
import { infoDaCategoria, mapaDeCategorias } from "../lib/categorias.js";

const ABAS = [
  ["saldo", "Saldo"],
  ["receitas", "Receitas"],
  ["despesas", "Despesas"],
  ["previsao", "Previsão"]
];

// diferença em relação ao mês anterior: "R$ 120,00 a mais que outubro"
function comparacao(atual, anterior, mesAnterior) {
  const dif = Math.round((atual - anterior) * 100) / 100;
  if (Math.abs(dif) < 0.01) return `igual a ${nomeMes(mesAnterior)}`;
  return `${money(Math.abs(dif))} a ${dif > 0 ? "mais" : "menos"} que ${nomeMes(mesAnterior)}`;
}

// O mês em detalhe (aberto pelos cards Saldo do mês, Receita e Despesas do Início).
// Usa a mesma conta do Início (lib/mes.js → resumoDoMes), então os totais batem com os cards.
export default function MesDetalhe({ data, hoje, mesInicial, abaInicial = "saldo", onBack, onOpenCard, onOpenBills, onOpenPage }) {
  const mesHoje = mesDaData(hoje);
  const [mes, setMes] = useState(mesInicial || mesHoje);
  const [aba, setAba] = useState(ABAS.some(([id]) => id === abaInicial) ? abaInicial : "saldo");
  const r = useMemo(() => resumoDoMes(data, mes, hoje), [data, mes, hoje]);
  const mesAnterior = somarMeses(mes, -1);
  const ant = useMemo(() => resumoDoMes(data, mesAnterior, hoje), [data, mesAnterior, hoje]);
  const mapa = useMemo(() => mapaDeCategorias(data), [data]);
  const p = useMemo(() => previsaoDoMes(data, hoje), [data, hoje]);
  const abas = mes === mesHoje ? ABAS : ABAS.filter(([id]) => id !== "previsao");
  const abaVisivel = aba === "previsao" && mes !== mesHoje ? "saldo" : aba;

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

      <div className={`segmented mes-abas ${abas.length === 4 ? "quatro" : "tres"}`} role="tablist" aria-label="O que ver">
        {abas.map(([id, rotulo]) => (
          <button
            type="button"
            key={id}
            role="tab"
            aria-selected={abaVisivel === id}
            aria-checked={abaVisivel === id}
            className={abaVisivel === id ? `selected ${id === "receitas" ? "success" : id === "despesas" ? "danger" : "info"}` : ""}
            onClick={() => setAba(id)}
          >
            {rotulo}
          </button>
        ))}
      </div>

      {abaVisivel === "saldo" && (
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

      {abaVisivel === "receitas" && (
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

      {abaVisivel === "previsao" && (
        <>
          <section className="section-card mes-total">
            <span>Previsão para {diaMesBR(p.fim)}</span>
            <strong className={p.previsto < 0 ? "neg" : "in"}>{money(p.previsto)}</strong>
            <small>{p.previsto >= 0 ? "é o que deve sobrar se nada mudar" : "é o que deve faltar se nada mudar"}</small>
          </section>
          <section className="section-card">
            <h2>A conta</h2>
            <div className="mes-conta">
              <span>{p.comBancos ? "Hoje nos bancos" : `Saldo de ${nomeMes(mes)} até agora`}</span>
              <b>{money(p.base)}</b>
            </div>
            <div className="mes-conta">
              <span>Ainda vai entrar</span>
              <b className="in">+{money(p.totalReceber)}</b>
            </div>
            {p.comBancos && (
              <div className="mes-conta">
                <span>Ainda vai sair (contas e faturas)</span>
                <b className="out">-{money(p.totalPagar)}</b>
              </div>
            )}
            <div className="mes-conta total">
              <span>Previsão</span>
              <b className={p.previsto < 0 ? "out" : "in"}>{money(p.previsto)}</b>
            </div>
            {!p.comBancos && (
              <p className="hint">Sem bancos cadastrados, a previsão parte do saldo do mês (as contas e faturas já estão nas despesas). Cadastre seus bancos para a previsão usar o dinheiro que você tem hoje.</p>
            )}
          </section>
          <section className="section-card">
            <div className="section-title">
              <h2 className="no-margin">Vai entrar</h2>
              <button type="button" className="link" onClick={() => onOpenPage?.("receitas-fixas")}>
                receitas fixas
              </button>
            </div>
            {p.receber.length === 0 ? (
              <p className="muted">Nada previsto. Cadastre o salário em Receitas fixas para ele entrar na previsão.</p>
            ) : (
              p.receber.map((x) => (
                <div className="transaction" key={x.id}>
                  <div>
                    <b>{x.descricao}</b>
                    <span>Receita fixa · {diaMesBR(x.data)}</span>
                  </div>
                  <strong className="in">+{money(x.valor)}</strong>
                </div>
              ))
            )}
          </section>
          <section className="section-card">
            <h2>Vai sair</h2>
            {p.pagar.length === 0 ? (
              <p className="muted">Nenhuma conta ou fatura em aberto até o fim do mês.</p>
            ) : (
              p.pagar.map((x) => (
                <button
                  type="button"
                  className="transaction mes-item"
                  key={x.id}
                  onClick={() => (x.tipo === "fatura" ? onOpenCard(x.cartaoId) : onOpenBills())}
                >
                  <div>
                    <b>{x.descricao}</b>
                    <span>
                      {x.tipo === "fatura" ? "Fatura" : "Conta fixa"} · vence {diaMesBR(x.data)}
                    </span>
                  </div>
                  <strong className="out">-{money(x.valor)}</strong>
                </button>
              ))
            )}
          </section>
        </>
      )}

      {abaVisivel === "despesas" && (
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
