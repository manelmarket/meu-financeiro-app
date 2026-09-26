import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { aplicarAtualizacao, usarAtualizacao } from "../lib/atualizacao.js";

// Faixa no topo quando uma versão nova do app já foi baixada (depois de um deploy)
export default function AvisoAtualizacao() {
  const { disponivel, versaoNova } = usarAtualizacao();
  const [atualizando, setAtualizando] = useState(false);
  if (!disponivel) return null;

  return (
    <div className="aviso-atualizacao" role="status">
      <Sparkles size={18} aria-hidden="true" />
      <span>Nova versão{versaoNova ? ` ${versaoNova}` : ""} disponível</span>
      <button
        type="button"
        disabled={atualizando}
        onClick={() => {
          setAtualizando(true);
          aplicarAtualizacao();
        }}
      >
        {atualizando ? "Atualizando…" : "Atualizar"}
      </button>
    </div>
  );
}
