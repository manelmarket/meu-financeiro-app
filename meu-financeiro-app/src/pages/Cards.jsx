import React from "react";
import { CalendarDays } from "lucide-react";
import CardSummary from "../components/CardSummary.jsx";
import CardForm from "../components/CardForm.jsx";
import { resumoDoCartao } from "../lib/cartao.js";

export default function Cards({ data, hoje, onSaveCard, onDelete, onOpen, onNewPurchase, onCalendar }) {
  function excluirCartao(cartao) {
    const n = (cartao.compras || []).length;
    const aviso = n
      ? `Excluir o cartão ${cartao.nome} e as ${n} compras lançadas nele?`
      : `Excluir o cartão ${cartao.nome}?`;
    if (window.confirm(aviso)) onDelete(cartao.id);
  }

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <div className="eyebrow">Crédito</div>
          <h1>💳 Meus cartões</h1>
        </div>
      </header>

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
    </div>
  );
}
