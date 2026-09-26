import React, { useState } from "react";
import { contarDados, descreverContagem } from "../lib/backup.js";

// Pergunta antes de sair da conta neste aparelho
export function sairComConfirmacao(nuvem) {
  const ok = window.confirm(
    "Sair da conta neste aparelho?\n\nSeus dados continuam guardados na nuvem. Para usar o app de novo, é só entrar com a sua conta Google."
  );
  if (ok) nuvem.sair();
}

// Primeira vez em um aparelho que já tinha dados próprios, numa conta que também já tem dados na nuvem
export default function EscolhaNuvem({ nuvem, data }) {
  const [enviando, setEnviando] = useState(false);
  if (!nuvem.escolha) return null;

  const naNuvem = descreverContagem(contarDados(nuvem.escolha.remoto));
  const aqui = descreverContagem(contarDados(data));

  async function escolher(opcao) {
    const perguntas = {
      nuvem:
        "Usar só os dados da nuvem?\n\nOs dados deste aparelho serão trocados pelos da nuvem. Uma cópia de segurança dos dados deste aparelho fica guardada aqui.",
      aparelho:
        "Usar só os dados deste aparelho?\n\nOs dados da nuvem serão trocados pelos deste aparelho. Uma cópia de segurança dos dados da nuvem fica guardada aqui."
    };
    if (perguntas[opcao] && !window.confirm(perguntas[opcao])) return;
    setEnviando(true);
    try {
      await nuvem.escolher(opcao);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <div className="choice">
        <p>
          <b>Sua conta já tem dados na nuvem</b>, e este aparelho também tem dados diferentes. O que você quer fazer?
        </p>
        <p className="muted small">
          Na nuvem: {naNuvem}.
          <br />
          Neste aparelho: {aqui}.
        </p>
        {nuvem.mensagem && <p className="form-error">{nuvem.mensagem}</p>}
        <button type="button" className="primary wide-btn" disabled={enviando} onClick={() => escolher("juntar")}>
          Juntar os dois (recomendado)
        </button>
        <small>Fica tudo: os registros da nuvem e os deste aparelho.</small>
        <button type="button" className="secondary wide-btn" disabled={enviando} onClick={() => escolher("nuvem")}>
          Usar só os da nuvem
        </button>
        <small>Os dados deste aparelho são trocados pelos da nuvem.</small>
        <button type="button" className="ghost wide-btn" disabled={enviando} onClick={() => escolher("aparelho")}>
          Usar só os deste aparelho
        </button>
        <small>Os dados da nuvem são trocados pelos deste aparelho.</small>
      </div>
      <button type="button" className="link small" onClick={() => sairComConfirmacao(nuvem)}>
        Cancelar e sair da conta
      </button>
    </>
  );
}
