import React, { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  BellRing,
  Cloud,
  CreditCard,
  History,
  Home,
  Landmark,
  LoaderCircle,
  Moon,
  Palette,
  PiggyBank,
  PlusCircle,
  RefreshCw,
  Repeat,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  X
} from "lucide-react";
import Avatar from "./Avatar.jsx";
import { Interruptor } from "../pages/Temas.jsx";
import { nomeParaMostrar } from "../lib/perfil.js";
import { mudarAparencia, usarAparencia } from "../lib/aparencia.js";
import { aplicarAtualizacao, verificarAtualizacao } from "../lib/atualizacao.js";
import { VERSAO_DO_APP } from "../config/versao.js";

// As mesmas abas da barra de baixo + as outras telas do app + Temas e Configurações
const GRUPOS = [
  {
    titulo: "",
    itens: [
      ["home", Home, "Início"],
      ["reports", BarChart3, "Relatórios"],
      ["new", PlusCircle, "Novo lançamento"],
      ["history", History, "Histórico"],
      ["cards", CreditCard, "Cartões"],
      ["goals", Target, "Metas"]
    ]
  },
  {
    titulo: "Mais",
    itens: [
      ["bills", Repeat, "Contas fixas"],
      ["orcamentos", PiggyBank, "Orçamentos"],
      ["lembretes", BellRing, "Lembretes"],
      ["investments", TrendingUp, "Investimentos"],
      ["patrimony", Landmark, "Patrimônio"],
      ["assistant", Sparkles, "Assistente"],
      ["backup", Cloud, "Backup e nuvem"]
    ]
  },
  {
    titulo: "Aparência",
    itens: [["temas", Palette, "Temas"]],
    escuro: true
  },
  {
    titulo: "",
    itens: [["settings", Settings, "Configurações"]],
    atualizar: true
  }
];

const TEXTO_DO_RESULTADO = {
  procurando: "Procurando versão nova…",
  nova: "Versão nova encontrada! Atualizando…",
  "em-dia": "Você já está na versão mais recente.",
  offline: "Sem internet. Conecte-se e tente de novo.",
  "sem-suporte": "Recarregando para pegar a versão mais nova…",
  erro: "Não consegui verificar agora. Tente de novo em instantes."
};

export default function MenuLateral({ aberto, ativo, perfil, conta, onIr, onFechar }) {
  const fecharRef = useRef(null);
  const aparencia = usarAparencia();
  const [busca, setBusca] = useState(""); // "", "procurando" ou o resultado da verificação

  useEffect(() => {
    if (!aberto) return undefined;
    fecharRef.current?.focus();
    const tecla = (e) => {
      if (e.key === "Escape") onFechar();
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [aberto]);

  // ao fechar o menu, o aviso da última verificação some
  useEffect(() => {
    if (!aberto && busca !== "procurando" && busca !== "nova") setBusca("");
  }, [aberto]);

  async function procurarAtualizacao() {
    if (busca === "procurando" || busca === "nova") return;
    setBusca("procurando");
    const { resultado } = await verificarAtualizacao();
    setBusca(resultado);
    if (resultado === "nova") setTimeout(aplicarAtualizacao, 900);
    if (resultado === "sem-suporte") setTimeout(() => window.location.reload(), 900);
  }

  const nome = nomeParaMostrar(perfil, conta) || "Seu perfil";
  const tab = aberto ? 0 : -1;
  const ocupado = busca === "procurando" || busca === "nova";

  return (
    <div className={`drawer-root${aberto ? " aberto" : ""}`} aria-hidden={!aberto}>
      <div className="drawer-fundo" onClick={onFechar} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label="Menu">
        <div className="drawer-topo">
          <button type="button" className="drawer-perfil" onClick={() => onIr("profile")} tabIndex={tab}>
            <Avatar foto={conta?.foto} nome={perfil?.nome || conta?.nome} tamanho={42} />
            <span>
              <b>{nome}</b>
              {conta?.email && <small>{conta.email}</small>}
            </span>
          </button>
          <button
            type="button"
            ref={fecharRef}
            className="drawer-fechar"
            onClick={onFechar}
            aria-label="Fechar menu"
            tabIndex={tab}
          >
            <X size={20} />
          </button>
        </div>
        <nav className="drawer-lista">
          {GRUPOS.map((grupo, i) => (
            <div className="drawer-grupo" key={i}>
              {grupo.titulo && <div className="drawer-titulo">{grupo.titulo}</div>}
              {grupo.itens.map(([id, Icone, rotulo]) => (
                <button
                  type="button"
                  key={id}
                  className={`drawer-item${ativo === id ? " ativo" : ""}`}
                  onClick={() => onIr(id)}
                  tabIndex={tab}
                  aria-current={ativo === id ? "page" : undefined}
                >
                  <Icone size={20} strokeWidth={2.1} />
                  <span>{rotulo}</span>
                </button>
              ))}
              {grupo.escuro && (
                <div className="drawer-item drawer-linha">
                  <Moon size={20} strokeWidth={2.1} />
                  <span>Modo escuro</span>
                  <Interruptor
                    ligado={aparencia.escuro}
                    onMudar={(v) => mudarAparencia({ escuro: v })}
                    rotulo="Modo escuro"
                    tabIndex={tab}
                  />
                </div>
              )}
              {grupo.atualizar && (
                <>
                  <button
                    type="button"
                    className="drawer-item"
                    onClick={procurarAtualizacao}
                    tabIndex={tab}
                    disabled={ocupado}
                    aria-describedby="drawer-versao"
                  >
                    {ocupado ? (
                      <LoaderCircle size={20} strokeWidth={2.1} className="girando" />
                    ) : (
                      <RefreshCw size={20} strokeWidth={2.1} />
                    )}
                    <span>Verificar atualizações</span>
                  </button>
                  {busca && (
                    <p className={`drawer-busca ${busca}`} role="status">
                      {TEXTO_DO_RESULTADO[busca]}
                    </p>
                  )}
                </>
              )}
            </div>
          ))}
        </nav>
        <p className="drawer-versao" id="drawer-versao">
          Meu Financeiro · versão {VERSAO_DO_APP}
        </p>
      </aside>
    </div>
  );
}
