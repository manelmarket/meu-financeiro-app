import React, { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import CardSummary from "../components/CardSummary.jsx";
import CardForm from "../components/CardForm.jsx";
import PagarFatura from "../components/PagarFatura.jsx";
import { podePagar, resumoDoCartao } from "../lib/cartao.js";
import { money, rotuloMes } from "../lib/formato.js";

export default function Cards({ data, hoje, onSaveCard, onDelete, onOpen, onNewPurchase, onCalendar, onPay }) {
  // fatura sendo paga: { cartaoId, mes }
  const [pagando, setPagando] = useState(null);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    if (!aviso) return undefined;
    const tempo = setTimeout(() => setAviso(""), 5000);
    return () => clearTimeout(tempo);
  }, [aviso]);

  function excluirCartao(cartao) {
    const n = (cartao.compras || []).length;
    const aviso = n
      ? `Excluir o cartão ${cartao.nome} e as ${n} compras lançadas nele?`
      : `Excluir o cartão ${cartao.nome}?`;
    if (window.confirm(aviso)) onDelete(cartao.id);
  }

  // a janela sempre usa os dados de agora (se a fatura foi paga em outro aparelho, ela fecha)
  const cartaoPagando = pagando ? data.cartoes.find((c) => c.id === pagando.cartaoId) : null;
  const resumoPagando = cartaoPagando ? resumoDoCartao(cartaoPagando, hoje) : null;
  const faturaPagando = resumoPagando?.faturasFechadas.find((f) => f.mes === pagando.mes && podePagar(f)) || null;

  // a fatura foi paga (ou o cartão saiu) enquanto a janela estava aberta: esquece, para não reabrir sozinha
  useEffect(() => {
    if (pagando && !faturaPagando) setPagando(null);
  }, [pagando, faturaPagando]);

  function confirmarPagamento(pagamento) {
    onPay(cartaoPagando.id, pagamento);
    setPagando(null);
    setAviso(
      `Pagamento de ${money(pagamento.valor)} registrado na fatura de ${rotuloMes(pagamento.fatura)} do cartão ${cartaoPagando.nome}.`
    );
  }

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <div className="eyebrow">Crédito</div>
          <h1>💳 Meus cartões</h1>
        </div>
      </header>

      {aviso && (
        <p className="pag-feito" role="status">
          {aviso}
        </p>
      )}

      {data.cartoes.length > 0 && (
        <button className="secondary wide-top" onClick={onCalendar}>
          <CalendarDays size={18} /> Calendário de faturas
        </button>
      )}

      {data.cartoes.length === 0 && (
        <p className="muted empty">Nenhum cartão cadastrado ainda.</p>
      )}

      {data.cartoes.map((cartao) => (
        <CardSummary
          key={cartao.id}
          cartao={cartao}
          resumo={resumoDoCartao(cartao, hoje)}
          onClick={() => onOpen(cartao.id)}
          onPagar={(fatura) => setPagando({ cartaoId: cartao.id, mes: fatura.mes })}
        >
          <div className="cc-actions">
            <button
              className="cc-btn"
              onClick={(e) => {
                e.stopPropagation();
                onNewPurchase(cartao.id);
              }}
            >
              + Compra
            </button>
            <button
              className="cc-btn"
              title="Excluir cartão"
              onClick={(e) => {
                e.stopPropagation();
                excluirCartao(cartao);
              }}
            >
              🗑
            </button>
          </div>
        </CardSummary>
      ))}

      <CardForm titulo="Adicionar cartão" textoBotao="Adicionar" onSave={onSaveCard} />

      {faturaPagando && (
        <PagarFatura
          cartao={cartaoPagando}
          fatura={faturaPagando}
          disponivel={resumoPagando.disponivel}
          hoje={hoje}
          onConfirmar={confirmarPagamento}
          onFechar={() => setPagando(null)}
        />
      )}
    </div>
  );
}
