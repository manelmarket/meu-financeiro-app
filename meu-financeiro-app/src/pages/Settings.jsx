import React from "react";
import { ChevronRight, Cloud, LogOut, RotateCcw } from "lucide-react";
import Avatar from "../components/Avatar.jsx";
import { sairComConfirmacao } from "../components/EscolhaNuvem.jsx";
import { nomeParaMostrar } from "../lib/perfil.js";

// Configurações: perfil da conta, backup/nuvem, dados deste aparelho e sair da conta.
export default function Settings({ data, nuvem, onBack, onIr, onResetar }) {
  const perfil = data.usuario || {};
  const conta = nuvem.usuario;
  const nome = nomeParaMostrar(perfil, conta) || "Seu perfil";

  return (
    <div className="page">
      <header className="topbar with-back">
        <button className="back" onClick={onBack} aria-label="Voltar">
          ←
        </button>
        <div>
          <div className="eyebrow">Ajustes</div>
          <h1>⚙️ Configurações</h1>
        </div>
      </header>

      <section className="section-card">
        <h2>Perfil</h2>
        <button type="button" className="settings-item perfil" onClick={() => onIr("profile")}>
          <Avatar foto={conta?.foto} nome={perfil.nome || conta?.nome} tamanho={48} />
          <span className="settings-text">
            <b>{nome}</b>
            {conta?.email && <small>{conta.email}</small>}
            <small className="settings-link">Editar nome, apelido, telefone e nascimento</small>
          </span>
          <ChevronRight size={20} className="settings-seta" />
        </button>
      </section>

      <section className="section-card">
        <h2>Dados</h2>
        <button type="button" className="settings-item" onClick={() => onIr("backup")}>
          <Cloud size={20} className="settings-icone" />
          <span className="settings-text">
            <b>Backup e nuvem</b>
            <small>Sincronização e backup em arquivo</small>
          </span>
          <ChevronRight size={20} className="settings-seta" />
        </button>
        <button type="button" className="settings-item perigo" onClick={onResetar}>
          <RotateCcw size={20} className="settings-icone" />
          <span className="settings-text">
            <b>Restaurar dados de demonstração</b>
            <small>
              Este aparelho{conta ? " sai da sua conta e" : ""} volta aos dados de exemplo.
              {conta ? " Seus dados na nuvem continuam guardados." : ""}
            </small>
          </span>
        </button>
      </section>

      {conta && (
        <button type="button" className="ghost wide sair-conta" onClick={() => sairComConfirmacao(nuvem)}>
          <LogOut size={18} /> Sair da conta
        </button>
      )}
    </div>
  );
}
