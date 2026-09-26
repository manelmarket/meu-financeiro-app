import React, { useState } from "react";
import Avatar from "../components/Avatar.jsx";
import { nomeParaMostrar, primeiroNome, validarPerfil } from "../lib/perfil.js";

// Perfil da conta que está conectada (vale em todos os aparelhos dessa conta)
export default function Profile({ data, hoje, nuvem, onBack, onSave }) {
  const perfil = data.usuario || {};
  const conta = nuvem.usuario;

  const [nome, setNome] = useState(perfil.nome || conta?.nome || "");
  const [apelido, setApelido] = useState(perfil.apelido || "");
  const [telefone, setTelefone] = useState(perfil.telefone || "");
  const [nascimento, setNascimento] = useState(perfil.nascimento || "");
  const [erro, setErro] = useState("");
  const [salvo, setSalvo] = useState(false);

  function mudou(setter) {
    return (e) => {
      setter(e.target.value);
      setErro("");
      setSalvo(false);
    };
  }

  function salvar() {
    const r = validarPerfil({ nome, apelido, telefone, nascimento }, hoje);
    if (r.erro) {
      setErro(r.erro);
      return;
    }
    setNome(r.perfil.nome);
    setApelido(r.perfil.apelido);
    setTelefone(r.perfil.telefone);
    onSave(r.perfil);
    setSalvo(true);
  }

  const chamado = apelido.trim() || primeiroNome(nome) || nomeParaMostrar(perfil, conta) || "Seu nome";

  return (
    <div className="page">
      <header className="topbar with-back">
        <button className="back" onClick={onBack} aria-label="Voltar">
          ←
        </button>
        <div>
          <div className="eyebrow">Configurações</div>
          <h1>👤 Perfil</h1>
        </div>
      </header>

      <section className="section-card perfil-topo">
        <Avatar foto={conta?.foto} nome={nome} tamanho={64} />
        <div>
          <b>{chamado}</b>
          {conta?.email && <small>{conta.email}</small>}
          <small className="muted">{conta ? "Conta Google" : "Sem conta conectada"}</small>
        </div>
      </section>

      <section className="section-card form">
        <h2 className="no-margin">Seus dados</h2>
        <label>
          Nome completo
          <input value={nome} onChange={mudou(setNome)} placeholder="Ex.: Ana Souza" autoComplete="name" />
        </label>
        <label>
          Apelido (como o app chama você)
          <input
            value={apelido}
            onChange={mudou(setApelido)}
            placeholder={primeiroNome(nome) || "Ex.: Ana"}
            autoComplete="nickname"
          />
        </label>
        <label>
          Telefone
          <input
            value={telefone}
            onChange={mudou(setTelefone)}
            inputMode="tel"
            placeholder="(11) 91234-5678"
            autoComplete="tel"
          />
        </label>
        <label>
          Data de nascimento
          <input type="date" value={nascimento} onChange={mudou(setNascimento)} max={hoje} />
        </label>
        {conta?.email && (
          <label>
            E-mail (da conta Google)
            <input value={conta.email} readOnly disabled />
          </label>
        )}
        {erro && <p className="form-error">{erro}</p>}
        {salvo && <p className="hint">Perfil salvo. Ele vale para esta conta em todos os aparelhos.</p>}
        <div className="actions">
          <button type="button" className="primary" onClick={salvar}>
            Salvar
          </button>
        </div>
      </section>
    </div>
  );
}
