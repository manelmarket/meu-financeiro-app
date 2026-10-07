import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

const ICONE = { aviso: "⚠️", ok: "✅", info: "📅" };

// Janela "Notificações": os avisos que antes ficavam empilhados no topo do Início
// (limite do cartão, orçamento estourado, gastos acima do mês passado, conquistas, nuvem, backup...).
// avisos: [{ id, tipo, texto, cartaoId?, pagina? }]. onAbrir(aviso) leva para o lugar certo.
export default function Notificacoes({ avisos, onAbrir, onFechar }) {
  const janela = useRef(null);

  // leitor de tela e teclado começam dentro da janela
  useEffect(() => {
    janela.current?.focus({ preventScroll: true });
  }, []);

  // tecla Esc fecha (computador)
  useEffect(() => {
    function tecla(e) {
      if (e.key === "Escape") onFechar();
    }
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [onFechar]);

  return (
    <div className="modal-backdrop" onClick={onFechar}>
      <div
        className="modal notif-modal"
        ref={janela}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="notif-titulo"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pag-topo">
          <div>
            <h2 id="notif-titulo">🔔 Notificações</h2>
            <small className="muted">
              {avisos.length === 0
                ? "Tudo em ordem por aqui"
                : avisos.length === 1
                  ? "1 aviso para você"
                  : `${avisos.length} avisos para você`}
            </small>
          </div>
          <button type="button" className="pag-fechar" onClick={onFechar} aria-label="Fechar">
            <X size={18} strokeWidth={2.4} />
          </button>
        </div>

        {avisos.length === 0 ? (
          <p className="muted no-margin">Nenhum aviso no momento. 🎉</p>
        ) : (
          <div className="alerts notif-lista" aria-label="Avisos">
            {avisos.map((a) => (
              <button
                type="button"
                key={a.id}
                className={`alert ${a.tipo}`}
                onClick={() => onAbrir(a)}
                disabled={a.cartaoId == null && !a.pagina}
              >
                <span aria-hidden="true">{ICONE[a.tipo]}</span>
                <p>{a.texto}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
