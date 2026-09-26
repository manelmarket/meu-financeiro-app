import React, { useMemo, useState } from "react";
import MonthPicker from "../components/MonthPicker.jsx";
import { mesDaData, nomeMes } from "../lib/formato.js";
import { analiseDoMes, resumoParaIA } from "../lib/analise.js";
import {
  PROVEDORES,
  analisarComIA,
  lerConfigIA,
  modeloDe,
  removerConfigIA,
  salvarConfigIA,
  testarIA
} from "../lib/ia.js";

export const ICONE_FRASE = { aviso: "⚠️", ok: "✅", dica: "💡", info: "📌" };

function ConfigIA({ config, onChange }) {
  const [provedor, setProvedor] = useState(config?.provedor || "gemini");
  const [chave, setChave] = useState(config?.chave || "");
  const [modelo, setModelo] = useState(config?.modelo || "");
  const [mostrar, setMostrar] = useState(false);
  const [status, setStatus] = useState(null); // { tipo: "ok" | "erro" | "info", texto }
  const [testando, setTestando] = useState(false);

  function escolherProvedor(id) {
    setProvedor(id);
    // cada IA tem a sua chave: ao trocar, volta a chave salva dessa IA (ou deixa em branco)
    setChave(config?.provedor === id ? config.chave : "");
    setModelo(config?.provedor === id ? config.modelo || "" : "");
    setStatus(null);
  }

  function salvar() {
    const valor = chave.trim();
    if (!valor) {
      setStatus({ tipo: "erro", texto: "Cole a chave de API antes de salvar." });
      return null;
    }
    if (provedor === "claude" && valor.startsWith("AIza")) {
      setStatus({ tipo: "erro", texto: "Essa chave é do Google Gemini. Escolha Gemini acima ou cole uma chave da Anthropic (começa com sk-ant-)." });
      return null;
    }
    if (provedor === "gemini" && valor.startsWith("sk-ant-")) {
      setStatus({ tipo: "erro", texto: "Essa chave é da Anthropic (Claude). Escolha Claude acima ou cole uma chave do Google (começa com AIza)." });
      return null;
    }
    const cfg = { provedor, chave: chave.trim(), modelo: modelo.trim() };
    salvarConfigIA(cfg);
    onChange(cfg);
    setStatus({ tipo: "ok", texto: "Configuração salva neste aparelho." });
    return cfg;
  }

  async function testar() {
    const cfg = salvar();
    if (!cfg) return;
    setTestando(true);
    setStatus({ tipo: "info", texto: "Testando a conexão com a IA…" });
    try {
      await testarIA(cfg);
      setStatus({ tipo: "ok", texto: `Tudo certo! ${PROVEDORES[cfg.provedor].nome} respondeu (${modeloDe(cfg)}).` });
    } catch (erro) {
      setStatus({ tipo: "erro", texto: erro.message });
    } finally {
      setTestando(false);
    }
  }

  function remover() {
    if (!window.confirm("Remover a chave de IA deste aparelho?")) return;
    removerConfigIA();
    setChave("");
    setModelo("");
    onChange(null);
    setStatus({ tipo: "info", texto: "Chave removida." });
  }

  return (
    <section className="section-card form">
      <h2>Configurar IA</h2>

      <div className="segmented">
        {Object.entries(PROVEDORES).map(([id, p]) => (
          <button
            type="button"
            key={id}
            className={provedor === id ? "selected info" : ""}
            onClick={() => escolherProvedor(id)}
          >
            {p.nome.replace("Google ", "").replace("Anthropic ", "")}
          </button>
        ))}
      </div>
      <p className="hint">
        {PROVEDORES[provedor].nome}: {PROVEDORES[provedor].detalhe}. Pegue a chave em {PROVEDORES[provedor].ondePegar}.
      </p>

      <label>
        Chave de API
        <div className="input-row">
          <input
            type={mostrar ? "text" : "password"}
            value={chave}
            onChange={(e) => setChave(e.target.value)}
            placeholder={provedor === "gemini" ? "AIza..." : "sk-ant-..."}
            autoComplete="off"
          />
          <button type="button" className="ghost small-btn" onClick={() => setMostrar((v) => !v)}>
            {mostrar ? "Ocultar" : "Mostrar"}
          </button>
        </div>
      </label>

      <label>
        Modelo (opcional)
        <input value={modelo} onChange={(e) => setModelo(e.target.value)} placeholder={PROVEDORES[provedor].modeloPadrao} />
      </label>

      <p className="muted small">
        A chave fica guardada só neste aparelho. Ao usar a IA, os valores do mês (ou a foto do cupom) são enviados para o
        provedor escolhido.
      </p>

      {status && <p className={status.tipo === "erro" ? "form-error" : "hint"}>{status.texto}</p>}

      <div className="actions wrap">
        {config && (
          <button type="button" className="ghost" onClick={remover}>
            Remover
          </button>
        )}
        <button type="button" className="secondary" onClick={salvar}>
          Salvar
        </button>
        <button type="button" className="primary" onClick={testar} disabled={testando}>
          {testando ? "Testando…" : "Salvar e testar"}
        </button>
      </div>
    </section>
  );
}

export default function Assistant({ data, hoje, onBack }) {
  const mesHoje = mesDaData(hoje);
  const [mes, setMes] = useState(mesHoje);
  const [config, setConfig] = useState(() => lerConfigIA());
  const [resultado, setResultado] = useState(null); // { mes, frases }
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const frases = useMemo(() => analiseDoMes(data, mes, hoje), [data, mes, hoje]);

  async function analisar() {
    setErro("");
    setCarregando(true);
    try {
      const lista = await analisarComIA(config, resumoParaIA(data, mes, hoje));
      setResultado({ mes, frases: lista });
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="page">
      <header className="topbar with-back">
        <button className="back" onClick={onBack} aria-label="Voltar">
          ←
        </button>
        <div>
          <div className="eyebrow">Inteligência financeira</div>
          <h1>✨ Assistente</h1>
        </div>
      </header>

      <MonthPicker mes={mes} mesHoje={mesHoje} onChange={setMes} />

      <section className="section-card">
        <div className="section-title">
          <h2 className="no-margin">Análise de {nomeMes(mes)}</h2>
          <span className="muted small">automática</span>
        </div>
        <ul className="insights">
          {frases.map((f, i) => (
            <li key={i} className={`insight ${f.tipo}`}>
              <span aria-hidden="true">{ICONE_FRASE[f.tipo]}</span>
              <p>{f.texto}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="section-card">
        <div className="section-title">
          <h2 className="no-margin">Análise com IA</h2>
          {config && <span className="muted small">{PROVEDORES[config.provedor].nome}</span>}
        </div>
        {!config ? (
          <p className="muted">Configure a IA logo abaixo para pedir uma análise mais completa do mês.</p>
        ) : (
          <>
            <button type="button" className="primary wide-btn" onClick={analisar} disabled={carregando}>
              {carregando ? "Analisando…" : `✨ Analisar ${nomeMes(mes)} com IA`}
            </button>
            {erro && <p className="form-error">{erro}</p>}
            {resultado && resultado.mes === mes && (
              <ul className="insights ai">
                {resultado.frases.map((f, i) => (
                  <li key={i} className="insight ia">
                    <span aria-hidden="true">✨</span>
                    <p>{f}</p>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>

      <ConfigIA config={config} onChange={setConfig} />
    </div>
  );
}
