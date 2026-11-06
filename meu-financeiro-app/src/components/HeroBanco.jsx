import React, { useState } from "react";
import { ArrowLeftRight, Bell, CalendarCheck, Eye, EyeOff, Mic, Plus } from "lucide-react";
import { money, nomeMes } from "../lib/formato.js";
import { resumoDosBancos } from "../lib/saldos.js";
import { nomeParaMostrar, primeiroNome } from "../lib/perfil.js";

const CHAVE_ESCONDER = "meu_financeiro_esconder_valores";

function lerEscondido() {
  try {
    return localStorage.getItem(CHAVE_ESCONDER) === "1";
  } catch {
    return false;
  }
}

function saudacao(agora = new Date()) {
  const h = agora.getHours();
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}

// Topo do Início nos estilos Banco digital e Vidro: saldo dos bancos em destaque (com o olho para esconder),
// e os botões redondos de ação rápida
export default function HeroBanco({ data, perfil, conta, mes, saldoDoMes, avisos, onNotificacoes, onNew, onOpenPage }) {
  const [escondido, setEscondido] = useState(() => lerEscondido());
  const { bancos, total } = resumoDosBancos(data);
  const nome = primeiroNome(nomeParaMostrar(perfil || data.usuario, conta) || "");
  const temBancos = bancos.length > 0;
  const mostrar = (v) => (escondido ? "R$ ••••" : money(v));

  function alternar() {
    const novo = !escondido;
    setEscondido(novo);
    try {
      if (novo) localStorage.setItem(CHAVE_ESCONDER, "1");
      else localStorage.removeItem(CHAVE_ESCONDER);
    } catch {
      // vale até fechar o app
    }
  }

  const detalhe = temBancos
    ? bancos
        .slice(0, 2)
        .map((b) => `${b.banco.nome} ${mostrar(b.atual)}`)
        .join(" · ") + (bancos.length > 2 ? ` · +${bancos.length - 2}` : "")
    : `Receitas menos despesas de ${nomeMes(mes)}`;

  return (
    <section className="heroi" aria-label="Resumo">
      <div className="heroi-topo">
        <div className="heroi-ola">
          <small>{saudacao()}</small>
          <b>{nome ? `Olá, ${nome}` : "Olá!"}</b>
        </div>
        <div className="heroi-botoes">
          <button type="button" onClick={alternar} aria-label={escondido ? "Mostrar valores" : "Esconder valores"}>
            {escondido ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          <button type="button" onClick={onNotificacoes} aria-label={avisos > 0 ? `Notificações (${avisos})` : "Notificações"}>
            <Bell size={20} />
            {avisos > 0 && <i className="heroi-ponto" aria-hidden="true" />}
          </button>
        </div>
      </div>

      <button type="button" className="heroi-saldo" onClick={() => onOpenPage(temBancos ? "bancos" : "bancos")}>
        <small>{temBancos ? "Saldo nos bancos" : "Saldo do mês"}</small>
        <strong className={!temBancos && saldoDoMes < 0 ? "neg" : ""}>{mostrar(temBancos ? total : saldoDoMes)}</strong>
        <small>{temBancos ? detalhe : `${detalhe} · cadastre seus bancos`}</small>
      </button>

      <nav className="heroi-acoes" aria-label="Ações rápidas">
        <button type="button" className="destaque" onClick={onNew}>
          <span>
            <Plus size={24} strokeWidth={2.4} />
          </span>
          Lançar
        </button>
        <button type="button" onClick={() => onOpenPage("bancos")}>
          <span>
            <ArrowLeftRight size={22} />
          </span>
          Transferir
        </button>
        <button type="button" onClick={() => onOpenPage("vencimentos")}>
          <span>
            <CalendarCheck size={22} />
          </span>
          Pagar
        </button>
        <button type="button" onClick={() => onOpenPage("jarvis")}>
          <span>
            <Mic size={22} />
          </span>
          Jarvis
        </button>
      </nav>
    </section>
  );
}
