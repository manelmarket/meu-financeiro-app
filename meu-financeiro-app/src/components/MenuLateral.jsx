import React, { useEffect, useRef } from "react";
import {
  BarChart3,
  Cloud,
  CreditCard,
  History,
  Home,
  Landmark,
  PlusCircle,
  Repeat,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  X
} from "lucide-react";
import Avatar from "./Avatar.jsx";
import { nomeParaMostrar } from "../lib/perfil.js";

// As mesmas abas da barra de baixo + as outras telas do app + Configurações
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
      ["investments", TrendingUp, "Investimentos"],
      ["patrimony", Landmark, "Patrimônio"],
      ["assistant", Sparkles, "Assistente"],
      ["backup", Cloud, "Backup e nuvem"]
    ]
  },
  {
    titulo: "",
    itens: [["settings", Settings, "Configurações"]]
  }
];

export default function MenuLateral({ aberto, ativo, perfil, conta, onIr, onFechar }) {
  const fecharRef = useRef(null);

  useEffect(() => {
    if (!aberto) return undefined;
    fecharRef.current?.focus();
    const tecla = (e) => {
      if (e.key === "Escape") onFechar();
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [aberto]);

  const nome = nomeParaMostrar(perfil, conta) || "Seu perfil";

  return (
    <div className={`drawer-root${aberto ? " aberto" : ""}`} aria-hidden={!aberto}>
      <div className="drawer-fundo" onClick={onFechar} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label="Menu">
        <div className="drawer-topo">
          <button type="button" className="drawer-perfil" onClick={() => onIr("profile")} tabIndex={aberto ? 0 : -1}>
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
            tabIndex={aberto ? 0 : -1}
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
                  tabIndex={aberto ? 0 : -1}
                  aria-current={ativo === id ? "page" : undefined}
                >
                  <Icone size={20} strokeWidth={2.1} />
                  <span>{rotulo}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>
    </div>
  );
}
