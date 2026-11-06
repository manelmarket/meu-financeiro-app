import React, { useEffect, useState } from "react";
import { CalendarDays, Plus } from "lucide-react";
import CardSummary from "../components/CardSummary.jsx";
import CardForm from "../components/CardForm.jsx";
import CartaoModerno from "../components/CartaoModerno.jsx";
import { usarAparencia } from "../lib/aparencia.js";
import PagarFatura from "../components/PagarFatura.jsx";
import { faturasParaPagar, resumoDoCartao } from "../lib/cartao.js";
import { money, rotuloMes } from "../lib/formato.js";
import { resumoDosBancos } from "../lib/saldos.js";

export default function Cards({ data, hoje, onSaveCard, onDelete, onOpen, onNewPurchase, onCalendar, onPay }) {
  // fatura sendo paga: { cartaoId, mes }
  const [pagando, setPagando] = useState(null);
  const [aviso, setAviso] = useState("");
  const [novoCartao, setNovoCartao] = useState(false);
  const { estilo } = usarAparencia();
  const moderno = estilo === "banco" || estilo === "vidro";

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
  const faturasPagando = resumoPagando ? faturasParaPagar(resumoPagando) : [];

  // a fatura foi paga (ou o cartão saiu) enquanto a janela estava aberta: esquece, para não reabrir sozinha
  useEffect(() => {
    if (pagando && faturasPagando.length === 0) setPagando(null);
  }, [pagando, faturasPagando.length]);

  function confirmarPagamento(pagamento) {
    onPay(cartaoPagando.id, pagamento);
    setPagando(null);
    setAviso(
      `Pagamento de ${money(pagamento.valor)} registrado na fatura de ${rotuloMes(pagamento.fatura)} do cartão ${cartaoPagando.nome}.`
    );
  }

  const janelaDePagamento = faturasPagando.length > 0 && (
    <PagarFatura
      key={`${pagando.cartaoId}-${pagando.mes}`}
      cartao={cartaoPagando}
      faturas={faturasPagando}
      inicial={pagando.mes}
      disponivel={resumoPagando.disponivel}
      bancos={resumoDosBancos(data).bancos}
      hoje={hoje}
      onConfirmar={confirmarPagamento}
      onFechar={() => setPagando(null)}
    />
  );

  if (moderno) {
    const semCartao = data.cartoes.length === 0;
    return (
      <div className="page cartoes-m">
        <header className="topbar cartoes-m-topo">
          <div>
            <h1>Cartões</h1>
          </div>
          <button type="button" className="cartoes-m-mais" onClick={() => setNovoCartao((v) => !v)} aria-label="Adicionar cartão" aria-expanded={novoCartao || semCartao}>
            <Plus size={20} strokeWidth={2.4} />
          </button>
        </header>
        {aviso && (
          <p className="pag-feito" role="status">
            {aviso}
          </p>
        )}
        {(novoCartao || semCartao) && (
          <CardForm
            titulo="Adicionar cartão"
            textoBotao="Adicionar"
            onSave={(c) => {
              onSaveCard(c);
              setNovoCartao(false);
            }}
          />
        )}
        {data.cartoes.map((cartao) => (
          <CartaoModerno
            key={cartao.id}
            cartao={cartao}
            resumo={resumoDoCartao(cartao, hoje)}
            hoje={hoje}
            onAbrir={() => onOpen(cartao.id)}
            onPagar={(fatura) => fatura && setPagando({ cartaoId: cartao.id, mes: fatura.mes })}
            onNovaCompra={() => onNewPurchase(cartao.id)}
            onCalendario={onCalendar}
            onExcluir={() => excluirCartao(cartao)}
          />
        ))}
        {janelaDePagamento}
      </div>
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
          hoje={hoje}
          onClick={() => onOpen(cartao.id)}
          onPagar={(fatura) => fatura && setPagando({ cartaoId: cartao.id, mes: fatura.mes })}
        >
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
        </CardSummary>
      ))}

      <CardForm titulo="Adicionar cartão" textoBotao="Adicionar" onSave={onSaveCard} />

      {janelaDePagamento}
    </div>
  );
}
