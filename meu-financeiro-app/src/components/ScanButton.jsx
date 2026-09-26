import React, { useRef, useState } from "react";
import { lerConfigIA, lerCupomComIA } from "../lib/ia.js";
import { comprimirImagem } from "../storage/cupons.js";

// Botão "Ler cupom com IA": tira/escolhe a foto, manda para a IA e devolve os campos lidos.
export default function ScanButton({ onResult, onConfigurar }) {
  const cfg = lerConfigIA();
  const entrada = useRef(null);
  const [lendo, setLendo] = useState(false);
  const [erro, setErro] = useState("");

  if (!cfg) {
    return (
      <p className="scan-off">
        📷 Para preencher pela foto do cupom, configure a IA no{" "}
        {onConfigurar ? (
          <button type="button" className="link" onClick={onConfigurar}>
            Assistente
          </button>
        ) : (
          "Assistente"
        )}
        .
      </p>
    );
  }

  async function escolher(e) {
    const arquivo = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!arquivo) return;
    setErro("");
    setLendo(true);
    try {
      const blob = await comprimirImagem(arquivo);
      const lido = await lerCupomComIA(cfg, blob);
      onResult(lido, blob);
    } catch (falha) {
      setErro(falha?.message || "Não consegui ler o cupom.");
    } finally {
      setLendo(false);
    }
  }

  return (
    <div className="scan-box">
      <button type="button" className="secondary wide-btn" onClick={() => entrada.current?.click()} disabled={lendo}>
        {lendo ? "Lendo o cupom…" : "📷 Ler cupom com IA"}
      </button>
      <input ref={entrada} type="file" accept="image/*" hidden onChange={escolher} />
      {erro && <p className="form-error">{erro}</p>}
    </div>
  );
}
