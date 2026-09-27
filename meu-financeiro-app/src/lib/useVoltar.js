// Botão "voltar" do celular (e do navegador).
//
// O app é uma página só: sem isto, o voltar do celular fechava o app mesmo quando a pessoa estava
// em outra tela. Agora, fora do Início (ou com o menu ⋮ aberto) fica uma marca a mais no histórico
// do navegador; o botão voltar consome essa marca e o app volta para o Início.
// No Início (com o menu fechado), o voltar funciona como antes: sai do app.

import { useEffect, useRef } from "react";

const MARCA = "meuFinanceiroVoltar";

function temMarca() {
  try {
    return Boolean(window.history.state && window.history.state[MARCA]);
  } catch {
    return false;
  }
}

// foraDoInicio: true quando está em outra tela ou com o menu aberto
// irParaOInicio: leva para o Início (e fecha o menu)
export default function useVoltarParaOInicio(foraDoInicio, irParaOInicio) {
  const foraRef = useRef(foraDoInicio);
  foraRef.current = foraDoInicio;
  const irRef = useRef(irParaOInicio);
  irRef.current = irParaOInicio;
  // o próprio app tirou a marca (ex.: tocou em Início): o próximo "voltar" do histórico não é da pessoa
  const ignorarRef = useRef(false);

  function acertar() {
    const marca = temMarca();
    if (foraRef.current && !marca) {
      window.history.pushState({ [MARCA]: true }, "");
    } else if (!foraRef.current && marca && !ignorarRef.current) {
      ignorarRef.current = true;
      window.history.back();
    }
  }

  useEffect(() => {
    // o app abriu de novo (ex.: recarregou para atualizar) em cima da marca da vez anterior
    if (temMarca()) window.history.replaceState(null, "");

    function aoMudarHistorico() {
      if (ignorarRef.current) {
        ignorarRef.current = false;
        acertar();
        return;
      }
      // endereço com # (ex.: volta do Chrome quando não conseguiu abrir o app Android): não é o botão voltar
      if (window.location.hash) return;
      // chegou numa marca (ex.: botão avançar do navegador): só acerta
      if (temMarca()) {
        acertar();
        return;
      }
      // botão voltar
      irRef.current();
    }

    window.addEventListener("popstate", aoMudarHistorico);
    return () => window.removeEventListener("popstate", aoMudarHistorico);
  }, []);

  useEffect(() => {
    acertar();
  }, [foraDoInicio]);
}
