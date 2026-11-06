import React, { useMemo } from "react";
import { Printer } from "lucide-react";
import { conteudoDoMes } from "../lib/exportar.js";
import { dataBR, moneyReal as money, nomeMes } from "../lib/formato.js";
import { ehTransferencia } from "../lib/transferencias.js";

// Relatório do mês pronto para imprimir ou salvar em PDF (pelo "Imprimir" do celular/navegador).
// Sempre com os valores de verdade.
export default function RelatorioImpressao({ data, hoje, mes, onBack }) {
  const { r, lancamentos, compras, contas, titulo } = useMemo(() => conteudoDoMes(data, mes, hoje), [data, mes, hoje]);
  const gerado = new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

  return (
    <div className="page relatorio-impressao">
      <div className="nao-imprimir relatorio-topo">
        <button className="back" onClick={onBack} aria-label="Voltar">
          ←
        </button>
        <button type="button" className="primary" onClick={() => window.print()}>
          <Printer size={18} /> Salvar em PDF / imprimir
        </button>
      </div>
      <p className="hint nao-imprimir">Na janela que abrir, escolha "Salvar como PDF" como impressora.</p>

      <article className="relatorio-folha">
        <header>
          <h1>Relatório de {nomeMes(mes).replace(/^./, (x) => x.toUpperCase())}</h1>
          <p>
            Meu Financeiro · {titulo} · gerado em {gerado}
          </p>
        </header>

        <section className="relatorio-kpis">
          <div>
            <small>Receitas</small>
            <b className="in">{money(r.receitas)}</b>
          </div>
          <div>
            <small>Despesas</small>
            <b className="out">{money(r.despesas)}</b>
          </div>
          <div>
            <small>Saldo</small>
            <b className={r.saldo < 0 ? "out" : "in"}>{money(r.saldo)}</b>
          </div>
        </section>
        <p className="relatorio-nota">
          Despesas = lançamentos {money(r.origem.lancamentos)} + faturas de cartão {money(r.origem.cartoes)} + contas fixas {money(r.origem.fixas)}
        </p>

        <h2>Despesas por categoria</h2>
        <table>
          <thead>
            <tr>
              <th>Categoria</th>
              <th className="num">Valor</th>
              <th className="num">%</th>
            </tr>
          </thead>
          <tbody>
            {r.categorias.map(([c, v]) => (
              <tr key={c}>
                <td>{c}</td>
                <td className="num">{money(v)}</td>
                <td className="num">{r.despesas > 0 ? Math.round((v / r.despesas) * 100) : 0}%</td>
              </tr>
            ))}
            {r.categorias.length === 0 && (
              <tr>
                <td colSpan={3}>Nenhuma despesa.</td>
              </tr>
            )}
          </tbody>
        </table>

        <h2>Lançamentos</h2>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th className="num">Valor</th>
            </tr>
          </thead>
          <tbody>
            {lancamentos.map((l) => {
              const transf = ehTransferencia(l);
              return (
                <tr key={l.id}>
                  <td>{dataBR(l.data)}</td>
                  <td>
                    {l.descricao}
                    {l.obs ? <small> · {l.obs}</small> : null}
                  </td>
                  <td>{transf ? "Transferência" : l.tipo === "entrada" ? "Receita" : l.categoria}</td>
                  <td className={`num ${transf ? "" : l.tipo === "entrada" ? "in" : "out"}`}>
                    {transf ? "" : l.tipo === "entrada" ? "+" : "-"}
                    {money(Number(l.valor) || 0)}
                  </td>
                </tr>
              );
            })}
            {lancamentos.length === 0 && (
              <tr>
                <td colSpan={4}>Nenhum lançamento.</td>
              </tr>
            )}
          </tbody>
        </table>

        {compras.length > 0 && (
          <>
            <h2>Faturas de cartão</h2>
            <table>
              <thead>
                <tr>
                  <th>Cartão</th>
                  <th>Descrição</th>
                  <th>Parcela</th>
                  <th className="num">Valor</th>
                </tr>
              </thead>
              <tbody>
                {compras.map((c, i) => (
                  <tr key={i}>
                    <td>{c.cartao}</td>
                    <td>{c.descricao}</td>
                    <td>{c.parcela}</td>
                    <td className="num out">{money(c.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {contas.length > 0 && (
          <>
            <h2>Contas fixas</h2>
            <table>
              <thead>
                <tr>
                  <th>Conta</th>
                  <th>Vence</th>
                  <th>Situação</th>
                  <th className="num">Valor</th>
                </tr>
              </thead>
              <tbody>
                {contas.map((c) => (
                  <tr key={c.id}>
                    <td>{c.descricao}</td>
                    <td>{dataBR(c.data)}</td>
                    <td>{c.status === "paga" ? "paga" : "em aberto"}</td>
                    <td className="num out">{money(c.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </article>
    </div>
  );
}
