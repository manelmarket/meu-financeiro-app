// Mantém os lembretes do celular em dia: enquanto o app Android estiver conectado pelo canal de
// mensagens, toda mudança nos cartões, nas contas fixas ou nos ajustes vai para o celular sozinha.

import { useEffect, useRef } from "react";
import { pedirAoApp, usarPonteAndroid } from "./appAndroid.js";
import { assinaturaDasRegras, lerAjustes, montarAgenda, mudarAjustes, usarAjustes } from "./lembretes.js";

export default function useLembretesNoCelular(dados, habilitado) {
  const ponte = usarPonteAndroid();
  const ajustes = usarAjustes();
  const enviada = useRef("");
  const conferida = useRef(0);

  // cada vez que o canal abre, vale o que está no celular (ligado ou desligado)
  useEffect(() => {
    if (ponte.situacao !== "conectado" || !ponte.app || conferida.current === ponte.conexao) return;
    conferida.current = ponte.conexao;
    enviada.current = "";
    if (ponte.app.ativos !== lerAjustes().ativo) mudarAjustes({ ativo: ponte.app.ativos });
  }, [ponte.situacao, ponte.conexao]);

  useEffect(() => {
    if (!habilitado || ponte.situacao !== "conectado" || !ajustes.ativo) return undefined;
    const agenda = montarAgenda(dados, ajustes);
    const texto = JSON.stringify(agenda);
    if (texto === enviada.current) return undefined;
    const tempo = setTimeout(() => {
      pedirAoApp("agenda", { lembretes: agenda })
        .then((r) => {
          if (!r.ok) return;
          enviada.current = texto;
          mudarAjustes({ enviadoEm: Date.now(), assinatura: assinaturaDasRegras(dados, ajustes) });
        })
        .catch(() => {
          // sem resposta: tenta de novo na próxima mudança ou quando o canal abrir de novo
        });
    }, 800);
    return () => clearTimeout(tempo);
  }, [
    habilitado,
    ponte.situacao,
    ponte.conexao,
    dados,
    ajustes.ativo,
    ajustes.dias,
    ajustes.hora,
    ajustes.faturas,
    ajustes.contas
  ]);
}
