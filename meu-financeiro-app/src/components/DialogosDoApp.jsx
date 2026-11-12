import React, { useEffect, useRef } from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { fecharAviso, usarDialogos } from "../lib/dialogo.js";

const ICONE = { ok: CheckCircle2, erro: AlertTriangle, info: Info };

// A janela de confirmação e os avisos do app (ver lib/dialogo.js)
export default function DialogosDoApp() {
  const { pergunta, avisos } = usarDialogos();
  const botaoSim = useRef(null);
  const botaoNao = useRef(null);

  useEffect(() => {
    if (!pergunta) return undefined;
    // foco no botão seguro (Cancelar) quando é perigoso; senão no Confirmar
    (pergunta.perigo ? botaoNao : botaoSim).current?.focus();
    // Esc fecha só esta janela (não a que estiver por baixo)
    const tecla = (e) => {
      if (e.key !== "Escape") return;
      e.stopImmediatePropagation();
      e.preventDefault();
      pergunta.resolver(false);
    };
    window.addEventListener("keydown", tecla, true);
    return () => window.removeEventListener("keydown", tecla, true);
  }, [pergunta?.id]);

  return (
    <>
      {pergunta && (
        <div className="modal-backdrop dialogo-fundo" onClick={() => pergunta.resolver(false)}>
          <div
            className="modal dialogo"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={`dialogo-${pergunta.id}`}
            aria-describedby={pergunta.detalhe ? `dialogo-txt-${pergunta.id}` : undefined}
            onClick={(e) => e.stopPropagation()}
          >
            {pergunta.perigo && (
              <span className="dialogo-icone" aria-hidden="true">
                <AlertTriangle size={22} />
              </span>
            )}
            <h2 id={`dialogo-${pergunta.id}`}>{pergunta.titulo}</h2>
            {pergunta.detalhe && (
              <p id={`dialogo-txt-${pergunta.id}`} className="dialogo-texto">
                {pergunta.detalhe}
              </p>
            )}
            <div className="dialogo-botoes">
              <button type="button" ref={botaoNao} className="ghost" onClick={() => pergunta.resolver(false)}>
                Cancelar
              </button>
              <button type="button" ref={botaoSim} className={`primary${pergunta.perigo ? " perigo" : ""}`} onClick={() => pergunta.resolver(true)}>
                {pergunta.botao}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="avisos-app" aria-live="polite">
        {avisos.map((a) => {
          const Icone = ICONE[a.tipo] || Info;
          return (
            <div key={a.id} className={`aviso-app ${a.tipo}`} role="status">
              <Icone size={18} aria-hidden="true" />
              <span>{a.texto}</span>
              {a.desfazer && (
                <button
                  type="button"
                  className="aviso-desfazer"
                  onClick={() => {
                    a.desfazer();
                    fecharAviso(a.id);
                  }}
                >
                  Desfazer
                </button>
              )}
              <button type="button" className="aviso-fechar" onClick={() => fecharAviso(a.id)} aria-label="Fechar aviso">
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
