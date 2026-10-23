import React, { useState } from "react";
import { gerarChaveDoJarvis, lerChaveDoJarvis, salvarChaveDoJarvis } from "../lib/jarvis.js";

// Chave que deixa o Jarvis (assistente de voz do Android) gravar lançamentos sozinho neste aparelho.
// Sem chave, o Jarvis só preenche o Novo lançamento e a pessoa toca em Salvar.
export default function ChaveDoJarvis() {
  const [chave, setChave] = useState(() => lerChaveDoJarvis());
  const [aviso, setAviso] = useState("");

  function salvar(nova) {
    const ok = salvarChaveDoJarvis(nova);
    setChave(nova);
    setAviso(ok ? (nova ? "Chave salva neste aparelho." : "Chave removida: o Jarvis volta a só preencher.") : "Não consegui salvar a chave neste aparelho.");
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(chave);
      setAviso("Chave copiada. Cole no Jarvis: Sistema → Chave do Meu Financeiro.");
    } catch {
      setAviso("Não consegui copiar. Segure sobre a chave e copie.");
    }
  }

  return (
    <section className="section-card form">
      <h2 className="no-margin">Jarvis (comandos de voz)</h2>
      <p className="hint">
        Com uma chave, o Jarvis grava os lançamentos pedidos por voz sozinho. Cadastre a mesma chave no Jarvis
        (Sistema → Chave do Meu Financeiro). Sem chave, ele só preenche e você toca em Salvar.
      </p>
      <label>
        Chave deste aparelho
        <input value={chave} readOnly placeholder="Nenhuma chave: o Jarvis só preenche" />
      </label>
      {aviso && <p className="hint">{aviso}</p>}
      <div className="actions">
        <button type="button" className="primary" onClick={() => salvar(gerarChaveDoJarvis())}>
          {chave ? "Gerar outra" : "Gerar chave"}
        </button>
        {chave && (
          <button type="button" onClick={copiar}>
            Copiar
          </button>
        )}
        {chave && (
          <button type="button" onClick={() => salvar("")}>
            Remover
          </button>
        )}
      </div>
    </section>
  );
}
