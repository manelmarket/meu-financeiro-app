import React, { useMemo } from "react";
import { MESES, lerData, mesDaData, money, somarDias, somarMeses } from "../lib/formato.js";
import { resumoDoMes } from "../lib/mes.js";
import { textoDoPagamento } from "../lib/cartao.js";

// "Fatura do cartão", "Fatura do cartão · falta R$ 200,00"
function textoDaFatura(v) {
  const pagamento = textoDoPagamento(v);
  return pagamento ? `Fatura do cartão · ${pagamento}` : "Fatura do cartão";
}

// Tela "Vencimentos": contas fixas e faturas ainda não pagas, deste mês e do que vem,
// separadas em Atrasados, Vencem hoje, Próximos 7 dias e Mais à frente.
export default function Vencimentos({ data, hoje, onBack, onOpenCard, onOpenBills }) {
  const mes = mesDaData(hoje);

  const itens = useMemo(() => {
    const deste = resumoDoMes(data, mes, hoje).vencimentos;
    const doProximo = resumoDoMes(data, somarMeses(mes, 1), hoje).vencimentos;
    return [...deste, ...doProximo].filter((v) => v.status !== "paga");
  }, [data, mes, hoje]);

  const semana = somarDias(hoje, 7);
  const grupos = [
    { titulo: "⏰ Atrasados", lista: itens.filter((v) => v.data < hoje) },
    { titulo: "📍 Vencem hoje", lista: itens.filter((v) => v.data === hoje) },
    { titulo: "📅 Próximos 7 dias", lista: itens.filter((v) => v.data > hoje && v.data <= semana) },
    { titulo: "🗓️ Mais à frente", lista: itens.filter((v) => v.data > semana) }
  ].filter((g) => g.lista.length > 0);

  return (
    <div className="page">
      <header className="topbar with-back">
        <button className="back" onClick={onBack} aria-label="Voltar">
          ←
        </button>
        <div>
          <div className="eyebrow">Meu mês</div>
          <h1>🗓️ Vencimentos</h1>
        </div>
      </header>

      <p className="muted">Contas fixas e faturas de cartão ainda não pagas, deste mês e do que vem.</p>

      {grupos.length === 0 && (
        <section className="section-card">
          <p className="muted no-margin">Nada vencendo por enquanto. 🎉</p>
        </section>
      )}

      {grupos.map((g) => (
        <section className="section-card" key={g.titulo}>
          <div className="section-title">
            <h2 className="no-margin">{g.titulo}</h2>
          </div>
          {g.lista.map((v) => {
            const { m, d } = lerData(v.data);
            const clicavel = v.tipo === "fatura" || v.tipo === "conta";
            return (
              <div
                className={`due-row${clicavel ? " clickable" : ""}`}
                key={`${v.id}-${v.data}`}
                onClick={clicavel ? () => (v.tipo === "fatura" ? onOpenCard(v.cartaoId) : onOpenBills()) : undefined}
              >
                <div className="due-day">
                  <b>{String(d).padStart(2, "0")}</b>
                  <span>{MESES[m - 1].slice(0, 3)}</span>
                </div>
                <div className="due-info">
                  <b>{v.descricao}</b>
                  <span>{v.tipo === "fatura" ? textoDaFatura(v) : "Conta fixa"}</span>
                </div>
                <strong>{money(v.valor)}</strong>
              </div>
            );
          })}
        </section>
      ))}

      <button className="ghost wide" onClick={onOpenBills}>
        🔁 Contas fixas
      </button>
    </div>
  );
}
