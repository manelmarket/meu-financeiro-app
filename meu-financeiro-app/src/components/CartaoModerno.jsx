import React from "react";
import { CalendarDays, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { FaturaFechada } from "./CardSummary.jsx";
import { diaMesBR, money, rotuloMes } from "../lib/formato.js";
import { faturasParaPagar, melhorDiaDeCompra } from "../lib/cartao.js";
import { bancoDoCartao, estiloDoBanco } from "../lib/bancos.js";

// Cartão nos estilos Banco digital e Vidro: o cartão desenhado, o limite, botões grandes e as compras da fatura
export default function CartaoModerno({ cartao, resumo, hoje, onAbrir, onPagar, onNovaCompra, onCalendario, onExcluir }) {
  const banco = bancoDoCartao(cartao.nome);
  const atual = resumo.faturaAtual;
  const paraPagar = faturasParaPagar(resumo);
  const melhor = melhorDiaDeCompra(cartao, hoje);
  const itens = [...(atual.itens || [])].sort((a, b) => b.valor - a.valor);
  const usado = Math.min(100, Math.max(0, resumo.percentual));

  return (
    <section className="cartao-m" aria-label={`Cartão ${cartao.nome}`}>
      <button type="button" className={`cartao-m-visual${banco ? " do-banco" : ""}`} style={estiloDoBanco(banco)} onClick={onAbrir}>
        <span className="cartao-m-topo">
          <b>{cartao.nome}</b>
          {cartao.bandeira && <small>{cartao.bandeira}</small>}
        </span>
        <span className="cartao-m-fatura">
          <small>
            Fatura atual · vence {diaMesBR(atual.vencimento)}
          </small>
          <strong>{money(atual.valor)}</strong>
          <small>
            Fecha dia {cartao.fechamento} · melhor dia de compra: {melhor.dia}
          </small>
        </span>
      </button>

      <div className="section-card cartao-m-limite">
        <div className="cartao-m-linha">
          <span>Limite usado</span>
          <b>
            {money(resumo.usado)} de {money(resumo.limite)}
          </b>
        </div>
        <div className="bar">
          <i style={{ width: `${usado}%` }} />
        </div>
        <span className={`cartao-m-disponivel${resumo.disponivel < 0 ? " neg" : ""}`}>{money(resumo.disponivel)} disponível</span>
        {atual.pago > 0 && (
          <small className="muted">
            {atual.aPagar > 0 ? `Já pago ${money(atual.pago)} · falta ${money(atual.aPagar)}` : `Fatura atual paga antes de fechar (${money(atual.pago)})`}
          </small>
        )}
        {resumo.faturasFechadas.map((f) => (
          <FaturaFechada key={f.mes} fatura={f} />
        ))}
      </div>

      <div className="cartao-m-acoes">
        <button type="button" className="destaque" disabled={paraPagar.length === 0} onClick={() => onPagar(paraPagar[0])}>
          <CheckCircle2 size={20} />
          Pagar fatura
        </button>
        <button type="button" onClick={onCalendario}>
          <CalendarDays size={20} />
          Próximas faturas
        </button>
        <button type="button" onClick={onNovaCompra}>
          <Plus size={20} />
          Nova compra
        </button>
      </div>

      <div className="section-card cartao-m-compras">
        <h2>Nesta fatura · {rotuloMes(atual.mes)}</h2>
        {itens.length === 0 && <p className="muted">Nenhuma compra nesta fatura.</p>}
        {itens.slice(0, 5).map((p) => (
          <div className="transaction" key={`${p.compraId}-${p.numero}`}>
            <div>
              <b>{p.descricao}</b>
              <span>
                {p.categoria}
                {p.total > 1 ? ` · parcela ${p.numero} de ${p.total}` : ""}
              </span>
            </div>
            <strong>{money(p.valor)}</strong>
          </div>
        ))}
        <div className="cartao-m-rodape">
          <button type="button" className="link" onClick={onAbrir}>
            {itens.length > 5 ? `Ver as ${itens.length} compras` : "Ver detalhes do cartão"}
          </button>
          <button type="button" className="link perigo" onClick={onExcluir}>
            <Trash2 size={14} /> Excluir cartão
          </button>
        </div>
      </div>
    </section>
  );
}
